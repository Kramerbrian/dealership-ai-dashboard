/**
 * Coach Scripts - Registry
 * 
 * Registers all persona-specific scripts
 */

import { registerSalesScripts } from "./sales";
import { registerServiceScripts } from "./service";
import { registerManagerScripts } from "./managers";
import { registerMarketingScripts } from "./marketing";
import { registerBDCScripts } from "./bdc";
import { scriptRegistry } from "../triggers";

/**
 * Register all persona scripts
 */
export function registerPersonaScripts(): void {
  registerSalesScripts();
  registerServiceScripts();
  registerManagerScripts();
  registerMarketingScripts();
  registerBDCScripts();
}

