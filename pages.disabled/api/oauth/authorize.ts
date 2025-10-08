/**
 * OAuth Authorization Endpoint
 * Handles SAML SSO authorization requests
 */

import type { NextApiRequest, NextApiResponse } from "next";
import type { OAuthReq } from "@boxyhq/saml-jackson";

import jackson from "../../../lib/jackson";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { oauthController } = await jackson();

    const { redirect_url } = await oauthController.authorize(
      req.query as unknown as OAuthReq
    );

    return res.redirect(302, redirect_url as string);
  } catch (error) {
    console.error('OAuth authorize error:', error);
    return res.status(500).json({
      error: 'Failed to authorize',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
