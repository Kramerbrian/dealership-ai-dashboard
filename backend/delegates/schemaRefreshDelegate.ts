import fetch from "node-fetch";

/**
 * Executes a bulk schema re-validation using the Schema Engineer agent.
 */
export async function runSchemaRefresh(payload: any) {
  const endpoint = process.env.SCHEMA_ENGINE_URL ||
    "https://chat.openai.com/g/g-68cf0309aaa08191b390fbd277335d28";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "revalidate_all",
      reason: payload.reason,
      severity: payload.severity,
    }),
  });

  if (!res.ok) {
    throw new Error(`Schema Engine error ${res.status}`);
  }

  return await res.json();
}

