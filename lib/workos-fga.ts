/**
 * WorkOS FGA (Fine-Grained Authorization) Utilities
 * Manage resource types for authorization
 */

import { workos } from './workos';

export interface FGARelation {
  [key: string]: any;
}

export interface FGAResourceType {
  type: string;
  relations: FGARelation;
}

/**
 * Get a resource type by name
 */
export async function getResourceType(typeName: string): Promise<FGAResourceType> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch(
      `https://api.workos.com/fga/v1/resource-types/${typeName}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch resource type: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS FGA] Error getting resource type:', error);
    throw error;
  }
}

/**
 * List all resource types
 */
export async function listResourceTypes(): Promise<{
  data: FGAResourceType[];
  list_metadata: any;
}> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch(
      'https://api.workos.com/fga/v1/resource-types',
      {
        headers: {
          Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to list resource types: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS FGA] Error listing resource types:', error);
    throw error;
  }
}

/**
 * Create a resource type
 */
export async function createResourceType(
  resourceType: FGAResourceType
): Promise<FGAResourceType> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch(
      'https://api.workos.com/fga/v1/resource-types',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceType),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create resource type: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS FGA] Error creating resource type:', error);
    throw error;
  }
}

/**
 * Update a resource type
 */
export async function updateResourceType(
  typeName: string,
  relations: FGARelation
): Promise<FGAResourceType> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch(
      `https://api.workos.com/fga/v1/resource-types/${typeName}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ relations }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update resource type: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS FGA] Error updating resource type:', error);
    throw error;
  }
}

/**
 * Update multiple resource types at once
 */
export async function updateResourceTypes(
  resourceTypes: FGAResourceType[]
): Promise<FGAResourceType[]> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch(
      'https://api.workos.com/fga/v1/resource-types',
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceTypes),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update resource types: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS FGA] Error updating resource types:', error);
    throw error;
  }
}

/**
 * Delete a resource type
 */
export async function deleteResourceType(typeName: string): Promise<void> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch(
      `https://api.workos.com/fga/v1/resource-types/${typeName}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete resource type: ${response.statusText}`);
    }
  } catch (error) {
    console.error('[WorkOS FGA] Error deleting resource type:', error);
    throw error;
  }
}

/**
 * Warrant operations
 */
export interface WarrantSubject {
  resourceType: string;
  resourceId: string;
}

export interface Warrant {
  resourceType: string;
  resourceId: string;
  relation: string;
  subject: WarrantSubject;
}

export enum WarrantOp {
  Create = 'create',
  Delete = 'delete',
}

export interface WriteWarrantOptions {
  op: WarrantOp;
  resource: {
    resourceType: string;
    resourceId: string;
  };
  relation: string;
  subject: WarrantSubject;
}

/**
 * List warrants
 */
export async function listWarrants(): Promise<{
  data: any[];
  list_metadata: any;
}> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const warrants = await workos.fga.listWarrants();
    return warrants;
  } catch (error) {
    console.error('[WorkOS FGA] Error listing warrants:', error);
    throw error;
  }
}

/**
 * Write a warrant (create or delete)
 */
export async function writeWarrant(
  options: WriteWarrantOptions
): Promise<{ warrant_token: string }> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const WarrantOp = (await import('@workos-inc/node')).WarrantOp;
    const warrantResponse = await workos.fga.writeWarrant({
      op: options.op === 'create' ? WarrantOp.Create : WarrantOp.Delete,
      resource: options.resource,
      relation: options.relation,
      subject: options.subject,
    });

    return warrantResponse;
  } catch (error) {
    console.error('[WorkOS FGA] Error writing warrant:', error);
    throw error;
  }
}

/**
 * Batch write warrants
 */
export async function batchWriteWarrants(
  warrants: WriteWarrantOptions[]
): Promise<{ warrant_token: string }> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const WarrantOp = (await import('@workos-inc/node')).WarrantOp;
    const warrantResponse = await workos.fga.batchWriteWarrants(
      warrants.map((w) => ({
        op: w.op === 'create' ? WarrantOp.Create : WarrantOp.Delete,
        resource: w.resource,
        relation: w.relation,
        subject: w.subject,
      }))
    );

    return warrantResponse;
  } catch (error) {
    console.error('[WorkOS FGA] Error batch writing warrants:', error);
    throw error;
  }
}

/**
 * Resource operations
 */
export interface FGAResource {
  resourceType: string;
  resourceId?: string;
}

export interface CreateResourceOptions {
  resource: FGAResource;
  meta?: Record<string, any>;
}

export interface UpdateResourceOptions {
  resource: FGAResource;
  meta?: Record<string, any>;
}

export enum ResourceOp {
  Create = 'create',
  Delete = 'delete',
}

/**
 * Get a resource
 */
export async function getResource(
  resourceType: string,
  resourceId: string
): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const resource = await workos.fga.getResource({
      resourceType,
      resourceId,
    });

    return resource;
  } catch (error) {
    console.error('[WorkOS FGA] Error getting resource:', error);
    throw error;
  }
}

/**
 * List resources
 */
export async function listResources(): Promise<{
  data: any[];
  list_metadata: any;
}> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const resources = await workos.fga.listResources();
    return resources;
  } catch (error) {
    console.error('[WorkOS FGA] Error listing resources:', error);
    throw error;
  }
}

/**
 * Create a resource
 */
export async function createResource(
  options: CreateResourceOptions
): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const resource = await workos.fga.createResource({
      resource: options.resource,
      meta: options.meta,
    });

    return resource;
  } catch (error) {
    console.error('[WorkOS FGA] Error creating resource:', error);
    throw error;
  }
}

/**
 * Update a resource
 */
export async function updateResource(
  options: UpdateResourceOptions
): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const resource = await workos.fga.updateResource({
      resource: options.resource,
      meta: options.meta,
    });

    return resource;
  } catch (error) {
    console.error('[WorkOS FGA] Error updating resource:', error);
    throw error;
  }
}

/**
 * Delete a resource
 */
export async function deleteResource(
  resourceType: string,
  resourceId: string
): Promise<void> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    await workos.fga.deleteResource({
      resourceType,
      resourceId,
    });
  } catch (error) {
    console.error('[WorkOS FGA] Error deleting resource:', error);
    throw error;
  }
}

/**
 * Batch write resources
 */
export interface BatchWriteResourceItem {
  resource: FGAResource;
  meta?: Record<string, any>;
}

export async function batchWriteResources(
  op: ResourceOp,
  resources: BatchWriteResourceItem[]
): Promise<{ data: any[] }> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const ResourceOp = (await import('@workos-inc/node')).ResourceOp;
    const result = await workos.fga.batchWriteResources({
      op: op === 'create' ? ResourceOp.Create : ResourceOp.Delete,
      resources: resources.map((r) => ({
        resource: r.resource,
        meta: r.meta,
      })),
    });

    return result;
  } catch (error) {
    console.error('[WorkOS FGA] Error batch writing resources:', error);
    throw error;
  }
}

/**
 * FGA Policy operations
 */
export interface FGAPolicy {
  name: string;
  description?: string;
  language: 'expr';
  parameters?: Array<{
    name: string;
    type: string;
  }>;
  expression: string;
}

/**
 * Get a policy by name
 */
export async function getPolicy(policyName: string): Promise<FGAPolicy> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch(
      `https://api.workos.com/fga/v1/policies/${policyName}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch policy: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS FGA] Error getting policy:', error);
    throw error;
  }
}

/**
 * List all policies
 */
export async function listPolicies(): Promise<{ data: FGAPolicy[] }> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch('https://api.workos.com/fga/v1/policies', {
      headers: {
        Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list policies: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS FGA] Error listing policies:', error);
    throw error;
  }
}

/**
 * Create a policy
 */
export async function createPolicy(policy: FGAPolicy): Promise<FGAPolicy> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch('https://api.workos.com/fga/v1/policies', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(policy),
    });

    if (!response.ok) {
      throw new Error(`Failed to create policy: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS FGA] Error creating policy:', error);
    throw error;
  }
}

/**
 * Update a policy
 */
export async function updatePolicy(
  policyName: string,
  policy: Partial<FGAPolicy>
): Promise<FGAPolicy> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch(
      `https://api.workos.com/fga/v1/policies/${policyName}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policy),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update policy: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS FGA] Error updating policy:', error);
    throw error;
  }
}

/**
 * Delete a policy
 */
export async function deletePolicy(policyName: string): Promise<void> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch(
      `https://api.workos.com/fga/v1/policies/${policyName}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete policy: ${response.statusText}`);
    }
  } catch (error) {
    console.error('[WorkOS FGA] Error deleting policy:', error);
    throw error;
  }
}

/**
 * Get FGA schema
 */
export async function getFGASchema(): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch('https://api.workos.com/fga/v1/schema', {
      headers: {
        Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch schema: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS FGA] Error getting schema:', error);
    throw error;
  }
}

/**
 * Update FGA schema
 */
export async function updateFGASchema(schema: any): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch('https://api.workos.com/fga/v1/schema', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schema),
    });

    if (!response.ok) {
      throw new Error(`Failed to update schema: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS FGA] Error updating schema:', error);
    throw error;
  }
}

/**
 * Check authorization
 */
export interface CheckOptions {
  resource: {
    resourceType: string;
    resourceId: string;
  };
  relation: string;
  subject: {
    resourceType: string;
    resourceId: string;
  };
}

export async function checkAuthorization(
  checks: CheckOptions[]
): Promise<{ result: string; is_implicit: boolean }> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const CheckOp = (await import('@workos-inc/node')).CheckOp;
    const result = await workos.fga.check({
      checks: checks.map((c) => ({
        resource: c.resource,
        relation: c.relation,
        subject: c.subject,
      })),
    });

    return result;
  } catch (error) {
    console.error('[WorkOS FGA] Error checking authorization:', error);
    throw error;
  }
}

/**
 * Batch check authorization
 */
export async function checkBatch(
  checks: CheckOptions[]
): Promise<Array<{ result: string; is_implicit: boolean }>> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const results = await workos.fga.checkBatch({
      checks: checks.map((c) => ({
        resource: c.resource,
        relation: c.relation,
        subject: c.subject,
      })),
    });

    return results;
  } catch (error) {
    console.error('[WorkOS FGA] Error batch checking:', error);
    throw error;
  }
}

/**
 * Query FGA (Warrant Query Language)
 */
export async function queryFGA(
  query: string
): Promise<{ data: any[]; list_metadata: any }> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const result = await workos.fga.query({ q: query });
    return result;
  } catch (error) {
    console.error('[WorkOS FGA] Error querying:', error);
    throw error;
  }
}

