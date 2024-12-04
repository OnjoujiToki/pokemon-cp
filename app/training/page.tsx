'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dumbbell } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Plus, Check } from "lucide-react";
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from '@/lib/hooks/useAuth';
import Loading from './loading';
import { getTrainingProblems, addTrainingProblem, removeTrainingProblem, markProblemAsSolved } from '@/lib/services/training';
import { getUserProfile } from '@/lib/firebase/profile';
import { getCodeforcesUserSubmissions } from '@/lib/services/codeforces';
import { generatePokemonByDifficulty, addPokemonToQueue } from '@/lib/services/pokemon';
import { Pagination } from "@/components/ui/pagination";
import { Trash2 } from "lucide-react";
import { addGold } from '@/lib/services/inventory';
import { GoldDisplay } from "@/components/ui/gold-display";
import { getUserInventory } from "@/lib/services/inventory";
import { Switch } from "@/components/ui/switch";


interface TrainingProblem {
  id: string;
  contestId: number;
  index: string;
  name: string;
  rating?: number;
  addedAt: Date;
  tags?: string[];
}
export default function TrainingPage() {
  const router = useRouter();
  const [gold, setGold] = useState(0);
  const { user, loading: authLoading } = useAuth();
  const [problems, setProblems] = useState<TrainingProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [problemInput, setProblemInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const problemsPerPage = 10;
  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = problems.slice(indexOfFirstProblem, indexOfLastProblem);
  const [showTags, setShowTags] = useState(false);

  useEffect(() => {
    const loadProblems = async () => {
      if (!user) return;
      
      const { problems, error } = await getTrainingProblems(user.uid);
      if (error) {
        toast.error('Failed to load training problems.');
        return;
      }
      
      console.log('Raw problems from Firestore:', problems);
      setProblems(problems);
      setLoading(false);
    };

    if (user) {
      loadProblems();
    }
  }, [user]);
  useEffect(() => {
    const loadGold = async () => {
      if (!user) return;
      const { profile, error } = await getUserProfile(user.uid);
      if (!error && profile) {
        setGold(profile.gold);
      }
    };
  
    if (user) {
      loadGold();
    }
  }, [user]);
  const parseProblemInput = (input: string) => {
    const match = input.match(/^(\d+)\s*([A-Z]\d?)$/i);
    if (!match) {
      toast.error('Invalid problem format. Please use format like "123A" or "123 A"');
      return null;
    }
    return {
      contestId: parseInt(match[1]),
      index: match[2].toUpperCase()
    };
  };
  const addProblem = async () => {
    if (!user) {
      toast.error('Please log in first');
      return;
    }
  
    const parsed = parseProblemInput(problemInput);
    if (!parsed) return;
  
    try {
      // Check if problem already exists in training list
      const problemId = `${parsed.contestId}${parsed.index}`;
      if (problems.some(p => p.id === problemId)) {
        toast.error('This problem is already in your training list');
        return;
      }
  
      // Fetch problem info from Codeforces
      const response = await fetch(`https://codeforces.com/api/problemset.problems`);
      const data = await response.json();
      
      if (data.status !== 'OK') {
        toast.error('Failed to fetch problem information');
        return;
      }
  
      const problem = data.result.problems.find(
        (p: any) => p.contestId === parsed.contestId && p.index === parsed.index
      );
  
      if (!problem) {
        toast.error('Problem not found');
        return;
      }
  
      const newProblem: TrainingProblem = {
        id: `${problem.contestId}${problem.index}`,
        contestId: problem.contestId,
        index: problem.index,
        name: problem.name,
        rating: problem.rating,
        addedAt: new Date()
      };
  
      const { error } = await addTrainingProblem(user.uid, newProblem);
      if (error) {
        toast.error("Failed to add problem. Maybe you have already solved it?");
        return;
      }
  
      setProblems(prev => [newProblem, ...prev]);
      setProblemInput('');
      toast.success('Problem added to training list');
    } catch (error) {
      toast.error('Failed to add problem');
    }
  };

  const handleSolved = async (problemId: string) => {
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

      const { stats, error } = await getCodeforcesUserSubmissions(profile.codeforcesHandle);
      if (error) {
        toast.error(error);
        return;
      }

      const problem = problems.find(p => p.id === problemId);
      if (!problem) {
        toast.error('Problem not found');
        return;
      }

      const cfProblemId = `${problem.contestId}${problem.index}`;
      if (stats?.solvedProblems.has(cfProblemId)) {
        const difficulty = Math.floor((problem?.rating || 800) / 500) + 1;
        const goldEarned = problem.rating || 800;

        // Mark problem as solved first
        const { error: solveError } = await markProblemAsSolved(user.uid, problemId);
        if (solveError) {
          toast.error('Failed to mark problem as solved');
          return;
        }

        // Generate and add rewards
        const randomPokemon = await generatePokemonByDifficulty(
          Math.min(difficulty, 3), 
          problem.tags
        );

        await Promise.all([
          addPokemonToQueue(user.uid, randomPokemon),
          addGold(user.uid, goldEarned)
        ]);

        // Update UI
        setProblems(problems.filter(p => p.id !== problemId));
        toast.success(`Problem solved! Earned ${goldEarned} gold and a new Pokémon has been added to your queue.`);
      } else {
        toast.error('You have not solved this problem yet on Codeforces. Please solve it first!');
      }
    } catch (err) {
      console.error('Error in handleSolved:', err);
      toast.error('Failed to verify problem solution');
    }
  };

  if (authLoading || loading) return <Loading />;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Training Problems</h1>
            <p className="text-muted-foreground">Track and solve problems to earn rewards</p>
          </div>
        </div>
        <GoldDisplay amount={gold} className="scale-110" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex gap-2 w-full md:w-auto">
            <Input
            placeholder="Enter problem (e.g., 123A)"
            value={problemInput}
            onChange={(e) => setProblemInput(e.target.value)}
            className="md:w-64"
            />
            <Button onClick={addProblem}>
            <Plus className="h-4 w-4" />
            Add
            </Button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-tags"
              checked={showTags}
              onCheckedChange={setShowTags}
            />
            <label htmlFor="show-tags" className="text-sm font-medium">
              Show Tags
            </label>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableCaption>Your training problem list</TableCaption>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50%]">Problem</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentProblems.map((problem) => (
              <TableRow key={problem.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex flex-col gap-1">
            
                    <a 
                      href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                      target="_blank"
                      rel="noopener noreferrer"
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
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={getProblemRatingColor(problem.rating)}
                  >
                    {problem.rating || 'Unrated'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(problem.addedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                    <Button 
                        onClick={() => handleSolved(problem.id)}
                        size="sm"
                        variant="default"
                        className="gap-2"
                    >
                        <Check className="h-4 w-4" />
                        Mark Solved
                    </Button>
                    <Button 
                        onClick={async () => {
                        if (!user) {
                            toast.error('Please log in first');
                            return;
                        }
                        const { error } = await removeTrainingProblem(user.uid, problem.id);
                        if (error) {
                            toast.error('Failed to remove from training list');
                            return;
                        }
                        setProblems(problems.filter(p => p.id !== problem.id));
                        toast.success('Removed from training list');
                        }}
                        size="sm"
                        variant="destructive"
                        className="gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Remove
                    </Button>
                    </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex justify-center mt-6">
        <Pagination
          problemsPerPage={10}
          totalProblems={problems.length}
          paginate={setCurrentPage}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}

function getProblemRatingColor(rating?: number): string {
  if (!rating) return 'text-gray-500 border-gray-500';
  if (rating >= 2400) return 'text-red-500 border-red-500';
  if (rating >= 2300) return 'text-orange-500 border-orange-500';
  if (rating >= 1900) return 'text-violet-500 border-violet-500';
  if (rating >= 1600) return 'text-blue-500 border-blue-500';
  if (rating >= 1400) return 'text-cyan-500 border-cyan-500';
  if (rating >= 1200) return 'text-green-500 border-green-500';
  return 'text-gray-500 border-gray-500';
}