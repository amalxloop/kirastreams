import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { watchProgress } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID is a valid integer
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

    // Check if record exists before deleting
    const existingRecord = await db
      .select()
      .from(watchProgress)
      .where(eq(watchProgress.id, recordId))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        {
          error: 'Watch progress record not found',
          code: 'RECORD_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Delete the record and return the deleted data
    const deleted = await db
      .delete(watchProgress)
      .where(eq(watchProgress.id, recordId))
      .returning();

    return NextResponse.json(
      {
        message: 'Watch progress deleted successfully',
        deletedRecord: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}