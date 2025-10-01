import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { content, users } from '@/db/schema';
import { eq, like, and, or, desc, asc, count } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// JWT verification helper
async function verifyAdminAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, 'kira-admin-secret') as { id: number; email: string; role: string };

    // Verify admin exists in database and has admin role
    const admin = await db.select()
      .from(users)
      .where(and(eq(users.id, decoded.id), eq(users.role, 'admin')))
      .limit(1);

    if (admin.length === 0) {
      return null;
    }

    return admin[0];
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ 
        error: 'Authentication required or insufficient permissions',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Search parameter
    const search = searchParams.get('search');
    
    // Filter parameters
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    
    // Sort parameters
    const sortField = searchParams.get('sort') || 'createdAt';
    const sortOrder = searchParams.get('order') || 'desc';

    // Build base query
    let query = db.select().from(content);
    let conditions = [];

    // Add search condition
    if (search) {
      conditions.push(
        or(
          like(content.title, `%${search}%`),
          like(content.description, `%${search}%`)
        )
      );
    }

    // Add filter conditions
    if (type && (type === 'movie' || type === 'tv')) {
      conditions.push(eq(content.type, type));
    }

    if (status && (status === 'published' || status === 'draft')) {
      conditions.push(eq(content.status, status));
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const orderBy = sortOrder === 'asc' ? asc : desc;
    if (sortField === 'title') {
      query = query.orderBy(orderBy(content.title));
    } else if (sortField === 'type') {
      query = query.orderBy(orderBy(content.type));
    } else if (sortField === 'status') {
      query = query.orderBy(orderBy(content.status));
    } else if (sortField === 'releaseDate') {
      query = query.orderBy(orderBy(content.releaseDate));
    } else if (sortField === 'viewCount') {
      query = query.orderBy(orderBy(content.viewCount));
    } else {
      query = query.orderBy(orderBy(content.createdAt));
    }

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    // Get total count for pagination info
    let countQuery = db.select({ count: count() }).from(content);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const [{ count: totalCount }] = await countQuery;

    return NextResponse.json({
      data: results,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('GET /api/admin/content error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ 
        error: 'Authentication required or insufficient permissions',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const requestBody = await request.json();

    // Validate required fields
    const { title, type } = requestBody;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ 
        error: 'Title is required and must be a non-empty string',
        code: 'MISSING_TITLE' 
      }, { status: 400 });
    }

    if (!type || typeof type !== 'string') {
      return NextResponse.json({ 
        error: 'Type is required',
        code: 'MISSING_TYPE' 
      }, { status: 400 });
    }

    // Validate type field against allowed values
    if (type !== 'movie' && type !== 'tv') {
      return NextResponse.json({ 
        error: 'Type must be either "movie" or "tv"',
        code: 'INVALID_TYPE' 
      }, { status: 400 });
    }

    // Extract optional fields
    const {
      description,
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

    // Validate optional fields
    if (language && typeof language !== 'string') {
      return NextResponse.json({ 
        error: 'Language must be a string',
        code: 'INVALID_LANGUAGE' 
      }, { status: 400 });
    }

    if (status && status !== 'published' && status !== 'draft') {
      return NextResponse.json({ 
        error: 'Status must be either "published" or "draft"',
        code: 'INVALID_STATUS' 
      }, { status: 400 });
    }

    if (tmdbId && (typeof tmdbId !== 'number' || tmdbId < 0)) {
      return NextResponse.json({ 
        error: 'TMDB ID must be a positive number',
        code: 'INVALID_TMDB_ID' 
      }, { status: 400 });
    }

    if (duration && (typeof duration !== 'number' || duration < 0)) {
      return NextResponse.json({ 
        error: 'Duration must be a positive number',
        code: 'INVALID_DURATION' 
      }, { status: 400 });
    }

    if (viewCount && (typeof viewCount !== 'number' || viewCount < 0)) {
      return NextResponse.json({ 
        error: 'View count must be a positive number',
        code: 'INVALID_VIEW_COUNT' 
      }, { status: 400 });
    }

    // Prepare insert data with defaults and sanitization
    const now = new Date().toISOString();
    const insertData = {
      title: title.trim(),
      description: description ? String(description).trim() : null,
      type,
      genre: genre || null,
      language: language || 'en',
      thumbnailUrl: thumbnailUrl || null,
      posterUrl: posterUrl || null,
      trailerUrl: trailerUrl || null,
      videoUrl: videoUrl || null,
      subtitleUrls: subtitleUrls || null,
      tmdbId: tmdbId || null,
      releaseDate: releaseDate || null,
      duration: duration || null,
      status: status || 'draft',
      viewCount: viewCount || 0,
      createdAt: now,
      updatedAt: now
    };

    // Insert new content record
    const [newContent] = await db.insert(content)
      .values(insertData)
      .returning();

    return NextResponse.json(newContent, { status: 201 });

  } catch (error) {
    console.error('POST /api/admin/content error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}