import { NextResponse } from "next/server";

// Mock data for demo - replace with actual Supabase queries
const mockRecentData = [
  {
    occurred_at: "2024-01-15T10:30:00Z",
    agent_id: "appraisal-penetration-agent",
    action_type: "create_task",
    entity_type: "crm.task",
    confidence: "0.92",
    mode: "FULL_AUTO",
    violations: "—"
  },
  {
    occurred_at: "2024-01-15T10:25:00Z",
    agent_id: "appraisal-penetration-agent",
    action_type: "create_task",
    entity_type: "crm.task",
    confidence: "0.75",
    mode: "HUMAN_REVIEW",
    violations: "confidence_below_threshold"
  },
  {
    occurred_at: "2024-01-15T10:20:00Z",
    agent_id: "appraisal-penetration-agent",
    action_type: "create_task",
    entity_type: "crm.task",
    confidence: "0.88",
    mode: "LIMITED_WRITE",
    violations: "—"
  },
  {
    occurred_at: "2024-01-15T10:15:00Z",
    agent_id: "appraisal-penetration-agent",
    action_type: "create_task",
    entity_type: "crm.task",
    confidence: "0.95",
    mode: "FULL_AUTO",
    violations: "—"
  },
  {
    occurred_at: "2024-01-15T10:10:00Z",
    agent_id: "appraisal-penetration-agent",
    action_type: "create_task",
    entity_type: "crm.task",
    confidence: "0.72",
    mode: "HUMAN_REVIEW",
    violations: "confidence_below_threshold"
  }
];

export async function GET() {
  try {
    // In production, this would query the audit_log table
    // const { data, error } = await supabase
    //   .from("audit_log")
    //   .select("occurred_at, agent_id, action_type, entity_type, confidence, policy_check")
    //   .order("occurred_at", { ascending: false })
    //   .limit(200);
    
    return NextResponse.json(mockRecentData);
  } catch (error) {
    console.error('Compliance recent error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
