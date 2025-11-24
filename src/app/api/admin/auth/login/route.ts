import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { admins } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'kira-admin-secret';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json({ 
        error: "Email is required",
        code: "MISSING_EMAIL" 
      }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ 
        error: "Password is required",
        code: "MISSING_PASSWORD" 
      }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Query admin by email
    const adminResult = await db.select()
      .from(admins)
      .where(eq(admins.email, normalizedEmail))
      .limit(1);

    if (adminResult.length === 0) {
      return NextResponse.json({ 
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS" 
      }, { status: 401 });
    }

    const admin = adminResult[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ 
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS" 
      }, { status: 401 });
    }

    // Update last login timestamp
    await db.update(admins)
      .set({ lastLoginAt: new Date().toISOString() })
      .where(eq(admins.id, admin.id));

    // Generate JWT token with 7 days expiration
    const token = jwt.sign(
      { 
        id: admin.id,
        email: admin.email,
        role: admin.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return token and admin info (without password)
    const adminInfo = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      createdAt: admin.createdAt,
      lastLoginAt: new Date().toISOString()
    };

    return NextResponse.json({
      token,
      admin: adminInfo
    }, { status: 200 });

  } catch (error) {
    console.error('POST login error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}