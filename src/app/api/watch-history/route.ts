import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { watchHistory } from '@/db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      contentId,
      contentType,
      title,
      posterPath,
      watchedAt,
      progressSeconds,
      totalSeconds
    } = body;

    // Validate required fields
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json({
        error: 'userId is required and must be a non-empty string',
        code: 'INVALID_USER_ID'
      }, { status: 400 });
    }

    if (!contentId || typeof contentId !== 'string' || contentId.trim() === '') {
      return NextResponse.json({
        error: 'contentId is required and must be a non-empty string',
        code: 'INVALID_CONTENT_ID'
      }, { status: 400 });
    }

    if (!contentType || typeof contentType !== 'string' || contentType.trim() === '') {
      return NextResponse.json({
        error: 'contentType is required and must be a non-empty string',
        code: 'INVALID_CONTENT_TYPE'
      }, { status: 400 });
    }

    if (contentType !== 'movie' && contentType !== 'tv') {
      return NextResponse.json({
        error: 'contentType must be either "movie" or "tv"',
        code: 'INVALID_CONTENT_TYPE_VALUE'
      }, { status: 400 });
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({
        error: 'title is required and must be a non-empty string',
        code: 'INVALID_TITLE'
      }, { status: 400 });
    }

    // Validate progressSeconds
    if (progressSeconds === undefined || progressSeconds === null) {
      return NextResponse.json({
        error: 'progressSeconds is required',
        code: 'MISSING_PROGRESS_SECONDS'
      }, { status: 400 });
    }

    if (typeof progressSeconds !== 'number' || progressSeconds < 0 || !Number.isInteger(progressSeconds)) {
      return NextResponse.json({
        error: 'progressSeconds must be a non-negative integer',
        code: 'INVALID_PROGRESS_SECONDS'
      }, { status: 400 });
    }

    // Validate totalSeconds
    if (totalSeconds === undefined || totalSeconds === null) {
      return NextResponse.json({
        error: 'totalSeconds is required',
        code: 'MISSING_TOTAL_SECONDS'
      }, { status: 400 });
    }

    if (typeof totalSeconds !== 'number' || totalSeconds <= 0 || !Number.isInteger(totalSeconds)) {
      return NextResponse.json({
        error: 'totalSeconds must be a positive integer',
        code: 'INVALID_TOTAL_SECONDS'
      }, { status: 400 });
    }

    // Validate watchedAt
    const finalWatchedAt = watchedAt !== undefined && watchedAt !== null 
      ? watchedAt 
      : Math.floor(Date.now() / 1000);

    if (typeof finalWatchedAt !== 'number' || finalWatchedAt < 0 || !Number.isInteger(finalWatchedAt)) {
      return NextResponse.json({
        error: 'watchedAt must be a valid Unix timestamp',
        code: 'INVALID_WATCHED_AT'
      }, { status: 400 });
    }

    // Create new watch history entry
    const newEntry = await db.insert(watchHistory)
      .values({
        userId: userId.trim(),
        contentId: contentId.trim(),
        contentType: contentType.trim(),
        title: title.trim(),
        posterPath: posterPath || null,
        watchedAt: finalWatchedAt,
        progressSeconds,
        totalSeconds
      })
      .returning();

    return NextResponse.json(newEntry[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // Validate required userId parameter
    if (!userId || userId.trim() === '') {
      return NextResponse.json({
        error: 'userId query parameter is required',
        code: 'MISSING_USER_ID'
      }, { status: 400 });
    }

    // Parse and validate optional parameters
    const daysParam = searchParams.get('days');
    const days = daysParam 
      ? Math.min(Math.max(parseInt(daysParam), 1), 365) 
      : 30;

    if (daysParam && (isNaN(days) || days < 1 || days > 365)) {
      return NextResponse.json({
        error: 'days must be a positive integer between 1 and 365',
        code: 'INVALID_DAYS'
      }, { status: 400 });
    }

    const limitParam = searchParams.get('limit');
    const limit = limitParam 
      ? Math.min(parseInt(limitParam), 100) 
      : 20;

    if (limitParam && (isNaN(limit) || limit < 1)) {
      return NextResponse.json({
        error: 'limit must be a positive integer',
        code: 'INVALID_LIMIT'
      }, { status: 400 });
    }

    const offsetParam = searchParams.get('offset');
    const offset = offsetParam 
      ? Math.max(parseInt(offsetParam), 0) 
      : 0;

    if (offsetParam && (isNaN(offset) || offset < 0)) {
      return NextResponse.json({
        error: 'offset must be a non-negative integer',
        code: 'INVALID_OFFSET'
      }, { status: 400 });
    }

    const contentType = searchParams.get('contentType');
    if (contentType && contentType !== 'movie' && contentType !== 'tv') {
      return NextResponse.json({
        error: 'contentType must be either "movie" or "tv"',
        code: 'INVALID_CONTENT_TYPE'
      }, { status: 400 });
    }

    // Calculate cutoff timestamp
    const currentTime = Math.floor(Date.now() / 1000);
    const cutoffTimestamp = currentTime - (days * 24 * 60 * 60);

    // Build query conditions
    const conditions = [
      eq(watchHistory.userId, userId.trim()),
      gte(watchHistory.watchedAt, cutoffTimestamp)
    ];

    if (contentType) {
      conditions.push(eq(watchHistory.contentType, contentType));
    }

    // Execute query
    const results = await db.select()
      .from(watchHistory)
      .where(and(...conditions))
      .orderBy(desc(watchHistory.watchedAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination metadata
    const totalResults = await db.select()
      .from(watchHistory)
      .where(and(...conditions));

    const total = totalResults.length;

    // Build response
    const response = {
      history: results,
      pagination: {
        limit,
        offset,
        days,
        total
      },
      filters: {
        userId: userId.trim(),
        ...(contentType && { contentType }),
        days
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}