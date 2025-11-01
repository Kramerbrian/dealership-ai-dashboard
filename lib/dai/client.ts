import { DealershipAI } from "./sdk";

export const dai = new DealershipAI(
  process.env.NEXT_PUBLIC_DAI_API_BASE ?? "https://api.dealershipai.com",
  process.env.NEXT_PUBLIC_DAI_API_KEY
);

