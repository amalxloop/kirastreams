import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adminSettings } from '@/db/schema';

// Public endpoint to fetch platform settings
export async function GET(request: NextRequest) {
  try {
    const settings = await db.select()
      .from(adminSettings)
      .limit(1);

    if (settings.length > 0) {
      // Return only public-facing settings
      return NextResponse.json({
        platformName: settings[0].platformName,
        logoUrl: settings[0].logoUrl,
        primaryColor: settings[0].primaryColor,
        theme: settings[0].theme,
      }, { status: 200 });
    }

    // Return defaults if no settings exist
    return NextResponse.json({
      platformName: 'KiraStreams',
      logoUrl: null,
      primaryColor: '#8b5cf6',
      theme: 'dark',
    }, { status: 200 });

  } catch (error) {
    console.error('GET settings error:', error);
    // Return defaults on error
    return NextResponse.json({
      platformName: 'KiraStreams',
      logoUrl: null,
      primaryColor: '#8b5cf6',
      theme: 'dark',
    }, { status: 200 });
  }
}
