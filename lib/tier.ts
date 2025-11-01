export type Tier = "free" | "pro" | "enterprise";

export const canDynamicEggs = (tier: Tier) => tier !== "free";

