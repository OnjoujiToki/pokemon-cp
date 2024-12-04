'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { auth } from '@/lib/firebase/config';
import { getUserPokemonData, LEGENDARY_POKEMON, BABY_POKEMON, MYTHIC_POKEMON } from '@/lib/services/pokemon';
import Loading from '../collection/loading';
import ErrorDisplay from '../encounter/error';
import { TYPE_COLORS, PokemonType } from '@/lib/utils/pokemon-types';
import { PokemonBadge } from '@/components/ui/pokemon-badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { Gamepad2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Library } from "lucide-react";

interface CollectionPokemon {
  uid: string;
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
  cp: number;
  caughtAt: number;
}

export default function CollectionPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [collection, setCollection] = useState<CollectionPokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'cp' | 'name' | 'newest'>('newest');
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Get unique types from collection for filter dropdown
  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    collection.forEach(pokemon => {
      pokemon.types.forEach(type => types.add(type));
    });
    return Array.from(types);
  }, [collection]);

  // Sort and filter collection
  const sortedAndFilteredCollection = useMemo(() => {
    return collection
      .filter(pokemon => {
        // Type filter
        const matchesType = typeFilter === "all" || 
          pokemon.types.some(t => t.toLowerCase() === typeFilter);
        
        // Category filter
        const matchesCategory = 
          categoryFilter === "all" ||
          (categoryFilter === "legendary" && LEGENDARY_POKEMON.has(pokemon.id)) ||
          (categoryFilter === "baby" && BABY_POKEMON.has(pokemon.id)) ||
          (categoryFilter === "mythical" && MYTHIC_POKEMON.has(pokemon.id));
        
        // Both filters must match
        return matchesType && matchesCategory;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'cp':
            return b.cp - a.cp;
          case 'name':
            return a.name.localeCompare(b.name);
          case 'newest':
            return b.caughtAt - a.caughtAt;
          default:
            return 0;
        }
      });
  }, [collection, sortBy, typeFilter, categoryFilter]);

  useEffect(() => {
    const loadCollection = async () => {
      if (!user) return;

      // Try to get from cache first
      const cached = localStorage.getItem(`pokemon_collection_${user.uid}`);
      if (cached) {
        setCollection(JSON.parse(cached));
        setLoading(false);
      }

      try {
        const { data, error } = await getUserPokemonData(user.uid);
        if (error) throw new Error(error);
        
        if (!data) throw new Error('No data returned');

        localStorage.setItem(`pokemon_collection_${user.uid}`, JSON.stringify(data.collection));
        setCollection(data.collection);
      } catch (err) {
        setError('Failed to load collection');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadCollection();
    }
  }, [user]);

  if (authLoading || loading) return <Loading />;
  if (error) return <ErrorDisplay message={error} />;
  if (collection.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold mb-6">My Collection</h1>
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <p>No Pokémon caught yet! Complete challenges to find Pokémon.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Library className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Collection</h1>
            <p className="text-muted-foreground">
              {collection.length} Pokémon caught
            </p>
          </div>
        </div>
        
        {collection.length > 0 && (
          <div className="flex gap-4">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'cp' | 'name' | 'newest')}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="cp">CP</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pokémon</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
                <SelectItem value="baby">Baby</SelectItem>
                <SelectItem value="mythical">Mythical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Collection Grid */}
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : collection.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Gamepad2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold">Your collection is empty!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Complete coding challenges to catch Pokémon and build your collection.
            </p>
            <Button asChild className="mt-4">
              <Link href="/recommendation">Find Challenges</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedAndFilteredCollection.map((pokemon) => (
            <Card key={pokemon.uid} className="group hover:shadow-lg transition-all">
              <CardHeader className="space-y-2">
                <div className="relative aspect-square">
                  <Image
                    src={pokemon.imageUrl}
                    alt={pokemon.name}
                    fill
                    className="object-contain p-4 group-hover:scale-110 transition-transform"
                  />
                </div>
                <CardTitle className="text-center">{pokemon.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2 justify-center">
                    {pokemon.types.map((type) => (
                      <PokemonBadge key={type} type={type} />
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-muted/50 py-2 rounded-full">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">{pokemon.cp} CP</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}