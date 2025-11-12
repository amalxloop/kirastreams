import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contentThemes } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Hex color validation regex
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

function validateHexColor(color: string): boolean {
  return HEX_COLOR_REGEX.test(color);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const contentType = searchParams.get('contentType');

    // Pattern 1: Get specific theme by contentId and contentType
    if (contentId && contentType && contentId.trim() !== '' && contentType.trim() !== '') {
      const theme = await db
        .select()
        .from(contentThemes)
        .where(
          and(
            eq(contentThemes.contentId, contentId.trim()),
            eq(contentThemes.contentType, contentType.trim())
          )
        )
        .limit(1);

      if (theme.length === 0) {
        return NextResponse.json(
          { 
            error: 'Theme not found for the specified content',
            code: 'THEME_NOT_FOUND'
          },
          { status: 404 }
        );
      }

      return NextResponse.json(theme[0], { status: 200 });
    }

    // Pattern 2: Get all themes with pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const themes = await db
      .select()
      .from(contentThemes)
      .orderBy(desc(contentThemes.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select()
      .from(contentThemes);

    return NextResponse.json(
      {
        themes,
        pagination: {
          limit,
          offset,
          total: totalCount.length
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      contentId,
      contentType,
      themeName,
      primaryColor,
      secondaryColor,
      accentColor,
      gradientFrom,
      gradientTo
    } = body;

    // Validate required fields
    if (!contentId || typeof contentId !== 'string' || contentId.trim() === '') {
      return NextResponse.json(
        {
          error: 'contentId is required and must be a non-empty string',
          code: 'MISSING_CONTENT_ID'
        },
        { status: 400 }
      );
    }

    if (!contentType || typeof contentType !== 'string' || contentType.trim() === '') {
      return NextResponse.json(
        {
          error: 'contentType is required and must be a non-empty string',
          code: 'MISSING_CONTENT_TYPE'
        },
        { status: 400 }
      );
    }

    // Validate contentType is either 'movie' or 'tv'
    if (contentType !== 'movie' && contentType !== 'tv') {
      return NextResponse.json(
        {
          error: 'contentType must be either "movie" or "tv"',
          code: 'INVALID_CONTENT_TYPE'
        },
        { status: 400 }
      );
    }

    if (!themeName || typeof themeName !== 'string' || themeName.trim() === '') {
      return NextResponse.json(
        {
          error: 'themeName is required and must be a non-empty string',
          code: 'MISSING_THEME_NAME'
        },
        { status: 400 }
      );
    }

    if (!primaryColor || typeof primaryColor !== 'string') {
      return NextResponse.json(
        {
          error: 'primaryColor is required',
          code: 'MISSING_PRIMARY_COLOR'
        },
        { status: 400 }
      );
    }

    if (!validateHexColor(primaryColor)) {
      return NextResponse.json(
        {
          error: 'primaryColor must be a valid hex color (e.g., #FFFFFF or #FFF)',
          code: 'INVALID_PRIMARY_COLOR'
        },
        { status: 400 }
      );
    }

    if (!secondaryColor || typeof secondaryColor !== 'string') {
      return NextResponse.json(
        {
          error: 'secondaryColor is required',
          code: 'MISSING_SECONDARY_COLOR'
        },
        { status: 400 }
      );
    }

    if (!validateHexColor(secondaryColor)) {
      return NextResponse.json(
        {
          error: 'secondaryColor must be a valid hex color (e.g., #FFFFFF or #FFF)',
          code: 'INVALID_SECONDARY_COLOR'
        },
        { status: 400 }
      );
    }

    if (!accentColor || typeof accentColor !== 'string') {
      return NextResponse.json(
        {
          error: 'accentColor is required',
          code: 'MISSING_ACCENT_COLOR'
        },
        { status: 400 }
      );
    }

    if (!validateHexColor(accentColor)) {
      return NextResponse.json(
        {
          error: 'accentColor must be a valid hex color (e.g., #FFFFFF or #FFF)',
          code: 'INVALID_ACCENT_COLOR'
        },
        { status: 400 }
      );
    }

    // Validate optional gradient colors if provided
    if (gradientFrom && (!validateHexColor(gradientFrom))) {
      return NextResponse.json(
        {
          error: 'gradientFrom must be a valid hex color (e.g., #FFFFFF or #FFF)',
          code: 'INVALID_GRADIENT_FROM'
        },
        { status: 400 }
      );
    }

    if (gradientTo && (!validateHexColor(gradientTo))) {
      return NextResponse.json(
        {
          error: 'gradientTo must be a valid hex color (e.g., #FFFFFF or #FFF)',
          code: 'INVALID_GRADIENT_TO'
        },
        { status: 400 }
      );
    }

    // Check if record exists with same contentId + contentType
    const existing = await db
      .select()
      .from(contentThemes)
      .where(
        and(
          eq(contentThemes.contentId, contentId.trim()),
          eq(contentThemes.contentType, contentType.trim())
        )
      )
      .limit(1);

    const currentTimestamp = Math.floor(Date.now() / 1000);

    // If exists, update the record
    if (existing.length > 0) {
      const updateData: any = {
        themeName: themeName.trim(),
        primaryColor: primaryColor.trim(),
        secondaryColor: secondaryColor.trim(),
        accentColor: accentColor.trim(),
        gradientFrom: gradientFrom ? gradientFrom.trim() : null,
        gradientTo: gradientTo ? gradientTo.trim() : null,
      };

      const updated = await db
        .update(contentThemes)
        .set(updateData)
        .where(
          and(
            eq(contentThemes.contentId, contentId.trim()),
            eq(contentThemes.contentType, contentType.trim())
          )
        )
        .returning();

      return NextResponse.json(updated[0], { status: 200 });
    }

    // If not exists, insert new record
    const insertData: any = {
      contentId: contentId.trim(),
      contentType: contentType.trim(),
      themeName: themeName.trim(),
      primaryColor: primaryColor.trim(),
      secondaryColor: secondaryColor.trim(),
      accentColor: accentColor.trim(),
      gradientFrom: gradientFrom ? gradientFrom.trim() : null,
      gradientTo: gradientTo ? gradientTo.trim() : null,
      createdAt: currentTimestamp,
    };

    const created = await db
      .insert(contentThemes)
      .values(insertData)
      .returning();

    return NextResponse.json(created[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}