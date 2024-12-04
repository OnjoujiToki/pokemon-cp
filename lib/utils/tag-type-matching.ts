import { 
  dark_pokemon, psychic_pokemon, electric_pokemon, ground_pokemon,
  flying_pokemon, grass_pokemon, ice_pokemon, fighting_pokemon,
  fairy_pokemon, rock_pokemon, ghost_pokemon, dragon_pokemon,
  steel_pokemon, normal_pokemon, water_pokemon 
} from "@/lib/utils/pokemon-types";

const TAG_TYPE_MAPPING: Record<string, number[]> = {
  "2-sat": dark_pokemon,
  "binary search": psychic_pokemon,
  "bitmasks": electric_pokemon,
  "brute force": fighting_pokemon,
  "chinese remainder theorem": dragon_pokemon,
  "combinatorics": fairy_pokemon,
  "constructive algorithms": steel_pokemon,
  "data structures": water_pokemon,
  "dfs and similar": ghost_pokemon,
  "divide and conquer": dragon_pokemon,
  "dp": psychic_pokemon,
  "dsu": normal_pokemon,
  "expression parsing": psychic_pokemon,
  "fft": electric_pokemon,
  "flows": water_pokemon,
  "games": fairy_pokemon,
  "geometry": rock_pokemon,
  "graph matchings": fairy_pokemon,
  "graphs": ghost_pokemon,
  "greedy": dark_pokemon,
  "hashing": electric_pokemon,
  "implementation": normal_pokemon,
  "interactive": psychic_pokemon,
  "math": dragon_pokemon,
  "matrices": steel_pokemon,
  "meet-in-the-middle": fighting_pokemon,
  "number theory": dragon_pokemon,
  "probabilities": ice_pokemon,
  "schedules": ground_pokemon,
  "shortest paths": flying_pokemon,
  "sortings": normal_pokemon,
  "string suffix structures": grass_pokemon,
  "strings": grass_pokemon,
  "ternary search": psychic_pokemon,
  "trees": grass_pokemon,
  "two pointers": ice_pokemon
};

export function generatePokemonFromTags(tags: string[]): number {
  console.log('Available problem tags:', tags);
  
  const randomTag = tags[Math.floor(Math.random() * tags.length)];
  console.log('Selected random tag:', randomTag);
  
  const pokemonPool = TAG_TYPE_MAPPING[randomTag] || normal_pokemon;
  console.log('Pokemon pool size for tag:', pokemonPool.length);
  
  // Get type name for debugging
  const typeEntries = Object.entries(TAG_TYPE_MAPPING);
  const typeName = typeEntries.find(([_, pool]) => pool === pokemonPool)?.[0] || 'normal';
  console.log('Pokemon type for this tag:', typeName);
  
  const selectedPokemonId = pokemonPool[Math.floor(Math.random() * pokemonPool.length)];
  console.log('Selected Pokemon ID:', selectedPokemonId);
  
  return selectedPokemonId;
}