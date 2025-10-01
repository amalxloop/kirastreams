import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adminSettings } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    // Try to get existing settings
    const settings = await db.select()
      .from(adminSettings)
      .limit(1);

    if (settings.length > 0) {
      return NextResponse.json(settings[0], { status: 200 });
    }

    // No settings exist, create default record
    const defaultSettings = {
      platformName: 'KiraStreams',
      logoUrl: null,
      primaryColor: '#8b5cf6',
      cdnBaseUrl: null,
      watermarkEnabled: false,
      theme: 'dark',
      updatedAt: new Date().toISOString()
    };

    const newSettings = await db.insert(adminSettings)
      .values(defaultSettings)
      .returning();

    return NextResponse.json(newSettings[0], { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const requestBody = await request.json();

    // Validate primaryColor if provided
    if (requestBody.primaryColor !== undefined) {
      if (typeof requestBody.primaryColor !== 'string' || !requestBody.primaryColor.startsWith('#')) {
        return NextResponse.json({ 
          error: "Primary color must be a valid hex color starting with #",
          code: "INVALID_PRIMARY_COLOR" 
        }, { status: 400 });
      }
    }

    // Validate theme if provided
    if (requestBody.theme !== undefined) {
      const validThemes = ['dark', 'light'];
      if (!validThemes.includes(requestBody.theme)) {
        return NextResponse.json({ 
          error: "Theme must be one of: dark, light",
          code: "INVALID_THEME" 
        }, { status: 400 });
      }
    }

    // Check if settings exist
    const existingSettings = await db.select()
      .from(adminSettings)
      .limit(1);

    if (existingSettings.length === 0) {
      // No settings exist, create default record first
      const defaultSettings = {
        platformName: 'KiraStreams',
        logoUrl: null,
        primaryColor: '#8b5cf6',
        cdnBaseUrl: null,
        watermarkEnabled: false,
        theme: 'dark',
        updatedAt: new Date().toISOString()
      };

      await db.insert(adminSettings)
        .values(defaultSettings);
    }

    // Prepare update data (only include provided fields)
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (requestBody.platformName !== undefined) {
      updateData.platformName = requestBody.platformName;
    }
    if (requestBody.logoUrl !== undefined) {
      updateData.logoUrl = requestBody.logoUrl;
    }
    if (requestBody.primaryColor !== undefined) {
      updateData.primaryColor = requestBody.primaryColor;
    }
    if (requestBody.cdnBaseUrl !== undefined) {
      updateData.cdnBaseUrl = requestBody.cdnBaseUrl;
    }
    if (requestBody.watermarkEnabled !== undefined) {
      updateData.watermarkEnabled = requestBody.watermarkEnabled;
    }
    if (requestBody.theme !== undefined) {
      updateData.theme = requestBody.theme;
    }

    // Update the settings record (there should only be one)
    const updated = await db.update(adminSettings)
      .set(updateData)
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update settings',
        code: "UPDATE_FAILED" 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}