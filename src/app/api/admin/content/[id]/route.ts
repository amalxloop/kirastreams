import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { content, admins } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

interface AdminTokenPayload {
  id: number;
  email: string;
  role: string;
}

async function verifyAdminAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, 'kira-admin-secret') as AdminTokenPayload;

    const admin = await db.select()
      .from(admins)
      .where(eq(admins.id, decoded.id))
      .limit(1);

    if (admin.length === 0 || admin[0].role !== 'admin') {
      return null;
    }

    return admin[0];
  } catch (error) {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }, { status: 401 });
    }

    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const contentRecord = await db.select()
      .from(content)
      .where(eq(content.id, parseInt(id)))
      .limit(1);

    if (contentRecord.length === 0) {
      return NextResponse.json({
        error: 'Content not found',
        code: 'CONTENT_NOT_FOUND'
      }, { status: 404 });
    }

    return NextResponse.json(contentRecord[0]);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }, { status: 401 });
    }

    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const {
      title,
      description,
      type,
      genre,
      language,
      thumbnailUrl,
      posterUrl,
      trailerUrl,
      videoUrl,
      subtitleUrls,
      tmdbId,
      releaseDate,
      duration,
      status,
      viewCount
    } = requestBody;

    // Validate type if provided
    if (type && !['movie', 'tv'].includes(type)) {
      return NextResponse.json({
        error: 'Type must be either "movie" or "tv"',
        code: 'INVALID_TYPE'
      }, { status: 400 });
    }

    // Validate status if provided
    if (status && !['published', 'draft'].includes(status)) {
      return NextResponse.json({
        error: 'Status must be either "published" or "draft"',
        code: 'INVALID_STATUS'
      }, { status: 400 });
    }

    // Check if content exists
    const existingContent = await db.select()
      .from(content)
      .where(eq(content.id, parseInt(id)))
      .limit(1);

    if (existingContent.length === 0) {
      return NextResponse.json({
        error: 'Content not found',
        code: 'CONTENT_NOT_FOUND'
      }, { status: 404 });
    }

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) updates.title = title?.trim();
    if (description !== undefined) updates.description = description?.trim();
    if (type !== undefined) updates.type = type;
    if (genre !== undefined) updates.genre = genre;
    if (language !== undefined) updates.language = language?.trim();
    if (thumbnailUrl !== undefined) updates.thumbnailUrl = thumbnailUrl?.trim();
    if (posterUrl !== undefined) updates.posterUrl = posterUrl?.trim();
    if (trailerUrl !== undefined) updates.trailerUrl = trailerUrl?.trim();
    if (videoUrl !== undefined) updates.videoUrl = videoUrl?.trim();
    if (subtitleUrls !== undefined) updates.subtitleUrls = subtitleUrls;
    if (tmdbId !== undefined) updates.tmdbId = tmdbId;
    if (releaseDate !== undefined) updates.releaseDate = releaseDate;
    if (duration !== undefined) updates.duration = duration;
    if (status !== undefined) updates.status = status;
    if (viewCount !== undefined) updates.viewCount = viewCount;

    const updatedContent = await db.update(content)
      .set(updates)
      .where(eq(content.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedContent[0]);
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }, { status: 401 });
    }

    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    // Check if content exists
    const existingContent = await db.select()
      .from(content)
      .where(eq(content.id, parseInt(id)))
      .limit(1);

    if (existingContent.length === 0) {
      return NextResponse.json({
        error: 'Content not found',
        code: 'CONTENT_NOT_FOUND'
      }, { status: 404 });
    }

    const deletedContent = await db.delete(content)
      .where(eq(content.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Content deleted successfully',
      deletedContent: deletedContent[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}