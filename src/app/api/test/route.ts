import { redis } from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test Redis connection
    await redis.set('test:nextjs', 'Connected!');
    const value = await redis.get('test:nextjs');
    
    return NextResponse.json({ 
      success: true, 
      value,
      message: 'Redis connection successful!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Redis connection test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}