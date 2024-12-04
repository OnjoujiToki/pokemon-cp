'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from 'react';
import { toast } from "sonner";
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, arrayUnion, getDoc, setDoc, query, collection, getDocs, where } from 'firebase/firestore';
import { updateUserProfile } from '@/lib/firebase/profile';
import { Trash2 } from 'lucide-react';
import { ACHIEVEMENTS } from '@/lib/services/achievements';

export default function TestPage() {
  const [email, setEmail] = useState('');
  const [goldAmount, setGoldAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const generateRandomPokemon = () => {
    const randomId = Math.floor(Math.random() * 1008) + 1;
    const types = ['Fire', 'Water', 'Grass', 'Electric', 'Normal'];
    const randomTypes = [types[Math.floor(Math.random() * types.length)]];
    
    return {
      id: randomId,
      name: `Pokemon #${randomId}`,
      imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${randomId}.png`,
      types: randomTypes,
      cp: Math.floor(Math.random() * 2000) + 500,
      stats: []
    };
  };

  const handleAddPokemon = async () => {
    if (!email) {
      toast.error('Please enter an email');
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast.error('User not found');
        return;
      }

      const userId = querySnapshot.docs[0].id;
      const pokemonRef = doc(db, 'userPokemon', userId);

      const pokemonDoc = await getDoc(pokemonRef);
      if (!pokemonDoc.exists()) {
        await setDoc(pokemonRef, { queue: [], collection: [] });
      }

      const randomPokemon = generateRandomPokemon();
      await updateDoc(pokemonRef, {
        queue: arrayUnion(randomPokemon)
      });

      toast.success('Random Pokemon added to user queue');
      setEmail('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add Pokemon');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGold = async () => {
    if (!email || !goldAmount) {
      toast.error('Please enter both email and gold amount');
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast.error('User not found');
        return;
      }

      const userId = querySnapshot.docs[0].id;
      
      await updateUserProfile(userId, {
        gold: parseInt(goldAmount)
      });

      toast.success(`Set user's gold to ${goldAmount}`);
      setGoldAmount('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add gold');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllPokemon = async () => {
    if (!email) {
      toast.error('Please enter an email');
      return;
    }

    if (!confirm('Are you sure you want to delete ALL Pokémon for this user?')) {
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast.error('User not found');
        return;
      }

      const userId = querySnapshot.docs[0].id;
      const pokemonRef = doc(db, 'userPokemon', userId);

      // Reset both queue and collection to empty arrays
      await setDoc(pokemonRef, {
        queue: [],
        collection: []
      }, { merge: true });

      toast.success('All Pokémon deleted for user');
      setEmail('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete Pokémon');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAchievements = async () => {
    if (!email) {
      toast.error('Please enter an email');
      return;
    }

    if (!confirm('Are you sure you want to reset achievements for this user?')) {
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast.error('User not found');
        return;
      }

      const userId = querySnapshot.docs[0].id;
      const achievementsRef = doc(db, 'achievements', userId);
      const achievementsDoc = await getDoc(achievementsRef);

      if (!achievementsDoc.exists()) {
        // If no achievements exist, create them from scratch
        const initialAchievements = Object.values(ACHIEVEMENTS).map(achievement => ({
          ...achievement,
          progress: 0,
          completed: false,
          reward: {
            ...achievement.reward,
            claimed: false
          }
        }));
        await setDoc(achievementsRef, { achievements: initialAchievements });
      } else {
        // Reset existing achievements while preserving progress
        const currentAchievements = achievementsDoc.data().achievements;
        const resetAchievements = currentAchievements.map((achievement: any) => {
          const originalAchievement = Object.values(ACHIEVEMENTS).find(
            a => a.id === achievement.id
          );
          
          return {
            ...achievement,
            reward: {
              ...(originalAchievement?.reward || {}),
              claimed: false
            }
          };
        });

        await updateDoc(achievementsRef, { 
          achievements: resetAchievements 
        });
      }

      toast.success('Achievements reset successfully');
      setEmail('');
    } catch (error) {
      console.error('Reset achievements error:', error);
      toast.error('Failed to reset achievements');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Test Dashboard</h1>
      
      <div className="space-y-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Add Test Pokemon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="User Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                onClick={handleAddPokemon}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Adding...' : 'Add Random Pokemon'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Set User Gold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="User Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Gold Amount"
                type="number"
                value={goldAmount}
                onChange={(e) => setGoldAmount(e.target.value)}
              />
              <Button 
                onClick={handleAddGold}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Setting Gold...' : 'Set Gold Amount'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-500">Delete All Pokémon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="User Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                onClick={handleDeleteAllPokemon}
                disabled={loading}
                className="w-full"
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {loading ? 'Deleting...' : 'Delete All Pokémon'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-yellow-500">Reset Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="User Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                onClick={handleResetAchievements}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {loading ? 'Resetting...' : 'Reset Achievement Rewards'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}