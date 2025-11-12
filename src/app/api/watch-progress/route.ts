import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { watchProgress } from '@/db/schema';
import { eq, and, lt, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, contentId, contentType, progressSeconds, totalSeconds } = body;

    // Validate required fields
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json({
        error: 'userId is required and must be a non-empty string',
        code: 'MISSING_USER_ID'
      }, { status: 400 });
    }

    if (!contentId || typeof contentId !== 'string' || contentId.trim() === '') {
      return NextResponse.json({
        error: 'contentId is required and must be a non-empty string',
        code: 'MISSING_CONTENT_ID'
      }, { status: 400 });
    }

    if (!contentType || typeof contentType !== 'string' || contentType.trim() === '') {
      return NextResponse.json({
        error: 'contentType is required and must be a non-empty string',
        code: 'MISSING_CONTENT_TYPE'
      }, { status: 400 });
    }

    // Validate contentType
    if (contentType !== 'movie' && contentType !== 'tv') {
      return NextResponse.json({
        error: 'contentType must be either "movie" or "tv"',
        code: 'INVALID_CONTENT_TYPE'
      }, { status: 400 });
    }

    // Validate progressSeconds
    if (progressSeconds === undefined || progressSeconds === null) {
      return NextResponse.json({
        error: 'progressSeconds is required',
        code: 'MISSING_PROGRESS_SECONDS'
      }, { status: 400 });
    }

    if (typeof progressSeconds !== 'number' || !Number.isInteger(progressSeconds) || progressSeconds < 0) {
      return NextResponse.json({
        error: 'progressSeconds must be a positive integer',
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

    if (typeof totalSeconds !== 'number' || !Number.isInteger(totalSeconds) || totalSeconds <= 0) {
      return NextResponse.json({
        error: 'totalSeconds must be a positive integer greater than 0',
        code: 'INVALID_TOTAL_SECONDS'
      }, { status: 400 });
    }

    // Validate progressSeconds does not exceed totalSeconds
    if (progressSeconds > totalSeconds) {
      return NextResponse.json({
        error: 'progressSeconds cannot exceed totalSeconds',
        code: 'PROGRESS_EXCEEDS_TOTAL'
      }, { status: 400 });
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Check if record exists
    const existingRecord = await db.select()
      .from(watchProgress)
      .where(
        and(
          eq(watchProgress.userId, userId.trim()),
          eq(watchProgress.contentId, contentId.trim()),
          eq(watchProgress.contentType, contentType.trim())
        )
      )
      .limit(1);

    if (existingRecord.length > 0) {
      // Update existing record
      const updated = await db.update(watchProgress)
        .set({
          progressSeconds,
          totalSeconds,
          lastWatchedAt: currentTimestamp,
          updatedAt: currentTimestamp
        })
        .where(
          and(
            eq(watchProgress.userId, userId.trim()),
            eq(watchProgress.contentId, contentId.trim()),
            eq(watchProgress.contentType, contentType.trim())
          )
        )
        .returning();

      return NextResponse.json(updated[0], { status: 200 });
    } else {
      // Insert new record
      const newRecord = await db.insert(watchProgress)
        .values({
          userId: userId.trim(),
          contentId: contentId.trim(),
          contentType: contentType.trim(),
          progressSeconds,
          totalSeconds,
          lastWatchedAt: currentTimestamp,
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp
        })
        .returning();

      return NextResponse.json(newRecord[0], { status: 201 });
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const contentId = searchParams.get('contentId');
    const contentType = searchParams.get('contentType');

    // Validate userId is present
    if (!userId || userId.trim() === '') {
      return NextResponse.json({
        error: 'userId query parameter is required',
        code: 'MISSING_USER_ID'
      }, { status: 400 });
    }

    // Pattern 1: Get specific progress (requires contentId and contentType)
    if (contentId && contentType) {
      if (contentId.trim() === '') {
        return NextResponse.json({
          error: 'contentId must be a non-empty string',
          code: 'INVALID_CONTENT_ID'
        }, { status: 400 });
      }

      if (contentType.trim() === '') {
        return NextResponse.json({
          error: 'contentType must be a non-empty string',
          code: 'INVALID_CONTENT_TYPE'
        }, { status: 400 });
      }

      if (contentType !== 'movie' && contentType !== 'tv') {
        return NextResponse.json({
          error: 'contentType must be either "movie" or "tv"',
          code: 'INVALID_CONTENT_TYPE'
        }, { status: 400 });
      }

      const record = await db.select()
        .from(watchProgress)
        .where(
          and(
            eq(watchProgress.userId, userId.trim()),
            eq(watchProgress.contentId, contentId.trim()),
            eq(watchProgress.contentType, contentType.trim())
          )
        )
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({
          error: 'Watch progress not found',
          code: 'NOT_FOUND'
        }, { status: 404 });
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // Pattern 2: Get all user progress (for continue watching)
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Get all progress records for user
    const allRecords = await db.select()
      .from(watchProgress)
      .where(eq(watchProgress.userId, userId.trim()))
      .orderBy(desc(watchProgress.lastWatchedAt));

    // Filter out completed content (progress >= 95% of total)
    const inProgressRecords = allRecords.filter(record => {
      const completionPercentage = (record.progressSeconds / record.totalSeconds);
      return completionPercentage < 0.95;
    });

    // Get total count for pagination
    const total = inProgressRecords.length;

    // Apply pagination
    const paginatedRecords = inProgressRecords.slice(offset, offset + limit);

    return NextResponse.json({
      progress: paginatedRecords,
      pagination: {
        limit,
        offset,
        total
      }
    }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}