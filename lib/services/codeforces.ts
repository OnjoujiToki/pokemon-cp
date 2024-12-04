import { cache } from 'react'

export interface CodeforcesUser {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
}

interface ProblemResult {
  id: string;
  contestId: number;
  rating?: number;
  tags: string[];
}

interface CacheData<T> {
  data: T;
  timestamp: number;
}

interface Stats {
  solvedProblems: any;
  // add other stats properties as needed
}

const getFromCache = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached) as CacheData<T>;
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        if (
          typeof data === 'object' && 
          data !== null && 
          'stats' in data &&
          typeof data.stats === 'object' &&
          data.stats !== null &&
          'solvedProblems' in data.stats
        ) {
          (data.stats as Stats).solvedProblems = new Set(data.stats.solvedProblems as string[]);
        }
        return data;
      }
    }
  } catch {
    return null;
  }
  return null;
};

const setToCache = <T>(key: string, data: T) => {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheable = JSON.stringify({
      data: JSON.parse(JSON.stringify(data, (key, value) => 
        value instanceof Set ? Array.from(value) : value
      )),
      timestamp: Date.now()
    });
    localStorage.setItem(key, cacheable);
  } catch (error) {
    console.error('Error setting cache:', error);
  }
};

export const getCodeforcesUserInfo = cache(async (handle: string) => {
  const cached = getFromCache<{ user: CodeforcesUser | null, error: string | null }>(`cf-user-${handle}`);
  if (cached) return cached;

  try {
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const data = await response.json();
    
    if (data.status === 'OK') {
      const result = { user: data.result[0] as CodeforcesUser, error: null };
      setToCache(`cf-user-${handle}`, result);
      return result;
    }
    return { user: null, error: 'User not found' };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
});

export const getCodeforcesUserSubmissions = cache(async (handle: string) => {
  const cached = getFromCache<{ stats: { totalSolved: number, ratingDistribution: Record<string, number>, solvedProblems: Set<string> } | null, error: string | null }>(`cf-submissions-${handle}`);
  if (cached) return cached;

  try {
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
    const data = await response.json();
    // console.log(data);
    if (data.status === 'OK') {
      const submissions = data.result;
      const solvedProblems = new Set<string>();
      const ratingDistribution: Record<string, number> = {};
      
      submissions.forEach((sub: any) => {
        if (sub.verdict === 'OK') {
          const problemId = `${sub.problem.contestId}${sub.problem.index}`;
          if (!solvedProblems.has(problemId)) {
            solvedProblems.add(problemId);
            const rating = sub.problem.rating;
            if (rating) {
              ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
            }
          }
        }
      });

      const result = {
        stats: {
          totalSolved: solvedProblems.size,
          ratingDistribution,
          solvedProblems
        },
        error: null
      };

      setToCache(`cf-submissions-${handle}`, result);
      return result;
    }
    return { stats: null, error: 'Failed to fetch submissions' };
  } catch (error: any) {
    return { stats: null, error: error.message };
  }
});