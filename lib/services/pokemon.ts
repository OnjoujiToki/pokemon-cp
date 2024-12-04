import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { UserProfile } from '@/lib/firebase/profile';
import { generatePokemonFromTags } from '@/lib/utils/tag-type-matching';
import { checkAndUpdateAchievements } from './achievements';
// export them as constants
export const BABY_POKEMON = new Set([172,173,174,175,236,238,239,240,298,360,406,433,438,439,440,446,447,458,848]);
export const LEGENDARY_POKEMON = new Set([144,145,146,150,243,244,245,249,250,377,378,379,380,381,382,383,384,480,481,482,483,484,485,486,487,488,638,639,640,641,642,643,644,645,646,716,717,718,773,785,786,787,788,789,790,791,792,800,888,889,890,891,892,894,895,896,897,898,905,1001,1002,1003,1004,1007,1008,1014,1015,1016,1017,1024]);
export const MYTHIC_POKEMON = new Set([151,251,385,386,489,490,491,492,493,494,647,648,649,719,720,721,801,802,807,808,809,893,1025]);

export interface QueuedPokemon {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
  stats: Array<{ name: string; value: number }>;
  cp: number;
}

interface CaughtPokemon extends QueuedPokemon {
  uid: string;
  caughtAt: number;
}

interface UserPokemonData {
  queue: QueuedPokemon[];
  collection: CaughtPokemon[];
}

const POKEMON_TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 
  'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 
  'Steel', 'Fairy'
];

interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

export const getUserPokemonData = async (userId: string) => {
  try {
    const pokemonRef = doc(db, 'userPokemon', userId);
    const pokemonSnap = await getDoc(pokemonRef);
    
    if (!pokemonSnap.exists()) {
      // Initialize empty pokemon data
      const initialData = {
        queue: [],
        collection: []
      };
      
      // Create the document with initial data
      await setDoc(pokemonRef, initialData);
      return { data: initialData, error: null };
    }
    
    return { data: pokemonSnap.data() as UserPokemonData, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const addPokemonToQueue = async (userId: string, pokemon: QueuedPokemon) => {
  try {
    const pokemonRef = doc(db, 'userPokemon', userId);
    await updateDoc(pokemonRef, {
      queue: arrayUnion(pokemon)
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const catchPokemon = async (userId: string, pokemon: QueuedPokemon) => {
  try {
    const pokemonData = {
      ...pokemon,
      uid: nanoid(),
      caughtAt: Date.now(),
    };
    const pokemonRef = doc(db, 'userPokemon', userId);
    
    // Get current data to update both queue and collection
    const pokemonDoc = await getDoc(pokemonRef);
    const currentData = pokemonDoc.data();
    
    if (!currentData) return { error: 'No pokemon data found' };

    // Remove the first pokemon from queue and add to collection
    const newQueue = currentData.queue.slice(1);
    
    await updateDoc(pokemonRef, {
      queue: newQueue,
      collection: arrayUnion(pokemonData)
    });

    // Check and update achievements after successful catch
    await checkAndUpdateAchievements(userId);

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const generatePokemonByDifficulty = async (difficulty: number, tags?: string[]): Promise<QueuedPokemon & { isLegendary?: boolean }> => {
  // Keep generating until we get a valid Pokémon
  let pokemonId: number;
  if (tags && tags.length > 0) { 
    // Use tag-based generation if tags are provided
    console.log('Generating Pokemon based on tags:', tags);
    
    pokemonId = generatePokemonFromTags(tags);
  } else {
    console.log('Generating Pokemon based on difficulty:', difficulty);
    do {
      // 1% chance for legendary
      const isLegendaryRoll = Math.random() < 0.01;
      
      if (isLegendaryRoll) {
        // Pick from legendary pool
        const legendaryArray = Array.from(LEGENDARY_POKEMON);
        pokemonId = legendaryArray[Math.floor(Math.random() * legendaryArray.length)];
      } else {
        // Normal Pokémon generation
        pokemonId = Math.floor(Math.random() * 1025) + 1;
        if (pokemonId > 1025) {
          continue;
        }
        // Skip if it's a baby or mythical Pokémon
        if (BABY_POKEMON.has(pokemonId) || MYTHIC_POKEMON.has(pokemonId)) {
          continue;
        }
      }
    } while (BABY_POKEMON.has(pokemonId) || MYTHIC_POKEMON.has(pokemonId));
  }

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    if (!response.ok) throw new Error('Pokemon not found');
    
    const data = await response.json();
    
    const statsObj = {
      hp: data.stats[0].base_stat,
      attack: data.stats[1].base_stat,
      defense: data.stats[2].base_stat,
      spAtk: data.stats[3].base_stat,
      spDef: data.stats[4].base_stat,
      speed: data.stats[5].base_stat
    };
    
    let cp = calculateCP(statsObj, difficulty);
    const isLegendary = LEGENDARY_POKEMON.has(pokemonId);
    
    // Legendary CP boost
    if (isLegendary) {
      cp = Math.floor(cp * 1.5);
    }
    
    return {
      id: data.id,
      name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
      imageUrl: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
      types: data.types.map((t: any) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)),
      stats: data.stats.map((s: any) => ({
        name: s.stat.name,
        value: s.base_stat
      })),
      cp,
      isLegendary // Add this flag for the catch mechanism
    };
  } catch (error) {
    // Fallback remains unchanged
    console.error('PokeAPI Error:', error);
    return {
      id: pokemonId,
      name: `Mystery Pokemon #${pokemonId}`,
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
      types: [POKEMON_TYPES[Math.floor(Math.random() * POKEMON_TYPES.length)]],
      stats: [
        { name: 'hp', value: Math.floor(50 * difficulty) },
        { name: 'attack', value: Math.floor(45 * difficulty) },
        { name: 'defense', value: Math.floor(45 * difficulty) }
      ],
      cp: Math.floor(difficulty)  // Simplified fallback CP
    };
  }
};

export const calculateCP = (stats: PokemonStats, problemDifficulty: number): number => {
  console.log('Calculating CP for:', {
    originalStats: stats,
    problemDifficulty
  });

  // Normalize stats
  const normalizedStats = {
    hp: stats.hp / 255,
    attack: stats.attack / 255,
    defense: stats.defense / 255,
    spAtk: stats.spAtk / 255,
    spDef: stats.spDef / 255,
    speed: stats.speed / 255
  };
  console.log('Normalized stats:', normalizedStats);

  // Calculate base power
  const basePower = (
    normalizedStats.hp * 0.1 +
    normalizedStats.attack * 0.2 +
    normalizedStats.defense * 0.15 +
    normalizedStats.spAtk * 0.2 +
    normalizedStats.spDef * 0.15 +
    normalizedStats.speed * 0.2
  ) / 1;
  console.log('Base power from stats:', basePower);

  // Adjust difficulty
  const adjustedDifficulty = Math.max(0, problemDifficulty - 800);
  const normalizedDifficulty = adjustedDifficulty / (3500 - 800);
  console.log('Difficulty calculation:', {
    adjustedDifficulty,
    normalizedDifficulty
  });

  // Calculate final CP
  const combinedPower = (basePower * 0.4 + normalizedDifficulty * 0.6);
  const cp = Math.round(100 + combinedPower * 3900);
  const finalCP = Math.max(1, Math.min(4000, cp));

  console.log('Final calculation:', {
    combinedPower,
    rawCP: cp,
    finalCP
  });

  return finalCP;
};

// Example usage:
// const cp = calculateCP({
//   hp: 78,
//   attack: 84,
//   defense: 78,
//   spAtk: 109,
//   spDef: 85,
//   speed: 100
// }, 1500);

// Add a function to handle legendary flee checks
export const checkLegendaryFlee = (): boolean => {
  return Math.random() < 0.2; // 20% chance to flee per throw
};


