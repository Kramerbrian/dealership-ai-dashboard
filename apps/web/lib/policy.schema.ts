// Policy JSON schema (machine-editable)
export const POLICY_JSON_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "DealershipAI Policy",
  type: "object",
  additionalProperties: false,
  properties: {
    offerIntegrity: {
      type: "object",
      properties: {
        priceDelta: {
          type: "object",
          properties: { 
            sev1: { type: "number" }, 
            sev2: { type: "number" }, 
            sev3: { type: "number" } 
          },
          required: ["sev1", "sev2", "sev3"], 
          additionalProperties: false
        },
        undisclosedFeeCodes: { 
          type: "array", 
          items: { type: "string" }, 
          default: ["UNDISCLOSED_FEE"] 
        }
      },
      required: ["priceDelta"], 
      additionalProperties: false
    },
    hoursReliability: {
      type: "object",
      properties: { 
        maxStalenessDays: { type: "number", default: 3 } 
      },
      required: ["maxStalenessDays"], 
      additionalProperties: false
    },
    gate: {
      type: "object",
      properties: {
        blockOn: { 
          type: "array", 
          items: { type: "string" }, 
          default: ["PRICE_DELTA.sev3", "UNDISCLOSED_FEE"] 
        }
      },
      required: ["blockOn"], 
      additionalProperties: false
    },
    features: {
      type: "object",
      properties: {
        zeroClick: { type: "boolean", default: true },
        fixQueue: { type: "boolean", default: true },
        proofPath: { type: "boolean", default: true },
        redGate: { type: "boolean", default: true }
      }, 
      additionalProperties: false
    }
  },
  required: ["offerIntegrity", "hoursReliability", "gate"],
};

export const DEFAULT_POLICY_CONFIG = {
  offerIntegrity: { 
    priceDelta: { sev1: 100, sev2: 250, sev3: 500 }, 
    undisclosedFeeCodes: ["UNDISCLOSED_FEE"] 
  },
  hoursReliability: { maxStalenessDays: 3 },
  gate: { blockOn: ["PRICE_DELTA.sev3", "UNDISCLOSED_FEE"] },
  features: { zeroClick: true, fixQueue: true, proofPath: true, redGate: true }
};
