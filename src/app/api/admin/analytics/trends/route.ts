import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { watchHistory } from '@/db/schema';
import { sql, count, sum, gte, desc } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'kira-admin-secret';

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

    // Get daily watch time for last 7 days
    const dailyWatchData = await db
      .select({
        date: sql<string>`date(${watchHistory.watchedAt} / 1000, 'unixepoch')`,
        totalSeconds: sum(watchHistory.progressSeconds),
      })
      .from(watchHistory)
      .where(gte(watchHistory.watchedAt, sevenDaysAgo))
      .groupBy(sql`date(${watchHistory.watchedAt} / 1000, 'unixepoch')`)
      .orderBy(sql`date(${watchHistory.watchedAt} / 1000, 'unixepoch')`);

    const dailyWatchTime = dailyWatchData.map((row) => ({
      date: row.date,
      hours: Math.round(Number(row.totalSeconds || 0) / 3600),
    }));

    // Get top content (most viewed)
    const topContentData = await db
      .select({
        contentId: watchHistory.contentId,
        contentType: watchHistory.contentType,
        title: watchHistory.title,
        viewCount: count(),
      })
      .from(watchHistory)
      .groupBy(watchHistory.contentId, watchHistory.contentType, watchHistory.title)
      .orderBy(desc(count()))
      .limit(10);

    const topContent = topContentData.map((row) => ({
      id: parseInt(row.contentId),
      title: row.title,
      type: row.contentType,
      viewCount: row.viewCount,
    }));

    return NextResponse.json({
      dailyWatchTime,
      topContent,
    });
  } catch (error) {
    console.error('Analytics trends error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
