import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contentThemes } from '@/db/schema';
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

    const contentThemeId = parseInt(id);

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(contentThemes)
      .where(eq(contentThemes.id, contentThemeId))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        {
          error: 'Content theme not found',
          code: 'CONTENT_THEME_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Delete the record and return deleted data
    const deleted = await db
      .delete(contentThemes)
      .where(eq(contentThemes.id, contentThemeId))
      .returning();

    return NextResponse.json(
      {
        message: 'Content theme deleted successfully',
        deletedRecord: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}