import { NextRequest, NextResponse } from "next/server";
import { loadContract } from "../../../lib/policy/agentContract";
import { preflight, hashPromptTemplate } from "../../../lib/policy/enforcer";

// Mock Supabase client for demo - replace with actual implementation
const mockSupabase = {
  from: (table: string) => ({
    insert: async (data: any) => {
      console.log(`Mock insert into ${table}:`, data);
      return { data: [data], error: null };
    }
  })
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenant_id, agent_id, write_intent, model_version, prompt_template } = body;

    // Load agent contract
    const contract = loadContract(agent_id);
    
    // Run policy preflight check
    const policy = preflight(contract, write_intent);

    // Hash prompt template for audit
    const prompt_hash = hashPromptTemplate(prompt_template || "");

    // Log to audit trail (mock implementation)
    await mockSupabase.from("audit_log").insert({
      tenant_id,
      agent_id,
      model_version,
      prompt_hash,
      action_type: write_intent.action_type,
      entity_type: write_intent.entity_type,
      entity_id: write_intent.entity_id,
      inputs_ptr: write_intent?.inputs_ptr || {},
      outputs_json: write_intent.payload,
      rationale: write_intent.rationale?.slice(0, 500) || null,
      confidence: write_intent.confidence,
      policy_check: { 
        contract_id: contract.id, 
        pass: policy.pass, 
        violations: policy.violations, 
        mode: policy.mode 
      },
      retention_class: contract.retention.class,
    });

    return NextResponse.json({ 
      success: true,
      policy,
      contract_id: contract.id,
      message: policy.pass ? "Action approved" : "Action requires review"
    });
  } catch (error) {
    console.error('Agent action error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Agent Action API",
    version: "1.0.0",
    description: "Policy-enforced agent action endpoint with audit logging"
  });
}
