/**
 * SAML Response Handler
 * Processes SAML responses from IdP
 */

import type { NextApiRequest, NextApiResponse } from "next";

import jackson from "../../../lib/jackson";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { oauthController } = await jackson();

    const { RelayState, SAMLResponse } = req.body;

    const { redirect_url } = await oauthController.samlResponse({
      RelayState,
      SAMLResponse,
    });

    return res.redirect(302, redirect_url as string);
  } catch (error) {
    console.error('SAML response error:', error);
    return res.status(500).json({
      error: 'Failed to process SAML response',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
