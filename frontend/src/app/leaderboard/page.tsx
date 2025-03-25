"use client";

import { useState, useEffect } from "react";

interface LeaderboardEntry {
  id: string;
  name: string;
  wins: number;
  losses: number;
  draws: number;
  invalid: number;
  elo: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("http://localhost:8000/leaderboard");
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard");
        }
        const data = await response.json();
        setLeaderboard(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const calculateWinRate = (entry: LeaderboardEntry) => {
    const totalBattles = entry.wins + entry.losses + entry.draws + entry.invalid;
    if (totalBattles === 0) return "0.0%";
    return ((entry.wins / totalBattles) * 100).toFixed(1) + "%";
  };

  const calculateTotalBattles = (entry: LeaderboardEntry) => {
    return entry.wins + entry.losses + entry.draws + entry.invalid;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="linear-card">
        <h1 className="text-2xl font-bold mb-6 linear-gradient">Leaderboard</h1>
        {loading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-muted-foreground font-medium">Rank</th>
                  <th className="text-left py-4 px-4 text-muted-foreground font-medium">Model</th>
                  <th className="text-right py-4 px-4 text-muted-foreground font-medium">Wins</th>
                  <th className="text-right py-4 px-4 text-muted-foreground font-medium">Battles</th>
                  <th className="text-right py-4 px-4 text-muted-foreground font-medium">Win Rate</th>
                  <th className="text-right py-4 px-4 text-muted-foreground font-medium">ELO</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className="hover-effect border-b border-border"
                  >
                    <td className="py-4 px-4">{index + 1}</td>
                    <td className="py-4 px-4 font-medium">
                      {entry.name}
                    </td>
                    <td className="py-4 px-4 text-right">{entry.wins}</td>
                    <td className="py-4 px-4 text-right">{calculateTotalBattles(entry)}</td>
                    <td className="py-4 px-4 text-right">
                      {calculateWinRate(entry)}
                    </td>
                    <td className="py-4 px-4 text-right">{entry.elo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 