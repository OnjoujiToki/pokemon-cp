import { db } from '../firebase/config';
import { doc, setDoc,getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { getCodeforcesUserSubmissions } from './codeforces';
import { getUserProfile } from '../firebase/profile';
import { updateAchievementProgress } from './achievements';

interface TrainingProblem {
  id: string;
  contestId: number;
  index: string;
  name: string;
  rating?: number;
  addedAt: Date;
  tags?: string[];
}

export const addTrainingProblem = async (userId: string, problem: TrainingProblem) => {
    try {
        // Get user's Codeforces handle
        const { profile } = await getUserProfile(userId);
        if (!profile?.codeforcesHandle) {
            return { error: 'Codeforces handle not set' };
        }

        // Check if problem is already solved
        const { stats } = await getCodeforcesUserSubmissions(profile.codeforcesHandle);
        const problemId = `${problem.contestId}${problem.index}`;
        if (stats?.solvedProblems.has(problemId)) {
            return { error: 'Problem already solved' };
        }

        console.log('Adding problem:', problem);
        
        const trainingRef = doc(db, 'userTraining', userId);
        const problemWithTimestamp = {
          ...problem,
          addedAt: Timestamp.fromDate(new Date(problem.addedAt))
        };
        
        console.log('Problem with timestamp:', problemWithTimestamp);
        
        const docSnap = await getDoc(trainingRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Existing problems:', data.problems);
          
          const problemExists = data.problems.some((p: TrainingProblem) => 
            p.contestId === problem.contestId && p.index === problem.index
          );
          
          if (problemExists) {
            return { error: 'Problem already exists in training list' };
          }
          
          await updateDoc(trainingRef, {
            problems: arrayUnion(problemWithTimestamp)
          });
        } else {
          await setDoc(trainingRef, {
            problems: [problemWithTimestamp]
          });
        }
        
        return { error: null };
    } catch (error: any) {
        console.error('Error adding problem:', error);
        return { error: error.message };
    }
};

export const removeTrainingProblem = async (userId: string, problemId: string) => {
  try {
    const trainingRef = doc(db, 'userTraining', userId);
    const trainingDoc = await getDoc(trainingRef);
    const data = trainingDoc.data();
    
    if (!data) return { error: 'No training data found' };
    
    const problem = data.problems.find((p: TrainingProblem) => p.id === problemId);
    if (!problem) return { error: 'Problem not found' };
    
    await updateDoc(trainingRef, {
      problems: arrayRemove(problem)
    });
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getTrainingProblems = async (userId: string) => {
    try {
      const trainingRef = doc(db, 'userTraining', userId);
      const trainingDoc = await getDoc(trainingRef);
      
      if (!trainingDoc.exists()) {
        return { problems: [], error: null };
      }
      
      // Fetch complete problem data from Codeforces
      const response = await fetch('https://codeforces.com/api/problemset.problems');
      const cfData = await response.json();
      const cfProblems = cfData.status === 'OK' ? cfData.result.problems : [];
      
      const data = trainingDoc.data();
      const problems = data.problems.map((problem: TrainingProblem) => {
        // Find matching problem in Codeforces data to get tags
        const cfProblem = cfProblems.find((p: any) => 
          p.contestId === problem.contestId && p.index === problem.index
        );
        
        return {
          ...problem,
          id: `${problem.contestId}${problem.index}`,
          tags: cfProblem?.tags || [],
          addedAt: problem.addedAt instanceof Timestamp ? 
            problem.addedAt.toDate() : new Date(problem.addedAt)
        };
      });
      
      return { problems, error: null };
    } catch (error: any) {
      return { problems: [], error: error.message };
    }
};

export const markProblemAsSolved = async (userId: string, problemId: string) => {
  try {
    const trainingRef = doc(db, 'userTraining', userId);
    const trainingDoc = await getDoc(trainingRef);
    
    if (!trainingDoc.exists()) {
      // Create training data with empty arrays
      await setDoc(trainingRef, {
        problems: [],
        solvedProblems: []
      });
    }

    const data = trainingDoc.data();
    const problem = data?.problems?.find((p: TrainingProblem) => p.id === problemId);
    
    if (!problem) {
      return { error: 'Problem not found in training list' };
    }

    // Move problem from problems array to solvedProblems array
    await updateDoc(trainingRef, {
      problems: arrayRemove(problem),
      solvedProblems: arrayUnion({
        ...problem,
        solvedAt: new Date(),
        solved: true
      })
    });

    // Update achievement progress with actual solved problems count
    const updatedDoc = await getDoc(trainingRef);
    const solvedCount = updatedDoc.data()?.solvedProblems?.length || 0;
    await updateAchievementProgress(userId, 'problem-solver', solvedCount);
    await updateAchievementProgress(userId, 'coding-master', solvedCount);

    return { error: null };
  } catch (error: any) {
    console.error('Error marking problem as solved:', error);
    return { error: error.message };
  }
};