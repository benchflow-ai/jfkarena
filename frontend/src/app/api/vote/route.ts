import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { battles, models } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { winnerId, model1Id, model2Id, question, model1Response, model2Response } = await request.json();

    // Create battle record
    await db.insert(battles).values({
      question,
      model1Id,
      model2Id,
      model1Response,
      model2Response,
      winnerId,
    });

    // Update winner's arena score
    await db
      .update(models)
      .set({ arenaScore: sql`arena_score + 1` })
      .where(eq(models.id, winnerId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
} 