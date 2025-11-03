/**
 * WorkOS MFA (Multi-Factor Authentication) Utilities
 * Manage authentication factors and challenges
 */

import { workos } from './workos';

/**
 * Enroll a TOTP factor
 */
export interface EnrollFactorOptions {
  type: 'totp';
  issuer: string;
  user: string;
}

export async function enrollFactor(options: EnrollFactorOptions): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const factor = await workos.mfa.enrollFactor({
      type: options.type,
      issuer: options.issuer,
      user: options.user,
    });

    return factor;
  } catch (error) {
    console.error('[WorkOS MFA] Error enrolling factor:', error);
    throw error;
  }
}

/**
 * Challenge a factor (send code for SMS/SMS_OTP or generate challenge for TOTP)
 */
export interface ChallengeFactorOptions {
  authenticationFactorId: string;
  smsTemplate?: string;
}

export async function challengeFactor(
  options: ChallengeFactorOptions
): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const challenge = await workos.mfa.challengeFactor({
      authenticationFactorId: options.authenticationFactorId,
      smsTemplate: options.smsTemplate,
    });

    return challenge;
  } catch (error) {
    console.error('[WorkOS MFA] Error challenging factor:', error);
    throw error;
  }
}

/**
 * Verify a challenge
 */
export interface VerifyChallengeOptions {
  authenticationChallengeId: string;
  code: string;
}

export async function verifyChallenge(
  options: VerifyChallengeOptions
): Promise<{ challenge: any; valid: boolean }> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const result = await workos.mfa.verifyChallenge({
      authenticationChallengeId: options.authenticationChallengeId,
      code: options.code,
    });

    return result;
  } catch (error) {
    console.error('[WorkOS MFA] Error verifying challenge:', error);
    throw error;
  }
}

/**
 * Get a factor by ID
 */
export async function getFactor(factorId: string): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const factor = await workos.mfa.getFactor(factorId);
    return factor;
  } catch (error) {
    console.error('[WorkOS MFA] Error getting factor:', error);
    throw error;
  }
}

/**
 * Delete a factor
 */
export async function deleteFactor(factorId: string): Promise<void> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    await workos.mfa.deleteFactor(factorId);
  } catch (error) {
    console.error('[WorkOS MFA] Error deleting factor:', error);
    throw error;
  }
}

