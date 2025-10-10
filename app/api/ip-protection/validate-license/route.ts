import { NextRequest, NextResponse } from "next/server";
import { licenseManager } from "@/lib/license-management";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { license_key, feature_name, user_id } = body;

    if (!license_key) {
      return NextResponse.json(
        { error: "License key is required" },
        { status: 400 }
      );
    }

    // Validate license
    const licenseValidation = licenseManager.validateLicense(license_key);
    
    if (!licenseValidation.valid) {
      return NextResponse.json(
        { 
          success: false,
          error: licenseValidation.error,
          access_granted: false
        },
        { status: 403 }
      );
    }

    // Check feature access if feature_name is provided
    if (feature_name && user_id) {
      const featureAccess = licenseManager.checkFeatureAccess(license_key, feature_name, user_id);
      
      if (!featureAccess.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: featureAccess.error,
            access_granted: false
          },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        access_granted: true,
        license: licenseValidation.license,
        feature_access: {
          feature: feature_name,
          access_level: featureAccess.accessLevel
        }
      });
    }

    return NextResponse.json({
      success: true,
      access_granted: true,
      license: licenseValidation.license
    });

  } catch (error) {
    console.error('License validation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        access_granted: false
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const license_key = url.searchParams.get('license_key');

    if (!license_key) {
      return NextResponse.json(
        { error: "License key is required" },
        { status: 400 }
      );
    }

    const licenseValidation = licenseManager.validateLicense(license_key);
    
    if (!licenseValidation.valid) {
      return NextResponse.json(
        { 
          success: false,
          error: licenseValidation.error,
          access_granted: false
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      access_granted: true,
      license: licenseValidation.license,
      features: licenseValidation.license!.features
    });

  } catch (error) {
    console.error('License validation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        access_granted: false
      },
      { status: 500 }
    );
  }
}
