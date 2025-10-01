import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { admins } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'kira-admin-secret';

// Helper function to verify JWT token and check admin role
async function verifyAdminAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    
    // Get admin from database to verify role
    const admin = await db.select()
      .from(admins)
      .where(eq(admins.id, decoded.id))
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
        error: 'Admin authentication required',
        code: 'ADMIN_AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let query = db.select({
      id: admins.id,
      email: admins.email,
      name: admins.name,
      role: admins.role,
      createdAt: admins.createdAt,
      lastLoginAt: admins.lastLoginAt
    }).from(admins);

    // Apply search filter
    if (search) {
      query = query.where(
        or(
          like(admins.name, `%${search}%`),
          like(admins.email, `%${search}%`)
        )
      );
    }

    const results = await query
      .orderBy(desc(admins.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      admins: results,
      limit,
      offset
    });
  } catch (error) {
    console.error('GET admins error:', error);
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
        error: 'Admin authentication required',
        code: 'ADMIN_AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const requestBody = await request.json();
    const { email, password, name, role } = requestBody;

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

    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim().toLowerCase())) {
      return NextResponse.json({ 
        error: 'Invalid email format',
        code: 'INVALID_EMAIL_FORMAT' 
      }, { status: 400 });
    }

    // Check if email already exists
    const existingAdmin = await db.select()
      .from(admins)
      .where(eq(admins.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingAdmin.length > 0) {
      return NextResponse.json({ 
        error: "Email already exists",
        code: "EMAIL_EXISTS" 
      }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = await db.insert(admins)
      .values({
        email: email.toLowerCase().trim(),
        passwordHash,
        name: name.trim(),
        role: role || 'admin',
        createdAt: new Date().toISOString(),
        lastLoginAt: null
      })
      .returning({
        id: admins.id,
        email: admins.email,
        name: admins.name,
        role: admins.role,
        createdAt: admins.createdAt,
        lastLoginAt: admins.lastLoginAt
      });

    return NextResponse.json(newAdmin[0], { status: 201 });
  } catch (error) {
    console.error('POST admins error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const currentAdmin = await verifyAdminAuth(request);
    if (!currentAdmin) {
      return NextResponse.json({ 
        error: 'Admin authentication required',
        code: 'ADMIN_AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const adminId = parseInt(id);

    // Prevent self-modification
    if (adminId === currentAdmin.id) {
      return NextResponse.json({ 
        error: "Cannot modify your own account",
        code: "SELF_MODIFICATION_FORBIDDEN" 
      }, { status: 403 });
    }

    const requestBody = await request.json();
    const { email, name, role } = requestBody;

    // Check if admin exists
    const existingAdmin = await db.select()
      .from(admins)
      .where(eq(admins.id, adminId))
      .limit(1);

    if (existingAdmin.length === 0) {
      return NextResponse.json({ 
        error: 'Admin not found',
        code: 'ADMIN_NOT_FOUND' 
      }, { status: 404 });
    }

    // Check email uniqueness if email is being updated
    if (email && email.toLowerCase().trim() !== existingAdmin[0].email) {
      const emailExists = await db.select()
        .from(admins)
        .where(eq(admins.email, email.toLowerCase().trim()))
        .limit(1);

      if (emailExists.length > 0) {
        return NextResponse.json({ 
          error: "Email already exists",
          code: "EMAIL_EXISTS" 
        }, { status: 400 });
      }
    }

    // Build update object
    const updateData: any = {};
    if (email) updateData.email = email.toLowerCase().trim();
    if (name) updateData.name = name.trim();
    if (role) updateData.role = role;

    const updated = await db.update(admins)
      .set(updateData)
      .where(eq(admins.id, adminId))
      .returning({
        id: admins.id,
        email: admins.email,
        name: admins.name,
        role: admins.role,
        createdAt: admins.createdAt,
        lastLoginAt: admins.lastLoginAt
      });

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT admins error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const currentAdmin = await verifyAdminAuth(request);
    if (!currentAdmin) {
      return NextResponse.json({ 
        error: 'Admin authentication required',
        code: 'ADMIN_AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const adminId = parseInt(id);

    // Prevent self-deletion
    if (adminId === currentAdmin.id) {
      return NextResponse.json({ 
        error: "Cannot delete your own account",
        code: "SELF_DELETION_FORBIDDEN" 
      }, { status: 403 });
    }

    // Check if admin exists
    const existingAdmin = await db.select()
      .from(admins)
      .where(eq(admins.id, adminId))
      .limit(1);

    if (existingAdmin.length === 0) {
      return NextResponse.json({ 
        error: 'Admin not found',
        code: 'ADMIN_NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(admins)
      .where(eq(admins.id, adminId))
      .returning({
        id: admins.id,
        email: admins.email,
        name: admins.name,
        role: admins.role,
        createdAt: admins.createdAt,
        lastLoginAt: admins.lastLoginAt
      });

    return NextResponse.json({
      message: 'Admin deleted successfully',
      admin: deleted[0]
    });
  } catch (error) {
    console.error('DELETE admins error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}