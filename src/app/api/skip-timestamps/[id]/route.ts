import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { skipTimestamps } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const recordId = parseInt(id);

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(skipTimestamps)
      .where(eq(skipTimestamps.id, recordId))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        {
          error: 'Skip timestamps record not found',
          code: 'RECORD_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      contentId,
      contentType,
      introStart,
      introEnd,
      outroStart,
      outroEnd,
    } = body;

    // Validate contentType if provided
    if (contentType && !['movie', 'tv'].includes(contentType)) {
      return NextResponse.json(
        {
          error: 'Content type must be either "movie" or "tv"',
          code: 'INVALID_CONTENT_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate timestamp values if provided
    if (introStart !== undefined && (typeof introStart !== 'number' || introStart < 0)) {
      return NextResponse.json(
        {
          error: 'introStart must be a non-negative integer',
          code: 'INVALID_INTRO_START',
        },
        { status: 400 }
      );
    }

    if (introEnd !== undefined && (typeof introEnd !== 'number' || introEnd < 0)) {
      return NextResponse.json(
        {
          error: 'introEnd must be a non-negative integer',
          code: 'INVALID_INTRO_END',
        },
        { status: 400 }
      );
    }

    if (outroStart !== undefined && (typeof outroStart !== 'number' || outroStart < 0)) {
      return NextResponse.json(
        {
          error: 'outroStart must be a non-negative integer',
          code: 'INVALID_OUTRO_START',
        },
        { status: 400 }
      );
    }

    if (outroEnd !== undefined && (typeof outroEnd !== 'number' || outroEnd < 0)) {
      return NextResponse.json(
        {
          error: 'outroEnd must be a non-negative integer',
          code: 'INVALID_OUTRO_END',
        },
        { status: 400 }
      );
    }

    // Validate intro range
    const finalIntroStart = introStart !== undefined ? introStart : existingRecord[0].introStart;
    const finalIntroEnd = introEnd !== undefined ? introEnd : existingRecord[0].introEnd;
    
    if (
      finalIntroStart !== null &&
      finalIntroEnd !== null &&
      finalIntroEnd <= finalIntroStart
    ) {
      return NextResponse.json(
        {
          error: 'introEnd must be greater than introStart',
          code: 'INVALID_INTRO_RANGE',
        },
        { status: 400 }
      );
    }

    // Validate outro range
    const finalOutroStart = outroStart !== undefined ? outroStart : existingRecord[0].outroStart;
    const finalOutroEnd = outroEnd !== undefined ? outroEnd : existingRecord[0].outroEnd;
    
    if (
      finalOutroStart !== null &&
      finalOutroEnd !== null &&
      finalOutroEnd <= finalOutroStart
    ) {
      return NextResponse.json(
        {
          error: 'outroEnd must be greater than outroStart',
          code: 'INVALID_OUTRO_RANGE',
        },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {};

    if (contentId !== undefined) updateData.contentId = contentId;
    if (contentType !== undefined) updateData.contentType = contentType;
    if (introStart !== undefined) updateData.introStart = introStart;
    if (introEnd !== undefined) updateData.introEnd = introEnd;
    if (outroStart !== undefined) updateData.outroStart = outroStart;
    if (outroEnd !== undefined) updateData.outroEnd = outroEnd;

    // Perform update
    const updatedRecord = await db
      .update(skipTimestamps)
      .set(updateData)
      .where(eq(skipTimestamps.id, recordId))
      .returning();

    return NextResponse.json(updatedRecord[0], { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error.message,
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const recordId = parseInt(id);

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(skipTimestamps)
      .where(eq(skipTimestamps.id, recordId))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        {
          error: 'Skip timestamps record not found',
          code: 'RECORD_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Delete the record
    const deletedRecord = await db
      .delete(skipTimestamps)
      .where(eq(skipTimestamps.id, recordId))
      .returning();

    return NextResponse.json(
      {
        message: 'Skip timestamps deleted successfully',
        deletedRecord: deletedRecord[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error.message,
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}