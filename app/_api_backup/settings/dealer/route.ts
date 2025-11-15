import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schemas
const analyticsSchema = z.object({
  googleAnalytics: z.object({
    enabled: z.boolean(),
    measurementId: z.string().regex(/^G-[A-Z0-9]+$/).optional().or(z.literal('')),
    propertyId: z.string().optional(),
  }),
  googleTagManager: z.object({
    enabled: z.boolean(),
    containerId: z.string().regex(/^GTM-[A-Z0-9]+$/).optional().or(z.literal('')),
  }),
  facebookPixel: z.object({
    enabled: z.boolean(),
    pixelId: z.string().optional().or(z.literal('')),
  }),
  tiktokPixel: z.object({
    enabled: z.boolean(),
    pixelId: z.string().optional().or(z.literal('')),
  }),
});

const googleBusinessProfileSchema = z.object({
  enabled: z.boolean(),
  placeId: z.string().optional().or(z.literal('')),
  locationId: z.string().optional().or(z.literal('')),
  cid: z.string().optional().or(z.literal('')),
});

// GET dealer settings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId') || undefined;

    if (!dealerId) {
      return NextResponse.json(
        { error: 'Dealer ID is required' },
        { status: 400 }
      );
    }

    // Fetch from database
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: settings, error } = await supabase
      .from('dealer_settings')
      .select('*')
      .eq('dealer_id', dealerId)
      .single();

    // If no settings found, return defaults
    if (error && error.code === 'PGRST116') {
      const defaultSettings = {
        dealerId,
        analytics: {
          googleAnalytics: {
            enabled: false,
            measurementId: '',
            propertyId: '',
          },
          googleTagManager: {
            enabled: false,
            containerId: '',
          },
          facebookPixel: {
            enabled: false,
            pixelId: '',
          },
          tiktokPixel: {
            enabled: false,
            pixelId: '',
          },
          linkedInInsightTag: {
            enabled: false,
            partnerId: '',
          },
          microsoftClarity: {
            enabled: false,
            projectId: '',
          },
          hotjar: {
            enabled: false,
            siteId: '',
          },
        },
        googleBusinessProfile: {
          enabled: false,
          placeId: '',
          locationId: '',
          cid: '',
        },
        google: {
          searchConsole: {
            enabled: false,
            siteUrl: '',
            verificationCode: '',
          },
          ads: {
            enabled: false,
            customerId: '',
            conversionId: '',
            conversionLabel: '',
          },
        },
        social: {
          facebook: {
            enabled: false,
            pageId: '',
          },
          instagram: {
            enabled: false,
            businessAccountId: '',
          },
          twitter: {
            enabled: false,
            username: '',
          },
          linkedin: {
            enabled: false,
            companyId: '',
          },
          youtube: {
            enabled: false,
            channelId: '',
          },
        },
        reviews: {
          googleReviews: {
            enabled: false,
            autoMonitor: false,
            autoRespond: false,
          },
          yelp: {
            enabled: false,
            businessId: '',
          },
          dealerRater: {
            enabled: false,
            dealerId: '',
          },
        },
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json(defaultSettings);
    }

    if (error) {
      throw error;
    }

    // Map database columns to API response
    const response = {
      dealerId: settings.dealer_id,
      analytics: settings.analytics,
      googleBusinessProfile: settings.google_business_profile,
      google: settings.google_services,
      social: settings.social_media,
      reviews: settings.reviews,
      updatedAt: settings.updated_at,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dealer settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST/PUT update dealer settings
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dealerId, section, data } = body;

    if (!dealerId || !section) {
      return NextResponse.json(
        { error: 'Dealer ID and section are required' },
        { status: 400 }
      );
    }

    // Validate based on section
    try {
      if (section === 'analytics') {
        analyticsSchema.parse(data);
      } else if (section === 'googleBusinessProfile') {
        googleBusinessProfileSchema.parse(data);
      }
    } catch (validationError: any) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationError.errors },
        { status: 400 }
      );
    }

    // Save to database
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Map section names to database columns
    const columnMapping: Record<string, string> = {
      analytics: 'analytics',
      googleBusinessProfile: 'google_business_profile',
      google: 'google_services',
      social: 'social_media',
      reviews: 'reviews',
    };

    const columnName = columnMapping[section] || section;

    // Check if record exists
    const { data: existing } = await supabase
      .from('dealer_settings')
      .select('id')
      .eq('dealer_id', dealerId)
      .single();

    let result;

    if (existing) {
      // Update existing record
      result = await supabase
        .from('dealer_settings')
        .update({ [columnName]: data })
        .eq('dealer_id', dealerId)
        .select()
        .single();
    } else {
      // Create new record with all default values
      const newRecord: any = {
        dealer_id: dealerId,
      };
      newRecord[columnName] = data;

      result = await supabase
        .from('dealer_settings')
        .insert(newRecord)
        .select()
        .single();
    }

    if ((result as any).error) {
      throw (result as any).error;
    }

    // Log the update
    console.log('Settings updated:', {
      dealerId,
      section,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      dealerId,
      section,
      updatedAt: (result as any).data.updated_at,
    });
  } catch (error) {
    console.error('Error updating dealer settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// Validate specific integration
export async function validateIntegration(type: string, credentials: any) {
  switch (type) {
    case 'google_analytics':
      // Validate GA4 Measurement ID format
      return /^G-[A-Z0-9]+$/.test(credentials.measurementId);

    case 'google_tag_manager':
      // Validate GTM Container ID format
      return /^GTM-[A-Z0-9]+$/.test(credentials.containerId);

    case 'facebook_pixel':
      // Validate Facebook Pixel ID (numeric)
      return /^\d+$/.test(credentials.pixelId);

    case 'google_place':
      // Validate Google Place ID format
      return credentials.placeId && credentials.placeId.length > 0;

    default:
      return true;
  }
}
