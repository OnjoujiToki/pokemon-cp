import { db } from '../firebase/config';
import { nanoid } from 'nanoid';
import { doc, getDoc, setDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { getUserProfile, updateUserProfile } from '../firebase/profile';
import { ShopItem, SHOP_ITEMS } from './shop';
import { BABY_POKEMON } from './pokemon';
import { getCodeforcesUserInfo } from './codeforces';
import { checkAndUpdateAchievements } from './achievements';

interface EggData {
  purchaseDate: number;
  isHatchable: boolean;
}

export interface UserInventory {
  [itemId: string]: number | EggData[];
  'poke-ball': number;
  'pokemon-egg': number; // Max: 1
  'incubator': number;  // Max: 1
}

export async function getUserInventory(userId: string) {
  try {
    const inventoryRef = doc(db, 'inventories', userId);
    const inventoryDoc = await getDoc(inventoryRef);
    
    if (!inventoryDoc.exists()) {
      // Initialize with 5 basic Poké Balls
      const defaultInventory: UserInventory = {
        'poke-ball': 5,
        'pokemon-egg': 0,
        'incubator': 0
      };
      await setDoc(inventoryRef, defaultInventory);
      return { inventory: defaultInventory, error: null };
    }
    
    return { inventory: inventoryDoc.data() as UserInventory, error: null };
  } catch (error: any) {
    return { inventory: null, error: error.message };
  }
}

async function checkInventoryLimits(userId: string, itemId: string): Promise<boolean> {
  const { inventory } = await getUserInventory(userId);
  if (!inventory) return false;
  
  switch (itemId) {
    case 'pokemon-egg':
    case 'incubator':
      return (inventory[itemId] as number) < 1;
    default:
      return true;
  }
}

export async function updateInventory(userId: string, itemId: string, quantity: number) {
  try {
    if (quantity > 0 && !await checkInventoryLimits(userId, itemId)) {
      return { 
        success: false, 
        error: `You can only have 1 ${itemId.replace('-', ' ')} at a time` 
      };
    }

    const inventoryRef = doc(db, 'inventories', userId);
    await updateDoc(inventoryRef, {
      [itemId]: increment(quantity)
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addGold(userId: string, amount: number) {
  try {
    await updateUserProfile(userId, {
      gold: increment(amount)
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function purchaseEgg(userId: string) {
  try {
    const inventoryRef = doc(db, 'inventories', userId);
    const eggData: EggData = {
      purchaseDate: Date.now(),
      isHatchable: false
    };
    
    await updateDoc(inventoryRef, {
      'pokemon-egg': arrayUnion(eggData)
    });
    
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function checkHatchableEggs(userId: string) {
  const HATCH_TIME = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds
  const inventoryRef = doc(db, 'inventories', userId);
  const inventory = await getDoc(inventoryRef);
  
  if (!inventory.exists()) return;
  
  const eggs: EggData[] = inventory.data()['pokemon-egg'] || [];
  const updatedEggs = eggs.map(egg => ({
    ...egg,
    isHatchable: Date.now() - egg.purchaseDate >= HATCH_TIME
  }));
  
  await updateDoc(inventoryRef, {
    'pokemon-egg': updatedEggs
  });
}

export async function hatchEgg(userId: string, eggIndex: number) {
  try {
    const inventoryRef = doc(db, 'inventories', userId);
    const inventory = await getDoc(inventoryRef);
    if (!inventory.exists()) {
      return { error: 'Inventory not found' };
    }
    
    const eggs: EggData[] = inventory.data()['pokemon-egg'] || [];
    if (!eggs[eggIndex]?.isHatchable) {
      return { error: 'Egg is not ready to hatch' };
    }
    
    // Get random baby Pokémon
    const babyArray = Array.from(BABY_POKEMON);
    const randomBabyId = babyArray[Math.floor(Math.random() * babyArray.length)];
    
    // Remove the hatched egg
    const newEggs = eggs.filter((_, index) => index !== eggIndex);
    await updateDoc(inventoryRef, {
      'pokemon-egg': newEggs
    });

    // Get user's current rating from Codeforces
    const { profile } = await getUserProfile(userId);
    const { user } = await getCodeforcesUserInfo(profile?.codeforcesHandle || '');
    const userRating = user?.rating || 800;
    
    // Fetch Pokémon data and add directly to collection
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomBabyId}`);
    const data = await response.json();
    
    const pokemonRef = doc(db, 'userPokemon', userId);
    await updateDoc(pokemonRef, {
      collection: arrayUnion({
        id: randomBabyId,
        name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
        imageUrl: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
        types: data.types.map((t: any) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)),
        stats: data.stats.map((s: any) => ({
          name: s.stat.name,
          value: s.base_stat
        })),
        cp: userRating,
        uid: nanoid(),
        caughtAt: Date.now()
      })
    });
    
    await checkAndUpdateAchievements(userId);
    return { success: true, error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

interface PokeAPIResponse {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
}

export async function useIncubator(userId: string, eggIndex: number) {
  try {
    const inventoryRef = doc(db, 'inventories', userId);
    const inventory = await getDoc(inventoryRef);
    
    if (!inventory.exists()) {
      return { error: 'Inventory not found' };
    }
    
    const inventoryData = inventory.data() as UserInventory;
    if (!inventoryData.incubator || inventoryData.incubator < 1) {
      return { error: 'No incubator available' };
    }

    const eggCount = typeof inventoryData['pokemon-egg'] === 'number' ? inventoryData['pokemon-egg'] : 0;
    if (eggCount < 1) {
      return { error: 'No eggs available' };
    }

    // Get user's Codeforces rating
    const { profile } = await getUserProfile(userId);
    const { user } = await getCodeforcesUserInfo(profile?.codeforcesHandle || '');
    const userRating = user?.rating || 800;

    // Generate random baby Pokémon
    const babyPokemonArray = Array.from(BABY_POKEMON);
    const randomBabyId = babyPokemonArray[Math.floor(Math.random() * babyPokemonArray.length)];

    // Fetch Pokémon data from PokeAPI
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomBabyId}`);
    const data = await response.json();

    // Update inventory counts
    await updateDoc(inventoryRef, {
      'pokemon-egg': increment(-1),
      'incubator': increment(-1)
    });

    // Add Pokémon to collection
    const pokemonRef = doc(db, 'userPokemon', userId);
    await updateDoc(pokemonRef, {
      collection: arrayUnion({
        id: randomBabyId,
        name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
        imageUrl: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
        types: data.types.map((t: any) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)),
        cp: userRating,
        uid: nanoid(),
        caughtAt: Date.now()
      })
    });
    
    return { success: true, error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}


