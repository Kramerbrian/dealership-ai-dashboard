// Minimal Redis stub for production build
export const redis = {
  get: async (key: string) => null,
  set: async (key: string, value: any) => 'OK',
  del: async (key: string) => 1,
  incr: async (key: string) => 1,
  expire: async (key: string, seconds: number) => 1,
  lpush: async (key: string, ...values: any[]) => 1,
  pfcount: async (key: string) => 0,
  incrbyfloat: async (key: string, increment: number) => increment,
};

export const cacheKeys = {
  dealer: (id: string) => `dealer:${id}`,
  score: (id: string) => `score:${id}`,
};

export const getCached = async (key: string) => null;
export const setCached = async (key: string, value: any, ttl?: number) => 'OK';