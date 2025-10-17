// Mock database interface - replace with your actual database client
interface DatabaseClient {
  execute(query: any): Promise<{ rowCount: number }>;
}

const db: DatabaseClient = {
  execute: async (query: any) => {
    console.log('Executing query:', query);
    // Mock response - replace with actual database call
    return { rowCount: 0 };
  }
};

/**
 * Check if a topic is currently quarantined for a tenant
 * @param tenantId - The tenant ID to check
 * @param topic - The topic to check (e.g., "Price", "APR", "Warranty")
 * @returns Promise<boolean> - true if topic is quarantined
 */
export async function isTopicQuarantined(tenantId: string, topic: string): Promise<boolean> {
  try {
    const query = {
      text: `
        SELECT 1 FROM hrp_quarantine 
        WHERE tenant_id = $1::uuid AND topic = $2 AND active = true 
        LIMIT 1
      `,
      values: [tenantId, topic]
    };
    
    const result = await db.execute(query);
    return result.rowCount > 0;
    
  } catch (error) {
    console.error(`Error checking quarantine status for tenant ${tenantId}, topic ${topic}:`, error);
    // Fail safe - if we can't check, assume not quarantined
    return false;
  }
}

/**
 * Get all quarantined topics for a tenant
 * @param tenantId - The tenant ID to check
 * @returns Promise<string[]> - Array of quarantined topic names
 */
export async function getQuarantinedTopics(tenantId: string): Promise<string[]> {
  try {
    const query = {
      text: `
        SELECT topic FROM hrp_quarantine 
        WHERE tenant_id = $1::uuid AND active = true
      `,
      values: [tenantId]
    };
    
    const result = await db.execute(query);
    return result.rows?.map((row: any) => row.topic) || [];
    
  } catch (error) {
    console.error(`Error fetching quarantined topics for tenant ${tenantId}:`, error);
    return [];
  }
}

/**
 * Guard function to throw error if topic is quarantined
 * Use this in your ASR generator and VDP-TOP publisher
 * @param tenantId - The tenant ID
 * @param topic - The topic to check
 * @throws Error if topic is quarantined
 */
export async function guardTopic(tenantId: string, topic: string): Promise<void> {
  const isQuarantined = await isTopicQuarantined(tenantId, topic);
  
  if (isQuarantined) {
    throw new Error(`HRP_QUARANTINE: ${topic} topic blocked until resolved`);
  }
}

/**
 * Guard function for multiple topics
 * @param tenantId - The tenant ID
 * @param topics - Array of topics to check
 * @throws Error if any topic is quarantined
 */
export async function guardTopics(tenantId: string, topics: string[]): Promise<void> {
  const quarantinedTopics = await getQuarantinedTopics(tenantId);
  const blockedTopics = topics.filter(topic => quarantinedTopics.includes(topic));
  
  if (blockedTopics.length > 0) {
    throw new Error(`HRP_QUARANTINE: Topics blocked until resolved: ${blockedTopics.join(', ')}`);
  }
}
