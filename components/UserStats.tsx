// src/components/UserStats.tsx
interface UserStatsProps {
    challengesSolved: number;
    pokemonCaught: number;
  }
  
  const UserStats: React.FC<UserStatsProps> = ({ challengesSolved, pokemonCaught }) => {
    return (
      <div className="p-4 bg-white shadow-md rounded">
        <h3 className="text-lg font-semibold">Your Stats</h3>
        <p>Challenges Solved: {challengesSolved}</p>
        <p>Pokémon Caught: {pokemonCaught}</p>
      </div>
    );
  };
  
  export default UserStats;
  