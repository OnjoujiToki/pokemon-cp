'use client';

import { useEffect, useState, Suspense } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { auth } from '@/lib/firebase/config';
import { getUserProfile } from '@/lib/firebase/profile';
import { getCodeforcesUserInfo, getCodeforcesUserSubmissions } from '@/lib/services/codeforces';
import { Trophy, Star, BarChart2, Award, LayoutDashboard } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Loading from './loading';
// Create separate components for each section
const UserStats = ({ cfStats }: { cfStats: any }) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Rating</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cfStats.user.rating || 'Unrated'}</div>
          <p className="text-xs text-muted-foreground">
            Max: {cfStats.user.maxRating || 'N/A'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Rank</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">{cfStats.user.rank || 'Unrated'}</div>
          <p className="text-xs text-muted-foreground">
            Max: {cfStats.user.maxRank || 'N/A'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cfStats.submissions.totalSolved}</div>
        </CardContent>
      </Card>
    </div>
  );
};

const ProblemDistribution = ({ cfStats }: { cfStats: any }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">Problem Distribution</CardTitle>
        <BarChart2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Object.entries(cfStats.submissions.ratingDistribution)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([rating, count]) => ({
                rating: Number(rating),
                count: count as number
              }))}>
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count">
                {Object.entries(cfStats.submissions.ratingDistribution)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([rating], index) => {
                    const ratingNum = Number(rating);
                    let color = '#808080'; // gray for < 1200
                    if (ratingNum >= 2900) color = '#FF0000';
                    else if (ratingNum >= 2400) color = '#FF0000';
                    else if (ratingNum >= 2300) color = '#FF8C00';
                    else if (ratingNum >= 1900) color = '#AA00AA';
                    else if (ratingNum >= 1600) color = '#0000FF';
                    else if (ratingNum >= 1400) color = '#03A9F4';
                    else if (ratingNum >= 1200) color = '#008000';
                    
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [cfStats, setCfStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { profile } = await getUserProfile(user.uid);
        if (profile?.codeforcesHandle) {
          const [userInfo, submissions] = await Promise.all([
            getCodeforcesUserInfo(profile.codeforcesHandle),
            getCodeforcesUserSubmissions(profile.codeforcesHandle)
          ]);

          if (userInfo.error || submissions.error) {
            setError('Failed to load Codeforces data');
            return;
          }

          setCfStats({
            user: userInfo.user,
            submissions: submissions.stats
          });
        }
      } catch (err) {
        setError('An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <p className="text-red-500">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <LayoutDashboard className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
            <p className="text-muted-foreground">
              {cfStats?.user ? (
                `Welcome back, ${cfStats.user.handle}`
              ) : (
                'Track your progress and achievements'
              )}
            </p>
          </div>
        </div>
      </div>
      
      {cfStats ? (
        <>
          <Suspense fallback={<div>Loading stats...</div>}>
            <UserStats cfStats={cfStats} />
          </Suspense>

          <Suspense fallback={<div>Loading distribution...</div>}>
            <ProblemDistribution cfStats={cfStats} />
          </Suspense>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold">Set Up Your Dashboard</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Please set your Codeforces handle in your profile to view statistics.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}