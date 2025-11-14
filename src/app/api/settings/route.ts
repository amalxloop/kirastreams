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
      // Return ALL public-facing settings
      return NextResponse.json({
        platformName: settings[0].platformName,
        logoUrl: settings[0].logoUrl,
        primaryColor: settings[0].primaryColor,
        theme: settings[0].theme,
        siteTagline: settings[0].siteTagline,
        seoDescription: settings[0].seoDescription,
        seoKeywords: settings[0].seoKeywords,
        faviconUrl: settings[0].faviconUrl,
        bannerMessage: settings[0].bannerMessage,
        bannerEnabled: settings[0].bannerEnabled,
        contactEmail: settings[0].contactEmail,
        twitterUrl: settings[0].twitterUrl,
        facebookUrl: settings[0].facebookUrl,
        instagramUrl: settings[0].instagramUrl,
        discordUrl: settings[0].discordUrl,
        footerText: settings[0].footerText,
        enableRegistration: settings[0].enableRegistration,
        maintenanceMode: settings[0].maintenanceMode,
      }, { status: 200 });
    }

    // Return defaults if no settings exist
    return NextResponse.json({
      platformName: 'KiraStreams',
      logoUrl: null,
      primaryColor: '#8b5cf6',
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
    }, { status: 200 });

  } catch (error) {
    console.error('GET settings error:', error);
    // Return defaults on error
    return NextResponse.json({
      platformName: 'KiraStreams',
      logoUrl: null,
      primaryColor: '#8b5cf6',
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
    }, { status: 200 });
  }
}