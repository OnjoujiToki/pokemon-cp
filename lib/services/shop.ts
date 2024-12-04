import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { getUserProfile, updateUserProfile } from '../firebase/profile';
import { FieldValue } from 'firebase/firestore';
import { updateInventory, getUserInventory  } from './inventory';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  catchRate: number;
  image: string;
}

const SPRITE_BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items';

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'poke-ball',
    name: 'Poké Ball',
    description: 'A device for catching wild Pokémon. It has a decent success rate.',
    price: 200,
    catchRate: 0.5,
    image: `${SPRITE_BASE_URL}/poke-ball.png`
  },
  {
    id: 'great-ball',
    name: 'Great Ball',
    description: 'A good, high-performance Ball with a higher catch rate than a standard Poké Ball.',
    price: 600,
    catchRate: 0.7,
    image: `${SPRITE_BASE_URL}/great-ball.png`
  },
  {
    id: 'ultra-ball',
    name: 'Ultra Ball',
    description: 'An ultra-high performance Ball with a much higher catch rate than a Great Ball.',
    price: 1200,
    catchRate: 0.85,
    image: `${SPRITE_BASE_URL}/ultra-ball.png`
  },
  {
    id: 'master-ball',
    name: 'Master Ball',
    description: 'The best Ball with the ultimate performance. It will catch any wild Pokémon without fail.',
    price: 50000,
    catchRate: 1,
    image: `${SPRITE_BASE_URL}/master-ball.png`
  },
  {
    id: 'quick-ball',
    name: 'Quick Ball',
    description: 'A somewhat different Ball that provides a better catch rate at the start of wild encounters.',
    price: 1000,
    catchRate: 0.65,
    image: `${SPRITE_BASE_URL}/quick-ball.png`
  },
  {
    id: 'timer-ball',
    name: 'Timer Ball',
    description: 'A somewhat different Ball that becomes progressively better the more turns that are taken.',
    price: 1000,
    catchRate: 0.65,
    image: `${SPRITE_BASE_URL}/timer-ball.png`
  },
  {
    id: 'pokemon-egg',
    name: 'Pokémon Egg',
    description: 'A mysterious egg that will hatch into a baby Pokémon after one week of care.',
    price: 5000,
    catchRate: 0,
    image: `${SPRITE_BASE_URL}/mystery-egg.png`
  },
  {
    id: 'incubator',
    name: 'Egg Incubator',
    description: 'A device that instantly hatches a Pokémon Egg.',
    price: 2000,
    catchRate: 0,
    image: '/incubator.png'
  }
];

export async function purchaseItem(userId: string, itemId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { profile } = await getUserProfile(userId);
    if (!profile) {
      return { success: false, error: 'User profile not found' };
    }

    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) {
      return { success: false, error: `Item not found: ${itemId}` };
    }

    if (profile.gold < item.price) {
      return { success: false, error: 'Insufficient gold' };
    }

    // Check inventory limits for eggs and incubators
    if (itemId === 'pokemon-egg' || itemId === 'incubator') {
      const { inventory } = await getUserInventory(userId);
      if (!inventory) {
        return { success: false, error: 'Inventory not found' };
      }

      const currentCount = inventory[itemId] as number;
      if (currentCount >= 1) {
        return { 
          success: false, 
          error: `You can only have 1 ${itemId.replace('-', ' ')} at a time` 
        };
      }
    }

    // Update inventory and gold in one go
    await Promise.all([
      updateInventory(userId, itemId, 1),
      updateUserProfile(userId, {
        gold: increment(-item.price)
      })
    ]);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function validatePurchase(userId: string, itemId: string): Promise<boolean> {
  try {
    const { profile } = await getUserProfile(userId);
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    return !!(profile && item && profile.gold >= item.price);
  } catch {
    return false;
  }
}