import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { models } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const modelScores = await db
      .select()
      .from(models)
      .orderBy(desc(models.arenaScore));

    return NextResponse.json(modelScores);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
} 