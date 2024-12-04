import { getUserInventory, updateInventory } from './inventory';
import { SHOP_ITEMS } from './shop';
import { checkAndUpdateAchievements } from './achievements';

interface CatchAttemptResult {
  success: boolean;
  message: string;
  ballUsed?: string;
  catchRate?: number;
}

export async function attemptCatch(
  userId: string, 
  pokemonLevel: number, 
  selectedBall: string
): Promise<CatchAttemptResult> {
  try {
    // Get user's inventory
    const { inventory } = await getUserInventory(userId);
    if (!inventory || !inventory[selectedBall]) {
      return {
        success: false,
        message: "You don't have any of these balls!"
      };
    }

    // Get ball details
    const ball = SHOP_ITEMS.find(item => item.id === selectedBall);
    if (!ball) {
      return {
        success: false,
        message: "Invalid ball type"
      };
    }

    // Use the ball (deduct from inventory)
    await updateInventory(userId, selectedBall, -1);

    // Master Ball should always catch, regardless of other factors
    if (selectedBall === 'master-ball') {
      return {
        success: true,
        message: "Gotcha! The Master Ball never fails!",
        ballUsed: selectedBall,
        catchRate: 1
      };
    }

    // For other balls, calculate catch probability
    let catchRate = ball.catchRate;
    
    // Adjust catch rate based on ball type
    switch (selectedBall) {
      case 'quick-ball':
        catchRate *= 1.5;
        break;
      case 'timer-ball':
        catchRate *= 1.1;
        break;
    }

    // Adjust for pokemon level
    const levelFactor = Math.max(0.1, 1 - (pokemonLevel / 100));
    const finalCatchRate = Math.min(1, catchRate * levelFactor);

    // Random catch check
    const caught = Math.random() <= finalCatchRate;

    if (caught) {
      await checkAndUpdateAchievements(userId);
    }

    return {
      success: caught,
      message: caught ? "Gotcha!" : "Oh no! The Pokémon broke free!",
      ballUsed: selectedBall,
      catchRate: finalCatchRate
    };
  } catch (error) {
    return {
      success: false,
      message: "Error attempting catch"
    };
  }
} 