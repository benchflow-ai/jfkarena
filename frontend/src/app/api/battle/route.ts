import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { model1, model2, question } = await request.json();

    // Call Python backend
    const response = await fetch('http://localhost:8000/battle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model1,
        model2,
        question,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process battle request' },
      { status: 500 }
    );
  }
} 