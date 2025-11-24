import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { skipTimestamps } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contentId = searchParams.get('contentId');
    const contentType = searchParams.get('contentType');

    // Validate required parameters
    if (!contentId || !contentType) {
      return NextResponse.json(
        {
          error: 'contentId and contentType are required',
          code: 'MISSING_REQUIRED_PARAMS',
        },
        { status: 400 }
      );
    }

    // Validate contentId is non-empty
    if (contentId.trim() === '') {
      return NextResponse.json(
        {
          error: 'contentId must be a non-empty string',
          code: 'INVALID_CONTENT_ID',
        },
        { status: 400 }
      );
    }

    // Validate contentType
    if (contentType !== 'movie' && contentType !== 'tv') {
      return NextResponse.json(
        {
          error: 'contentType must be either "movie" or "tv"',
          code: 'INVALID_CONTENT_TYPE',
        },
        { status: 400 }
      );
    }

    // Query for skip timestamps
    const result = await db
      .select()
      .from(skipTimestamps)
      .where(
        and(
          eq(skipTimestamps.contentId, contentId),
          eq(skipTimestamps.contentType, contentType)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        {
          error: 'No skip timestamps found for this content',
          code: 'TIMESTAMPS_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error('GET skip_timestamps error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, contentType, introStart, introEnd, outroStart, outroEnd } = body;

    // Validate required fields
    if (!contentId || !contentType) {
      return NextResponse.json(
        {
          error: 'contentId and contentType are required',
          code: 'MISSING_REQUIRED_FIELDS',
        },
        { status: 400 }
      );
    }

    // Validate contentId is non-empty string
    if (typeof contentId !== 'string' || contentId.trim() === '') {
      return NextResponse.json(
        {
          error: 'contentId must be a non-empty string',
          code: 'INVALID_CONTENT_ID',
        },
        { status: 400 }
      );
    }

    // Validate contentType is non-empty string
    if (typeof contentType !== 'string' || contentType.trim() === '') {
      return NextResponse.json(
        {
          error: 'contentType must be a non-empty string',
          code: 'INVALID_CONTENT_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate contentType value
    if (contentType !== 'movie' && contentType !== 'tv') {
      return NextResponse.json(
        {
          error: 'contentType must be either "movie" or "tv"',
          code: 'INVALID_CONTENT_TYPE_VALUE',
        },
        { status: 400 }
      );
    }

    // Validate timestamp fields are non-negative integers if provided
    const validateTimestamp = (value: any, fieldName: string) => {
      if (value !== undefined && value !== null) {
        if (!Number.isInteger(value) || value < 0) {
          return `${fieldName} must be a non-negative integer`;
        }
      }
      return null;
    };

    const introStartError = validateTimestamp(introStart, 'introStart');
    if (introStartError) {
      return NextResponse.json(
        {
          error: introStartError,
          code: 'INVALID_INTRO_START',
        },
        { status: 400 }
      );
    }

    const introEndError = validateTimestamp(introEnd, 'introEnd');
    if (introEndError) {
      return NextResponse.json(
        {
          error: introEndError,
          code: 'INVALID_INTRO_END',
        },
        { status: 400 }
      );
    }

    const outroStartError = validateTimestamp(outroStart, 'outroStart');
    if (outroStartError) {
      return NextResponse.json(
        {
          error: outroStartError,
          code: 'INVALID_OUTRO_START',
        },
        { status: 400 }
      );
    }

    const outroEndError = validateTimestamp(outroEnd, 'outroEnd');
    if (outroEndError) {
      return NextResponse.json(
        {
          error: outroEndError,
          code: 'INVALID_OUTRO_END',
        },
        { status: 400 }
      );
    }

    // Validate intro range
    if (
      introStart !== undefined &&
      introStart !== null &&
      introEnd !== undefined &&
      introEnd !== null
    ) {
      if (introEnd <= introStart) {
        return NextResponse.json(
          {
            error: 'introEnd must be greater than introStart',
            code: 'INVALID_INTRO_RANGE',
          },
          { status: 400 }
        );
      }
    }

    // Validate outro range
    if (
      outroStart !== undefined &&
      outroStart !== null &&
      outroEnd !== undefined &&
      outroEnd !== null
    ) {
      if (outroEnd <= outroStart) {
        return NextResponse.json(
          {
            error: 'outroEnd must be greater than outroStart',
            code: 'INVALID_OUTRO_RANGE',
          },
          { status: 400 }
        );
      }
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(skipTimestamps)
      .where(
        and(
          eq(skipTimestamps.contentId, contentId),
          eq(skipTimestamps.contentType, contentType)
        )
      )
      .limit(1);

    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (existing.length > 0) {
      // Update existing record
      const updateData: any = {};

      if (introStart !== undefined) updateData.introStart = introStart;
      if (introEnd !== undefined) updateData.introEnd = introEnd;
      if (outroStart !== undefined) updateData.outroStart = outroStart;
      if (outroEnd !== undefined) updateData.outroEnd = outroEnd;

      const updated = await db
        .update(skipTimestamps)
        .set(updateData)
        .where(
          and(
            eq(skipTimestamps.contentId, contentId),
            eq(skipTimestamps.contentType, contentType)
          )
        )
        .returning();

      return NextResponse.json(updated[0], { status: 200 });
    } else {
      // Insert new record
      const insertData = {
        contentId,
        contentType,
        introStart: introStart ?? null,
        introEnd: introEnd ?? null,
        outroStart: outroStart ?? null,
        outroEnd: outroEnd ?? null,
        createdAt: currentTimestamp,
      };

      const newRecord = await db.insert(skipTimestamps).values(insertData).returning();

      return NextResponse.json(newRecord[0], { status: 201 });
    }
  } catch (error) {
    console.error('POST skip_timestamps error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}