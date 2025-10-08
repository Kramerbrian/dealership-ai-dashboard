/**
 * SAML Jackson - Enterprise SSO Configuration
 * Provides SAML-based Single Sign-On for enterprise clients
 */

import jackson, {
  type IOAuthController,
  type JacksonOption,
} from "@boxyhq/saml-jackson";

const samlAudience = "https://saml.boxyhq.com";
const samlPath = "/api/oauth/saml";

const opts: JacksonOption = {
  externalUrl: `${process.env.NEXT_PUBLIC_APP_URL}`,
  samlAudience,
  samlPath,
  db: {
    engine: "sql",
    type: "postgres",
    url: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres",
  },
};

let oauthController: IOAuthController;

const g = global as any;

export default async function init() {
  if (!g.oauthController) {
    const ret = await jackson(opts);

    oauthController = ret.oauthController;
    g.oauthController = oauthController;
  } else {
    oauthController = g.oauthController;
  }

  return {
    oauthController,
  };
}
