import { useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { attemptCatch } from '@/lib/services/catch';
import { catchPokemon } from '@/lib/services/pokemon';
import { getUserInventory } from '@/lib/services/inventory';
import { toast } from 'sonner';
import { SHOP_ITEMS } from '@/lib/services/shop';
import { checkLegendaryFlee } from '@/lib/services/pokemon';
import { updateInventory } from '@/lib/services/inventory';
import { QueuedPokemon } from '@/lib/services/pokemon';
import { UserInventory } from '@/lib/services/inventory';

const LAST_BALL_KEY = 'lastUsedPokeball';

export const usePokemonCatch = () => {
  const [loading, setLoading] = useState(false);
  const [isCaught, setIsCaught] = useState(false);

  const handleCatch = async (
    pokemon: QueuedPokemon & { isLegendary?: boolean },
    selectedBall: string,
    setInventory: (inv: UserInventory) => void,
    setSelectedBall: (ball: string) => void
  ) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const ball = SHOP_ITEMS.find(item => item.id === selectedBall);
      if (!ball) throw new Error('Invalid ball selected');

      // Check for legendary flee
      if (pokemon.isLegendary && checkLegendaryFlee()) {
        toast.error('The legendary Pokémon fled!');
        setLoading(false);
        return;
      }

      // Calculate catch probability
      const catchProbability = ball.catchRate * (pokemon.isLegendary ? 0.3 : 1);
      const caught = Math.random() < catchProbability;

      // Update inventory
      await updateInventory(user.uid, selectedBall, -1);
      const { inventory } = await getUserInventory(user.uid);
      if (inventory) setInventory(inventory);

      if (caught) {
        await catchPokemon(user.uid, pokemon);
        setIsCaught(true);
        toast.success('Gotcha! Pokémon was caught!');
      } else {
        toast.error('Oh no! The Pokémon broke free!');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, isCaught, setIsCaught, handleCatch };
};