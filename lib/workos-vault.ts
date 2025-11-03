/**
 * WorkOS Vault Utilities
 * Manage secrets and encrypted data
 */

import { workos } from './workos';

export interface CreateVaultObjectOptions {
  name: string;
  value: string;
  context?: Record<string, any>;
}

export interface UpdateVaultObjectOptions {
  id: string;
  value?: string;
  versionCheck?: string;
}

/**
 * Create a vault object
 */
export async function createVaultObject(
  options: CreateVaultObjectOptions
): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const result = await workos.vault.createObject({
      name: options.name,
      value: options.value,
      context: options.context,
    });

    return result;
  } catch (error) {
    console.error('[WorkOS Vault] Error creating object:', error);
    throw error;
  }
}

/**
 * Read a vault object (returns decrypted value)
 */
export async function readVaultObject(id: string): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const result = await workos.vault.readObject({ id });
    return result;
  } catch (error) {
    console.error('[WorkOS Vault] Error reading object:', error);
    throw error;
  }
}

/**
 * Update a vault object
 */
export async function updateVaultObject(
  options: UpdateVaultObjectOptions
): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const result = await workos.vault.updateObject({
      id: options.id,
      value: options.value,
      versionCheck: options.versionCheck,
    });

    return result;
  } catch (error) {
    console.error('[WorkOS Vault] Error updating object:', error);
    throw error;
  }
}

/**
 * Describe a vault object (metadata only, no value)
 */
export async function describeVaultObject(id: string): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const result = await workos.vault.describeObject({ id });
    return result;
  } catch (error) {
    console.error('[WorkOS Vault] Error describing object:', error);
    throw error;
  }
}

/**
 * List vault objects
 */
export async function listVaultObjects(): Promise<{
  data: any[];
  list_metadata: any;
}> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const result = await workos.vault.listObjects();
    return result;
  } catch (error) {
    console.error('[WorkOS Vault] Error listing objects:', error);
    throw error;
  }
}

/**
 * Delete a vault object
 */
export async function deleteVaultObject(id: string): Promise<{
  success: boolean;
  name: string;
}> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const result = await workos.vault.deleteObject({ id });
    return result;
  } catch (error) {
    console.error('[WorkOS Vault] Error deleting object:', error);
    throw error;
  }
}

/**
 * List object versions
 */
export async function listVaultObjectVersions(id: string): Promise<{
  data: any[];
  list_metadata: any;
}> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const result = await workos.vault.listObjectVersions({ id });
    return result;
  } catch (error) {
    console.error('[WorkOS Vault] Error listing versions:', error);
    throw error;
  }
}

/**
 * Create a data key
 */
export async function createDataKey(context?: Record<string, any>): Promise<{
  id: string;
  data_key: string;
}> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const result = await workos.vault.createDataKey({ context });
    return result;
  } catch (error) {
    console.error('[WorkOS Vault] Error creating data key:', error);
    throw error;
  }
}

/**
 * Decrypt a data key
 */
export async function decryptDataKey(
  encryptedKeys: string
): Promise<{ id: string; data_key: string }> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const result = await workos.vault.decryptDataKey({ keys: encryptedKeys });
    return result;
  } catch (error) {
    console.error('[WorkOS Vault] Error decrypting data key:', error);
    throw error;
  }
}

/**
 * Encrypt plaintext
 */
export async function encrypt(
  plaintext: string,
  context?: Record<string, any>
): Promise<string> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const result = await workos.vault.encrypt(plaintext, context || {});
    return result;
  } catch (error) {
    console.error('[WorkOS Vault] Error encrypting:', error);
    throw error;
  }
}

/**
 * Decrypt ciphertext
 */
export async function decrypt(ciphertext: string): Promise<string> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const result = await workos.vault.decrypt(ciphertext);
    return result;
  } catch (error) {
    console.error('[WorkOS Vault] Error decrypting:', error);
    throw error;
  }
}

