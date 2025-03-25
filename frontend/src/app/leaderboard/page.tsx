"use client";

import Leaderboard from '@/components/Leaderboard';
import Header from '@/components/Header';

export default function LeaderboardPage() {
  return (
    <div className="container py-10">
      <div className="mt-16">
        <Header />
        <div className="mt-8">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
} 