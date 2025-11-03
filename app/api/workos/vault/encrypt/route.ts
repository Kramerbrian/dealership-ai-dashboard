/**
 * WorkOS Vault Encryption API
 * Encrypt and decrypt data, manage data keys
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  encrypt,
  decrypt,
  createDataKey,
  decryptDataKey,
} from '@/lib/workos-vault';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * POST /api/workos/vault/encrypt
 * Encrypt plaintext
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, plaintext, ciphertext, encryptedKeys, context } = body;

    switch (action) {
      case 'encrypt':
        if (!plaintext) {
          return NextResponse.json(
            { error: 'plaintext is required for encrypt' },
            { status: 400 }
          );
        }
        const encrypted = await encrypt(plaintext, context);
        return NextResponse.json({
          success: true,
          data: { ciphertext: encrypted },
        });

      case 'decrypt':
        if (!ciphertext) {
          return NextResponse.json(
            { error: 'ciphertext is required for decrypt' },
            { status: 400 }
          );
        }
        const decrypted = await decrypt(ciphertext);
        return NextResponse.json({
          success: true,
          data: { plaintext: decrypted },
        });

      case 'create_data_key':
        const dataKey = await createDataKey(context);
        return NextResponse.json({
          success: true,
          data: dataKey,
        });

      case 'decrypt_data_key':
        if (!encryptedKeys) {
          return NextResponse.json(
            { error: 'encryptedKeys is required for decrypt_data_key' },
            { status: 400 }
          );
        }
        const decryptedKey = await decryptDataKey(encryptedKeys);
        return NextResponse.json({
          success: true,
          data: decryptedKey,
        });

      default:
        return NextResponse.json(
          {
            error:
              'action must be: encrypt, decrypt, create_data_key, or decrypt_data_key',
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[WorkOS Vault Encryption API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process encryption request',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

