'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { auth } from '@/lib/firebase/config';
import { getUserPokemonData } from '@/lib/services/pokemon';
import { getUserInventory, UserInventory } from '@/lib/services/inventory';
import { SHOP_ITEMS } from '@/lib/services/shop';
import Loading from './loading';
import ErrorDisplay from './error';
import { toast } from 'sonner';
import { PokemonBadge } from '@/components/ui/pokemon-badge';
import { Trophy, ArrowLeft, Gamepad2, ArrowRight, Swords } from 'lucide-react';
import { usePokemonCatch } from '@/lib/hooks/usePokemonCatch';
import { QueuedPokemon } from '@/lib/services/pokemon';
import { useAuth } from '@/lib/hooks/useAuth';

interface EncounterPokemon extends QueuedPokemon {
  isLegendary?: boolean;
}

const LAST_BALL_KEY = 'lastUsedPokeball';

export default function EncounterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [selectedBall, setSelectedBall] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(LAST_BALL_KEY) || '';
    }
    return '';
  });
  const [inventory, setInventory] = useState<UserInventory>({
    'poke-ball': 5,
    'pokemon-egg': 0,
    'incubator': 0
  });
  const [currentPokemon, setCurrentPokemon] = useState<EncounterPokemon | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { loading, isCaught, setIsCaught, handleCatch } = usePokemonCatch();

  const loadQueuedPokemon = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const { data, error } = await getUserPokemonData(user.uid);
      if (error) throw new Error(error);
      if (!data || data.queue.length === 0) {
        setError('No Pokemon available! Complete more challenges.');
        return;
      }

      const pokemon = data.queue[0];
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
      const pokeData = await response.json();
      
      setCurrentPokemon({
        id: pokemon.id,
        name: pokeData.name.charAt(0).toUpperCase() + pokeData.name.slice(1),
        imageUrl: pokeData.sprites.other['official-artwork'].front_default || pokeData.sprites.front_default,
        types: pokeData.types.map((t: any) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)),
        stats: pokemon.stats,
        cp: pokemon.cp
      });
    } catch (err) {
      setError('Failed to load Pokemon');
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      async function fetchData() {
        try {
          const { inventory } = await getUserInventory(user!.uid);
          if (inventory) {
            setInventory(inventory);
          }
          await loadQueuedPokemon();
        } catch (err) {
          setError('Failed to load encounter data');
        }
      }
      fetchData();
    }
  }, [user, authLoading]);

  const handleCatchClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!currentPokemon) return;
    await handleCatch(currentPokemon, selectedBall, setInventory, setSelectedBall);
  };

  const handleNext = async () => {
    setIsCaught(false);
    setSelectedBall('');
    await loadQueuedPokemon();
  };

  const handleBallSelect = (value: string) => {
    setSelectedBall(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LAST_BALL_KEY, value);
    }
  };

  const availableBalls = SHOP_ITEMS.filter(
    item => item.id.includes('ball') && typeof inventory[item.id] === 'number' && (inventory[item.id] as number) > 0
  );

  if (availableBalls.length === 0) {
    return (
      <ErrorDisplay message="You don't have any Poké Balls! Visit the shop to buy some." />
    );
  }

  if (authLoading || loading) return <Loading />;
  
  if (error) return (
    <div className="container mx-auto p-6">
      <ErrorDisplay message={error} />
    </div>
  );

  if (!currentPokemon) return <Loading />;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Swords className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wild Encounter</h1>
            <p className="text-muted-foreground">
              Catch Pokémon with your Poké Balls
            </p>
          </div>
        </div>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {isCaught ? 'Pokémon Caught!' : 'Wild Pokémon Appeared!'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center space-y-6">
              <div className="relative aspect-square max-w-[240px] mx-auto">
                <Image
                  src={currentPokemon.imageUrl}
                  alt={currentPokemon.name}
                  fill
                  className={`object-contain transition-all duration-500 ${
                    isCaught ? 'scale-100 opacity-100' : 'scale-110 opacity-90'
                  }`}
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-2">{currentPokemon.name}</h2>
                <div className="flex gap-2 justify-center">
                  {currentPokemon.types.map((type) => (
                    <PokemonBadge key={type} type={type} />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 bg-muted/50 py-2 rounded-full">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-lg">{currentPokemon.cp} CP</span>
              </div>

              <div className="space-y-4">
                <Select value={selectedBall} onValueChange={handleBallSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Poké Ball" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBalls.map((ball) => (
                      <SelectItem key={ball.id} value={ball.id}>
                        <div className="flex items-center gap-2">
                          <Image
                            src={ball.image}
                            alt={ball.name}
                            width={20}
                            height={20}
                          />
                          <span>{ball.name} ({inventory[ball.id] as number})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isCaught ? (
                  <div className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-green-500">
                      <Trophy className="h-6 w-6" />
                      <span className="text-lg font-semibold">Caught successfully!</span>
                    </div>
                    <Button 
                      onClick={handleNext}
                      size="lg"
                      className="w-full max-w-xs"
                      variant="outline"
                    >
                      <span>Next Pokémon</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={handleCatchClick} 
                    disabled={loading || !selectedBall}
                    size="lg"
                    className="w-full max-w-xs animate-pulse hover:animate-none"
                    type="button"
                  >
                    {loading ? 'Throwing ball...' : 'Throw Poké Ball!'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

