import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adminSettings } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
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
      siteTagline: null,
      seoDescription: null,
      seoKeywords: null,
      faviconUrl: null,
      bannerMessage: null,
      bannerEnabled: false,
      contactEmail: null,
      twitterUrl: null,
      facebookUrl: null,
      instagramUrl: null,
      discordUrl: null,
      footerText: null,
      enableRegistration: true,
      maintenanceMode: false,
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
      const defaultSettings = {
        platformName: 'KiraStreams',
        logoUrl: null,
        primaryColor: '#8b5cf6',
        cdnBaseUrl: null,
        watermarkEnabled: false,
        theme: 'dark',
        siteTagline: null,
        seoDescription: null,
        seoKeywords: null,
        faviconUrl: null,
        bannerMessage: null,
        bannerEnabled: false,
        contactEmail: null,
        twitterUrl: null,
        facebookUrl: null,
        instagramUrl: null,
        discordUrl: null,
        footerText: null,
        enableRegistration: true,
        maintenanceMode: false,
        updatedAt: new Date().toISOString()
      };

      await db.insert(adminSettings)
        .values(defaultSettings);
    }

    // Prepare update data (only include provided fields)
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    // Map all possible fields
    const fields = [
      'platformName', 'logoUrl', 'primaryColor', 'cdnBaseUrl', 'watermarkEnabled', 
      'theme', 'siteTagline', 'seoDescription', 'seoKeywords', 'faviconUrl',
      'bannerMessage', 'bannerEnabled', 'contactEmail', 'twitterUrl', 'facebookUrl',
      'instagramUrl', 'discordUrl', 'footerText', 'enableRegistration', 'maintenanceMode'
    ];

    fields.forEach(field => {
      if (requestBody[field] !== undefined) {
        updateData[field] = requestBody[field];
      }
    });

    // Update the settings record
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