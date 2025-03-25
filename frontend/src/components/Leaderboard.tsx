"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface ModelStats {
  id: string;
  name: string;
  wins: number;
  losses: number;
  draws: number;
  invalid: number;
  elo: number;
}

export default function Leaderboard() {
  const [models, setModels] = useState<ModelStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/leaderboard`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch leaderboard data`);
        }
        const data = await response.json();
        setModels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-center p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Rank</TableHead>
            <TableHead>Model</TableHead>
            <TableHead className="text-right">ELO</TableHead>
            <TableHead className="text-right">Wins</TableHead>
            <TableHead className="text-right">Losses</TableHead>
            <TableHead className="text-right">Draws</TableHead>
            <TableHead className="text-right">Invalid</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((model, index) => (
            <TableRow key={model.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>{model.name}</TableCell>
              <TableCell className="text-right">{Math.round(model.elo)}</TableCell>
              <TableCell className="text-right text-green-600">{model.wins}</TableCell>
              <TableCell className="text-right text-red-600">{model.losses}</TableCell>
              <TableCell className="text-right text-yellow-600">{model.draws}</TableCell>
              <TableCell className="text-right text-muted-foreground">{model.invalid}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
} 