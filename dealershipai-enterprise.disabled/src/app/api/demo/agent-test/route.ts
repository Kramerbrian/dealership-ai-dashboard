import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Demo agent action request
    const demoRequest = {
      tenant_id: "00000000-0000-0000-0000-000000000001",
      agent_id: "appraisal-penetration-agent",
      write_intent: {
        dest: "crm.tasks",
        payload: {
          taskType: "appraisal_nudge",
          roId: "ro_12345",
          vin: "1HGBH41JXMN109186",
          dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          assignee: "advisor_001",
          notes: "High-value service customer with trade-in potential"
        },
        action_type: "create_task",
        entity_type: "crm.task",
        entity_id: "task_" + Date.now(),
        confidence: 0.92,
        rationale: "Customer has high-value vehicle with good trade-in potential based on service history"
      },
      model_version: "gpt-4-turbo",
      prompt_template: "Analyze service RO for appraisal opportunity..."
    };

    // Call the agent action API
    const response = await fetch(`${req.nextUrl.origin}/api/agent-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(demoRequest)
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      demo_request: demoRequest,
      agent_response: result,
      message: "Demo agent action completed successfully"
    });
  } catch (error) {
    console.error('Demo agent test error:', error);
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
    message: "Agent Test Demo API",
    description: "Test the agent action system with a sample appraisal penetration agent request",
    usage: "POST to this endpoint to trigger a demo agent action"
  });
}
