import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { admins } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'kira-admin-secret';

export async function GET(request: NextRequest) {
  try {
    // Extract Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authorization header with Bearer token is required',
        code: 'MISSING_TOKEN' 
      }, { status: 401 });
    }

    // Extract token from Bearer header
    const token = authHeader.substring(7);
    
    if (!token) {
      return NextResponse.json({ 
        error: 'Token is required',
        code: 'MISSING_TOKEN' 
      }, { status: 401 });
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN' 
      }, { status: 401 });
    }

    // Extract admin ID from decoded token
    const adminId = decoded.id || decoded.adminId;
    
    if (!adminId) {
      return NextResponse.json({ 
        error: 'Invalid token payload',
        code: 'INVALID_TOKEN_PAYLOAD' 
      }, { status: 401 });
    }

    // Query admin by ID
    const adminResult = await db.select()
      .from(admins)
      .where(eq(admins.id, parseInt(adminId)))
      .limit(1);

    if (adminResult.length === 0) {
      return NextResponse.json({ 
        error: 'Admin not found',
        code: 'ADMIN_NOT_FOUND' 
      }, { status: 404 });
    }

    const admin = adminResult[0];

    // Return admin info without password
    const { passwordHash, ...adminInfo } = admin;

    return NextResponse.json(adminInfo, { status: 200 });

  } catch (error) {
    console.error('GET /api/admin/auth/me error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}