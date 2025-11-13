import neo4j, { Driver, Session } from 'neo4j-driver';

let driver: Driver | null = null;

export function getNeo4jDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    const username = process.env.NEO4J_USERNAME || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'password';

    driver = neo4j.driver(
      uri,
      neo4j.auth.basic(username, password),
      {
        // Encrypted by default on Aura, configurable for self-hosted
        encrypted: uri.startsWith('neo4j+s://') || uri.startsWith('bolt+s://'),
        maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
      }
    );
  }
  return driver;
}

export async function closeNeo4jDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

export async function withNeo4jSession<T>(
  callback: (session: Session) => Promise<T>
): Promise<T> {
  const driver = getNeo4jDriver();
  const session = driver.session();
  
  try {
    return await callback(session);
  } finally {
    await session.close();
  }
}

// Health check function
export async function checkNeo4jConnection(): Promise<boolean> {
  try {
    await withNeo4jSession(async (session) => {
      await session.run('RETURN 1');
    });
    return true;
  } catch (error) {
    console.error('Neo4j connection failed:', error);
    return false;
  }
}