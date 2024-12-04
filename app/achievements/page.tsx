'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, Code, Egg, Crown, Sparkles, GiftIcon, Lock } from "lucide-react";
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserAchievements, Achievement } from '@/lib/services/achievements';
import { Badge } from "@/components/ui/badge";
import Loading from './loading';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { updateInventory } from '@/lib/services/inventory';
import { catchPokemon } from '@/lib/services/pokemon';
import { toast } from "sonner";
import { updateAchievementStatus } from '@/lib/services/achievements';
import { checkAndUpdateAchievements } from '@/lib/services/achievements';

const CATEGORIES: Record<string, { label: string; icon: JSX.Element; achievements: string[]; description: string }> = {
  'collection': {
    label: 'Pokémon Collection',
    icon: <Trophy className="h-4 w-4" />,
    achievements: ['collector', 'master-collector', 'legendary-hunter'],
    description: 'Achievements related to your Pokémon collection'
  },
  'programming': {
    label: 'Programming Problems',
    icon: <Code className="h-4 w-4" />,
    achievements: ['problem-solver', 'coding-master'],
    description: 'Achievements earned through solving coding challenges'
  },
  'items': {
    label: 'Eggs & Items',
    icon: <Egg className="h-4 w-4" />,
    achievements: ['rich-trainer', 'egg-hatcher'],
    description: 'Achievements for collecting items and hatching eggs'
  }
};

// Helper function to get achievement icon
const getAchievementIcon = (id: string) => {
  switch (id) {
    case 'collector':
      return <Star className="h-5 w-5 text-yellow-500" />;
    case 'master-collector':
      return <Crown className="h-5 w-5 text-purple-500" />;
    case 'legendary-hunter':
      return <Sparkles className="h-5 w-5 text-blue-500" />;
    case 'problem-solver':
      return <Code className="h-5 w-5 text-green-500" />;
    case 'coding-master':
      return <Trophy className="h-5 w-5 text-red-500" />;
    case 'rich-trainer':
      return <GiftIcon className="h-5 w-5 text-amber-500" />;
    case 'egg-hatcher':
      return <Egg className="h-5 w-5 text-pink-500" />;
    default:
      return <Star className="h-5 w-5" />;
  }
};

export default function AchievementsPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState<Achievement | null>(null);

  const loadAchievements = async () => {
    if (!user) return;
    
    try {
      // First check and update achievements to ensure they're current
      await checkAndUpdateAchievements(user.uid);
      
      // Then get the updated achievements
      const { achievements: userAchievements } = await getUserAchievements(user.uid);
      setAchievements(userAchievements?.length ? userAchievements : []);
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, [user]);

  const handleClaimReward = async (achievement: Achievement) => {
    if (!user || !achievement) {
      console.log('Missing user or achievement:', { user, achievement });
      return;
    }

    try {
      console.log('Starting claim process for:', achievement.id);
      
      // For Pokemon rewards
      if (achievement.reward?.type === 'pokemon' && achievement.reward.options) {
        // Randomly select a Pokémon from the options
        const randomIndex = Math.floor(Math.random() * achievement.reward.options.length);
        const selectedPokemon = achievement.reward.options[randomIndex];
        console.log('Claiming Pokemon:', selectedPokemon);

        // Fetch Pokémon data from PokeAPI
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${selectedPokemon.id}`);
        const data = await response.json();

        const result = await catchPokemon(user.uid, {
          id: selectedPokemon.id,
          name: selectedPokemon.name,
          imageUrl: selectedPokemon.imageUrl,
          types: data.types.map((t: any) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)),
          stats: data.stats.map((s: any) => ({
            name: s.stat.name,
            value: s.base_stat
          })),
          cp: 800
        });

        if (result.error) {
          console.error('Pokemon claim error:', result.error);
          toast.error(result.error);
          return;
        }
      } 
      // For ball rewards
      else if (achievement.reward?.type === 'balls' && achievement.reward.ballType) {
        console.log('Claiming balls:', {
          type: achievement.reward.ballType,
          amount: achievement.reward.amount
        });
        
        const result = await updateInventory(
          user.uid, 
          achievement.reward.ballType,
          achievement.reward.amount || 0
        );

        if (!result.success) {
          console.error('Ball claim error:', result.error);
          toast.error(result.error || `Failed to claim ${achievement.reward.ballType}`);
          return;
        }
      }

      // Update achievement status
      const updateResult = await updateAchievementStatus(user.uid, achievement.id);
      if (updateResult.error) {
        console.error('Status update error:', updateResult.error);
        toast.error(updateResult.error);
        return;
      }

      console.log('Claim successful');
      toast.success(`Successfully claimed ${achievement.reward?.amount} ${achievement.reward?.ballType || selectedReward?.reward?.options?.[0]?.name}!`); 
      setSelectedReward(null);
      await loadAchievements();
      
    } catch (error) {
      console.error('Claim process error:', error);
      toast.error('Failed to claim reward');
    }
  };

  if (loading) return <Loading />;

  type CategoryKey = keyof typeof CATEGORIES;

  const categorizedAchievements = Object.entries(CATEGORIES).reduce<Record<CategoryKey, Achievement[]>>((acc, [key, category]) => ({
    ...acc,
    [key as CategoryKey]: achievements.filter((achievement: Achievement) => 
      category.achievements.includes(achievement.id)
    )
  }), {} as Record<CategoryKey, Achievement[]>);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
          <p className="text-muted-foreground">Track your progress and earn rewards</p>
        </div>
      </div>

      <Tabs defaultValue="collection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          {Object.entries(CATEGORIES).map(([key, { label, icon }]) => (
            <TabsTrigger 
              key={key} 
              value={key}
              className="flex items-center gap-2"
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(CATEGORIES).map(([key, { label, description }]) => (
          <TabsContent key={key} value={key}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-1">{label}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {categorizedAchievements[key as keyof typeof CATEGORIES].map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`transition-all hover:shadow-md ${
                    achievement.completed 
                      ? achievement.reward?.claimed 
                        ? "border-muted bg-muted/10" 
                        : "border-primary/50 shadow-primary/10"
                      : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        {getAchievementIcon(achievement.id)}
                        <div>
                          <CardTitle className="text-lg font-medium">
                            {achievement.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {achievement.description}
                          </CardDescription>
                        </div>
                      </div>
                      {achievement.completed ? (
                        <Badge 
                          variant={achievement.reward?.claimed ? "secondary" : "default"} 
                          className={achievement.reward?.claimed 
                            ? "bg-muted text-muted-foreground" 
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                          }
                        >
                          {achievement.reward?.claimed ? "Claimed" : "Completed"}
                        </Badge>
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground/50" />
                      )}
                    </div>
                    {achievement.completed && !achievement.reward?.claimed && (
                      <Button
                        variant="outline"
                        className="mt-2 w-full sm:w-auto"
                        onClick={() => setSelectedReward(achievement)}
                      >
                        <GiftIcon className="mr-2 h-4 w-4" />
                        Claim Reward
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress 
                        value={(achievement.progress / achievement.total) * 100} 
                        className={`h-2 ${
                          achievement.reward?.claimed ? "bg-muted" : ""
                        }`}
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progress</span>
                        <span className="font-medium">
                          {achievement.progress}/{achievement.total}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Achievement Reward
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Claim your reward for completing this achievement!
            </p>
          </DialogHeader>
          {selectedReward && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-center gap-4">
                {selectedReward.reward?.type === 'pokemon' ? (
                  <Image
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/unknown.png"
                    alt="Mystery Pokémon"
                    width={48}
                    height={48}
                    className="animate-bounce"
                  />
                ) : (
                  <Image
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${selectedReward.reward?.ballType}.png`}
                    alt={selectedReward.reward?.ballType || ''}
                    width={48}
                    height={48}
                    className="animate-bounce"
                  />
                )}
                <div className="text-center">
                  <p className="text-lg font-medium mb-1">
                    {selectedReward.reward?.type === 'pokemon'
                      ? 'Mystery Pokémon'
                      : `${selectedReward.reward?.amount} ${selectedReward.reward?.ballType?.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}`
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedReward.reward?.type === 'pokemon'
                      ? 'Add this Pokémon to your collection!'
                      : 'Use them to catch rare Pokémon!'}
                  </p>
                </div>
              </div>
              <Button 
                className="w-full"
                size="lg"
                onClick={() => handleClaimReward(selectedReward)}
              >
                Claim Reward
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}