/**
 * Ory Kratos Client Configuration
 * Handles authentication and identity management
 */

import { Configuration, FrontendApi } from '@ory/client';

// Create Ory client for browser
export const ory = new FrontendApi(
  new Configuration({
    basePath: process.env.NEXT_PUBLIC_ORY_SDK_URL,
    baseOptions: {
      withCredentials: true,
    },
  })
);

// Server-side Ory client
export const oryServer = new FrontendApi(
  new Configuration({
    basePath: process.env.ORY_SDK_URL || process.env.NEXT_PUBLIC_ORY_SDK_URL,
    baseOptions: {
      withCredentials: true,
    },
  })
);

export default ory;
