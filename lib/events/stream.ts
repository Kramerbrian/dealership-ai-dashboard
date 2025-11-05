import { createClient, RedisClientType } from 'redis';

const url = process.env.REDIS_URL as string | undefined;
let client: RedisClientType | null = null;

export async function getStreamClient() {
  if (!url) return null;
  if (!client) {
    client = createClient({ url });
    client.on('error', (e) => console.error('[redis:x] err', e?.message || e));
    await client.connect();
  }
  return client;
}

export async function xappend(stream: string, payload: unknown) {
  const c = await getStreamClient();
  if (!c) return; // no-op if no redis
  await c.xAdd(stream, '*', { json: JSON.stringify(payload) });
}

export async function xread(stream: string, id: string) {
  const c = await getStreamClient();
  if (!c) return null;
  return c.xRead({ key: stream, id }, { COUNT: 200, BLOCK: 5000 });
}

