import { redis } from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { slug } = await request.json();
    if (!slug) return new NextResponse('Slug is required', { status: 400 });

    const key = `blog:${slug}:views`;
    const views = await redis.incr(key);
    
    return NextResponse.json({ views });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) return new NextResponse('Slug is required', { status: 400 });

    const key = `blog:${slug}:views`;
    const views = (await redis.get<number>(key)) || 0;
    
    return NextResponse.json({ views });
  } catch (error) {
    console.error('Error getting view count:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}