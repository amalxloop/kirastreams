import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, watchHistory, watchProgress } from '@/db/schema';
import { sql, count, sum, gte } from 'drizzle-orm';
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

    // Calculate timestamps
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const fiveMinutesAgo = now - (5 * 60 * 1000);

    // Get total active users (all registered users)
    const activeUsersResult = await db.select({ count: count() }).from(users);
    const activeUsers = activeUsersResult[0]?.count || 0;

    // Get concurrent viewers (users who watched in last 5 minutes)
    const concurrentViewersResult = await db
      .select({ count: count() })
      .from(watchHistory)
      .where(gte(watchHistory.watchedAt, fiveMinutesAgo));
    const concurrentViewers = concurrentViewersResult[0]?.count || 0;

    // Get total watch hours from watch history
    const watchHoursResult = await db
      .select({ totalSeconds: sum(watchHistory.progressSeconds) })
      .from(watchHistory);
    const totalSeconds = Number(watchHoursResult[0]?.totalSeconds || 0);
    const totalWatchHours = Math.round(totalSeconds / 3600);

    // Get new signups in last 30 days
    const newSignupsResult = await db
      .select({ count: count() })
      .from(users)
      .where(sql`strftime('%s', ${users.createdAt}) * 1000 >= ${thirtyDaysAgo}`);
    const newSignups = newSignupsResult[0]?.count || 0;

    return NextResponse.json({
      activeUsers,
      concurrentViewers,
      totalWatchHours,
      newSignups,
    });
  } catch (error) {
    console.error('Analytics stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
