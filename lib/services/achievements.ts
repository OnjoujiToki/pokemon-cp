import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { getUserProfile } from '../firebase/profile';
import { getUserPokemonData } from './pokemon';
import { getCodeforcesUserSubmissions } from './codeforces';
import { LEGENDARY_POKEMON, BABY_POKEMON } from './pokemon';
import { getUserInventory } from './inventory';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  completed: boolean;
  completedAt?: Date;
  reward?: {
    type: 'balls' | 'pokemon' | 'gold';
    ballType?: 'poke-ball' | 'great-ball' | 'ultra-ball' | 'master-ball' | 'quick-ball' | 'timer-ball';
    amount?: number;
    options?: {
      id: number;
      name: string;
      imageUrl: string;
    }[];
    claimed: boolean;
  };
}

export const ACHIEVEMENTS = {
  COLLECTOR: {
    id: 'collector',
    title: 'Collector',
    description: 'Catch your first Pokémon',
    total: 1,
    reward: {
      type: 'pokemon',
      options: [
        { 
          id: 1, 
          name: 'Bulbasaur', 
          imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png'
        },
        { 
          id: 4, 
          name: 'Charmander', 
          imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png'
        },
        { 
          id: 7, 
          name: 'Squirtle', 
          imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png'
        }
      ],
      claimed: false
    }
  },
  MASTER_COLLECTOR: {
    id: 'master-collector',
    title: 'Master Collector',
    description: 'Catch 50 different Pokémon',
    total: 50,
    reward: {
      type: 'balls',
      ballType: 'ultra-ball',
      amount: 3,
      claimed: false
    }
  },
  PROBLEM_SOLVER: {
    id: 'problem-solver',
    title: 'Problem Solver',
    description: 'Solve your first programming challenge',
    total: 1,
    reward: {
      type: 'balls',
      ballType: 'great-ball',
      amount: 5,
      claimed: false
    }
  },
  CODING_MASTER: {
    id: 'coding-master',
    title: 'Coding Master',
    description: 'Solve 100 programming challenges',
    total: 100,
    reward: {
      type: 'balls',
      ballType: 'master-ball',
      amount: 1,
      claimed: false
    }
  },
  LEGENDARY_HUNTER: {
    id: 'legendary-hunter',
    title: 'Legendary Hunter',
    description: 'Catch your first legendary Pokémon',
    total: 1,
    reward: {
      type: 'balls',
      ballType: 'ultra-ball',
      amount: 5,
      claimed: false
    }
  },
  RICH_TRAINER: {
    id: 'rich-trainer',
    title: 'Rich Trainer',
    description: 'Accumulate 10,000 gold',
    total: 10000,
    reward: {
      type: 'balls',
      ballType: 'quick-ball',
      amount: 3,
      claimed: false
    }
  },
  EGG_HATCHER: {
    id: 'egg-hatcher',
    title: 'Egg Hatcher',
    description: 'Hatch your first Pokémon egg',
    total: 1,
    reward: {
      type: 'balls',
      ballType: 'timer-ball',
      amount: 2,
      claimed: false
    }
  }
} as const;

export async function getUserAchievements(userId: string) {
  try {
    const achievementsRef = doc(db, 'achievements', userId);
    const achievementsSnap = await getDoc(achievementsRef);
    
    if (!achievementsSnap.exists()) {
      return { achievements: [], error: null };
    }
    
    return { achievements: achievementsSnap.data().achievements, error: null };
  } catch (error: any) {
    return { achievements: [], error: error.message };
  }
}

export async function updateAchievementProgress(
  userId: string,
  achievementId: string,
  progress: number
) {
  try {
    const achievementsRef = doc(db, 'achievements', userId);
    const achievementsSnap = await getDoc(achievementsRef);
    
    if (!achievementsSnap.exists()) {
      return { success: false, error: 'Achievements not found' };
    }
    
    const achievements = achievementsSnap.data().achievements;
    const achievement = achievements.find((a: Achievement) => a.id === achievementId);
    
    if (!achievement) {
      return { success: false, error: 'Achievement not found' };
    }
    
    achievement.progress = progress;
    achievement.completed = progress >= achievement.total;
    if (achievement.completed && !achievement.completedAt) {
      achievement.completedAt = new Date();
    }
    
    await updateDoc(achievementsRef, { achievements });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function checkAndUpdateAchievements(userId: string) {
  try {
    // Get user's training data to check solved problems
    const trainingRef = doc(db, 'userTraining', userId);
    const trainingSnap = await getDoc(trainingRef);
    
    if (trainingSnap.exists()) {
      const trainingData = trainingSnap.data();
      
      // Handle both old and new data structures
      const solvedCount = trainingData.solvedProblems?.length || 
        trainingData.problems?.filter((p: any) => p.solved)?.length || 0;
      
      // Update programming achievements
      await updateAchievementProgress(userId, 'problem-solver', solvedCount);
      await updateAchievementProgress(userId, 'coding-master', solvedCount);
    }

    // Get user's Pokemon data for legendary and baby Pokemon counts
    const pokemonRef = doc(db, 'userPokemon', userId);
    const pokemonSnap = await getDoc(pokemonRef);
    
    if (pokemonSnap.exists()) {
      const pokemonData = pokemonSnap.data();
      const collection = pokemonData.collection || [];
      
      // Count legendary Pokemon
      const legendaryCount = collection.filter(
        (pokemon: any) => LEGENDARY_POKEMON.has(pokemon.id)
      ).length;
      
      // Count baby Pokemon (for egg hatcher achievement)
      const babyCount = collection.filter(
        (pokemon: any) => BABY_POKEMON.has(pokemon.id)
      ).length;
      
      // Update Pokemon-related achievements
      await updateAchievementProgress(userId, 'legendary-hunter', legendaryCount);
      await updateAchievementProgress(userId, 'egg-hatcher', babyCount);
    }

    // Get user's gold data
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const goldAmount = userData.gold || 0;
      
      // Update rich trainer achievement
      await updateAchievementProgress(userId, 'rich-trainer', goldAmount);
    }

  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

export async function updateAchievementStatus(userId: string, achievementId: string, claimed: boolean = true) {
  try {
    const achievementsRef = doc(db, 'achievements', userId);
    const achievementsSnap = await getDoc(achievementsRef);
    
    if (!achievementsSnap.exists()) return { error: 'Achievements not found' };
    
    const achievements = achievementsSnap.data().achievements;
    const updatedAchievements = achievements.map((achievement: Achievement) => {
      if (achievement.id === achievementId) {
        return {
          ...achievement,
          reward: {
            ...achievement.reward,
            claimed
          }
        };
      }
      return achievement;
    });

    await updateDoc(achievementsRef, { achievements: updatedAchievements });
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}