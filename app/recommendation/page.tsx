'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { auth } from '@/lib/firebase/config';
import { getUserProfile } from '@/lib/firebase/profile';
import { getCodeforcesUserSubmissions, getCodeforcesUserInfo } from '@/lib/services/codeforces';
import { addPokemonToQueue, generatePokemonByDifficulty } from '@/lib/services/pokemon';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from '@/lib/hooks/useAuth';
import Loading from './loading';
import { DifficultyRangeFilter } from '@/components/DifficultyRangeFilter';
import { Card } from "@/components/ui/card";
import { ExternalLink, Plus, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { addTrainingProblem } from '@/lib/services/training';
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { checkAndUpdateAchievements } from '@/lib/services/achievements';


interface CodeforcesProblem {
  contestId: number;
  index: string;
  rating?: number;
  name: string;
  tags?: string[];
}

export default function RecommendationsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [problems, setProblems] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const problemsPerPage = 10;
    const [showTags, setShowTags] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [minRating, setMinRating] = useState(800);
    const [maxRating, setMaxRating] = useState(4000);
    const [userRating, setUserRating] = useState<number>(0);
    const [expandedView, setExpandedView] = useState(false);
    const initialProblemsToShow = 10;
    const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
  
    const loadRecommendations = async (min = minRating, max = maxRating) => {
      if (!user) return;
  
      setLoading(true);
      const { profile, error } = await getUserProfile(user.uid);
      if (error || !profile?.codeforcesHandle) {
        setError('Please set your Codeforces handle in your profile.');
        setLoading(false);
        return;
      }
  
      try {
        const { stats, error: submissionsError } = await getCodeforcesUserSubmissions(profile.codeforcesHandle);
        if (submissionsError) throw new Error(submissionsError);
  
        const { user: userInfo } = await getCodeforcesUserInfo(profile.codeforcesHandle);
        const rating = userInfo?.rating || 800;
        setUserRating(rating);
  
        const recommendedMin = Math.max(800, rating - 200);
        const recommendedMax = rating + 300;
        setMinRating(recommendedMin);
        setMaxRating(recommendedMax);
  
        setSolvedProblems(stats?.solvedProblems || new Set());
        const recommendedProblems = await fetchRecommendedProblems(
          rating,
          stats?.solvedProblems || new Set(),
          recommendedMin,
          recommendedMax
        );
  
        setProblems((recommendedProblems || []).map((problem: CodeforcesProblem) => ({ 
          ...problem,
          id: `${problem.contestId}${problem.index}`
        })));
      } catch (err) {
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      if (user) {
        loadRecommendations();
      }
    }, [user]);

  const fetchRecommendedProblems = async (rating: number, solvedProblems: Set<string>, min = minRating, max = maxRating) => {
    try {
      const response = await fetch('https://codeforces.com/api/problemset.problems');
      const data = await response.json();
      
      if (data.status === 'OK') {
        const problems = data.result.problems
          .filter((problem: CodeforcesProblem) => {
            const problemId = `${problem.contestId}${problem.index}`;
            return (
              problem.rating && 
              !solvedProblems.has(problemId) && 
              problem.rating >= min && 
              problem.rating <= max
            );
          })
          .map((problem: CodeforcesProblem) => ({
            ...problem,
            tags: [...new Set(problem.tags || [])]
          }));

        return problems
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);
      }
    } catch (error) {
      console.error('Error fetching recommended problems:', error);
      return [];
    }
  };

  const handleSolved = async (problemId: string) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Please log in first');
      return;
    }

    try {
      const { profile, error: profileError } = await getUserProfile(user.uid);
      if (profileError || !profile?.codeforcesHandle) {
        toast.error('Please set your Codeforces handle in your profile');
        return;
      }

      console.log('Checking solution for problem:', problemId);
      const { stats, error } = await getCodeforcesUserSubmissions(profile.codeforcesHandle);
      if (error) {
        toast.error(error);
        return;
      }
      
      if (!stats?.solvedProblems) {
        console.log('No solved problems found:', stats);
        toast.error('Failed to verify solved problems');
        return;
      }

      // Find the problem in our list
      const problem = problems.find(p => p.id === problemId);
      if (!problem) {
        console.log('Problem not found:', problemId);
        toast.error('Problem not found');
        return;
      }

      // Format the problem ID to match Codeforces format
      const cfProblemId = `${problem.contestId}${problem.index}`;
      console.log('Checking if problem is solved:', cfProblemId);
      console.log('Solved problems:', Array.from(stats.solvedProblems));

      // Add this line to debug the comparison
      console.log('Has solved?', stats.solvedProblems.has(cfProblemId));

      if (stats.solvedProblems.has(cfProblemId)) {
        const difficulty = Math.floor((problem?.rating || 800) / 500) + 1;
        const randomPokemon = await generatePokemonByDifficulty(Math.min(difficulty, 3));
        await addPokemonToQueue(user.uid, randomPokemon);
        toast.success('Problem solved! A new Pokémon has been added to your queue.');
        setProblems(problems.filter(p => p.id !== problemId));
        await checkAndUpdateAchievements(user.uid);
      } else {
        toast.error('You have not solved this problem yet on Codeforces. Please solve it first!');
      }
    } catch (err) {
      console.error('Error in handleSolved:', err);
      toast.error('Failed to verify problem solution');
    }
  };

  const handleFilterChange = async (min: number, max: number) => {
    setMinRating(min);
    setMaxRating(max);
    setLoading(true);
    try {
      const { profile } = await getUserProfile(user?.uid || '');
      if (profile?.codeforcesHandle) {
        const { stats } = await getCodeforcesUserSubmissions(profile.codeforcesHandle);
        const newProblems = await fetchRecommendedProblems(
          userRating,
          stats?.solvedProblems || new Set(),
          min,
          max
        );
        setProblems((newProblems || []).map((problem: CodeforcesProblem) => ({
          ...problem,
          id: `${problem.contestId}${problem.index}`
        })));
      }
    } catch (error) {
      toast.error('Failed to update problems');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToTraining = async (problem: CodeforcesProblem) => {
    if (!user) {
      toast.error('Please log in first');
      return;
    }

    const trainingProblem = {
      id: `${problem.contestId}${problem.index}`,
      contestId: problem.contestId,
      index: problem.index,
      name: problem.name,
      rating: problem.rating,
      tags: problem.tags || [],
      addedAt: new Date()
    };

    console.log('Adding problem with tags:', trainingProblem);

    const { error } = await addTrainingProblem(user.uid, trainingProblem);
    if (error) {
      toast.error(error);
      return;
    }

    toast.success('Added to training list');
    setProblems(problems.filter(p => p.id !== trainingProblem.id));
  };

  if (authLoading || loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Lightbulb className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recommended Problems</h1>
            <p className="text-muted-foreground">
              Based on your rating: {userRating} ({minRating} - {maxRating})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <DifficultyRangeFilter
            onFilterChange={handleFilterChange}
            initialMinRating={minRating}
            initialMaxRating={maxRating}
          />
          <Switch
            id="show-tags"
            checked={showTags}
            onCheckedChange={setShowTags}
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableCaption>A curated list of Codeforces problems matching your skill level.</TableCaption>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50%]">Problem</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {problems
              .slice(0, expandedView ? undefined : initialProblemsToShow)
              .map((problem) => (
                <TableRow key={problem.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <a
                        href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                        target="_blank"
                        className="text-primary hover:underline flex items-center gap-2"
                      >
                        {problem.name}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      {showTags && problem.tags && (
                        <div className="flex flex-wrap gap-1">
                          {[...new Set(problem.tags)].map((tag) => (
                            <Badge
                              key={tag as string} 
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag as string}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getProblemRatingColor(problem.rating || 0)}
                    >
                      {problem.rating || 'Unrated'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      onClick={() => handleAddToTraining(problem)} 
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add to Training
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>

      {problems.length > initialProblemsToShow && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => setExpandedView(!expandedView)}
          >
            {expandedView ? 'Show Less' : `Show ${problems.length - initialProblemsToShow} More`}
          </Button>
        </div>
      )}
    </div>
  );
}

function getProblemRatingColor(rating: number): string {
  if (rating >= 2400) return 'text-red-500 border-red-500';         // Grandmaster and above
  if (rating >= 2300) return 'text-orange-500 border-orange-500';   // International Master
  if (rating >= 1900) return 'text-violet-500 border-violet-500';   // Candidate Master
  if (rating >= 1600) return 'text-blue-500 border-blue-500';       // Expert
  if (rating >= 1400) return 'text-cyan-500 border-cyan-500';       // Specialist
  if (rating >= 1200) return 'text-green-500 border-green-500';     // Pupil
  return 'text-gray-500 border-gray-500';                           // Newbie
}