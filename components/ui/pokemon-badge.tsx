'use client';

import { Badge } from "./badge";

// Define type colors
const TYPE_COLORS = {
  normal: "bg-[#A8A878] hover:bg-[#8A8A59]",
  fire: "bg-[#F08030] hover:bg-[#DD6610]",
  water: "bg-[#6890F0] hover:bg-[#386CEB]",
  electric: "bg-[#F8D030] hover:bg-[#F0C108]",
  grass: "bg-[#78C850] hover:bg-[#5CA935]",
  ice: "bg-[#98D8D8] hover:bg-[#69C6C6]",
  fighting: "bg-[#C03028] hover:bg-[#9D2721]",
  poison: "bg-[#A040A0] hover:bg-[#803380]",
  ground: "bg-[#E0C068] hover:bg-[#D4B24A]",
  flying: "bg-[#A890F0] hover:bg-[#9180C4]",
  psychic: "bg-[#F85888] hover:bg-[#EC3F6A]",
  bug: "bg-[#A8B820] hover:bg-[#8D9A1B]",
  rock: "bg-[#B8A038] hover:bg-[#93802D]",
  ghost: "bg-[#705898] hover:bg-[#554374]",
  dragon: "bg-[#7038F8] hover:bg-[#4C08EF]",
  dark: "bg-[#705848] hover:bg-[#513F34]",
  steel: "bg-[#B8B8D0] hover:bg-[#9797BA]",
  fairy: "bg-[#EE99AC] hover:bg-[#E77A93]"
};

interface PokemonBadgeProps {
  type: string;
}

export function PokemonBadge({ type }: PokemonBadgeProps) {
  const typeClass = TYPE_COLORS[type.toLowerCase() as keyof typeof TYPE_COLORS] || "bg-gray-500 hover:bg-gray-600";
  
  return (
    <Badge 
      className={`${typeClass} border-none text-white shadow-sm`}
      variant="default"
    >
      {type}
    </Badge>
  );
}
