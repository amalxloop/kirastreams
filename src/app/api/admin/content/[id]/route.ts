import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { content, users } from "@/db/schema";
import { eq, like, and, or, desc, asc, count } from "drizzle-orm";
import jwt from "jsonwebtoken";

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || "fallback_secret";

// ---------- AUTH MIDDLEWARE ----------
async function verifyAdminAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, ADMIN_SECRET) as {
      id: number;
      email: string;
      role: string;
    };

    const admin = await db
      .select()
      .from(users)
      .where(and(eq(users.id, decoded.id), eq(users.role, "admin")))
      .limit(1);

    return admin.length > 0 ? admin[0] : null;
  } catch {
    return null;
  }
}

// ---------- GET: List Content ----------
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        {
          error: "Authentication required or insufficient permissions",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const limit = Math.min(Number(searchParams.get("limit") || 10), 100);
    const offset = Number(searchParams.get("offset") || 0);

    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    const sortField = searchParams.get("sort") || "createdAt";
    const sortOrder = searchParams.get("order") || "desc";

    let query = db.select().from(content);

    const filters = [];

    if (search) {
  filters.push(
    or(
      like(content.title, `%${search}%`),
      like(content.description, `%${search}%`)
    )
  );
}

    if (type === "movie" || type === "tv") filters.push(eq(content.type, type));
    if (status === "published" || status === "draft")
      filters.push(eq(content.status, status));

    if (filters.length > 0) query = query.where(and(...filters));

    const orderBy = sortOrder === "asc" ? asc : desc;

    const validSortFields = {
      title: content.title,
      type: content.type,
      status: content.status,
      releaseDate: content.releaseDate,
      viewCount: content.viewCount,
      createdAt: content.createdAt,
    };

    query = query.orderBy(orderBy(validSortFields[sortField] || content.createdAt));

    const results = await query.limit(limit).offset(offset);

    let countQuery = db.select({ count: count() }).from(content);
    if (filters.length) countQuery = countQuery.where(and(...filters));
    const [{ count: totalCount }] = await countQuery;

    return NextResponse.json({
      data: results,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (err) {
    console.error("GET /api/admin/content error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

// ---------- POST: Create Content ----------
export async function POST(request: NextRequest, context: { params: { id: string } }) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        {
          error: "Authentication required or insufficient permissions",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, type } = body;

    if (!title  typeof title !== "string"  title.trim() === "") {
      return NextResponse.json(
        { error: "Title required", code: "MISSING_TITLE" },
        { status: 400 }
      );
    }

if (!type || (type !== "movie" && type !== "tv")) {
      return NextResponse.json(
        { error: 'Type must be "movie" or "tv"', code: "INVALID_TYPE" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const insertData = {
      title: title.trim(),
      description: body.description || null,
      type,
      genre: body.genre || null,
      language: body.language || "en",
      thumbnailUrl: body.thumbnailUrl || null,
      posterUrl: body.posterUrl || null,
      trailerUrl: body.trailerUrl || null,
      videoUrl: body.videoUrl || null,
      subtitleUrls: body.subtitleUrls || null,
      tmdbId: body.tmdbId || null,
      releaseDate: body.releaseDate || null,
      duration: body.duration || null,
      status: body.status === "published" ? "published" : "draft",
      viewCount: body.viewCount || 0,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await db.insert(content).values(insertData).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/content error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
