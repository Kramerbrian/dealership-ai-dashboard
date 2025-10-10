import { NextRequest, NextResponse } from "next/server";
import { patentDoc, tradeSecretDoc } from "@/lib/patent-documentation";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'patent';

    if (type === 'patent') {
      const patentApplication = patentDoc.generatePatentApplication();
      
      return NextResponse.json({
        success: true,
        type: 'patent',
        data: patentApplication
      });
    }

    if (type === 'trade-secrets') {
      const tradeSecrets = tradeSecretDoc.generateTradeSecrets();
      
      return NextResponse.json({
        success: true,
        type: 'trade-secrets',
        data: tradeSecrets
      });
    }

    if (type === 'confidentiality-agreement') {
      const agreement = tradeSecretDoc.generateConfidentialityAgreement();
      
      return NextResponse.json({
        success: true,
        type: 'confidentiality-agreement',
        data: agreement
      });
    }

    return NextResponse.json(
      { error: "Invalid type. Supported types: patent, trade-secrets, confidentiality-agreement" },
      { status: 400 }
    );

  } catch (error) {
    console.error('Patent documentation error:', error);
    return NextResponse.json(
      { error: "Failed to generate patent documentation" },
      { status: 500 }
    );
  }
}
