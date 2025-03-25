import Leaderboard from '@/components/Leaderboard';
import Header from '@/components/Header';

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Model Leaderboard</h1>
        <Leaderboard />
      </div>
    </div>
  );
} 