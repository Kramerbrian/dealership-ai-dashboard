import { NextResponse } from "next/server";
import { withAuth } from "../../_utils/withAuth";
import { enqueue } from "@/backend/engine/queue";
import { storeTelemetry } from "@/lib/telemetry/storage";
import { redis } from "@/lib/cache";

/**
 * Apply a fix from a pulse
 * Idempotent: requires Idempotency-Key header
 */
export const POST = withAuth(async ({ req, tenantId }) => {
  try {
    const idempotencyKey = req.headers.get("Idempotency-Key");
    if (!idempotencyKey) {
      return NextResponse.json(
        { error: "Idempotency-Key header required" },
        { status: 400 }
      );
    }

    // Check if already processed (idempotency)
    if (redis) {
      const existing = await redis.get(`fix:${tenantId}:${idempotencyKey}`);
      if (existing) {
        return NextResponse.json(JSON.parse(existing as string));
      }
    }

    const body = await req.json();
    const { pulseId, tier, simulate = false } = body;

    if (!pulseId) {
      return NextResponse.json(
        { error: "pulseId required" },
        { status: 400 }
      );
    }

    // TODO: Load pulse details from snapshot/ledger
    // For now, synthetic structure
    const fix = {
      pulseId,
      tier: tier || "manual",
      simulate,
      tenantId,
      timestamp: new Date().toISOString()
    };

    if (simulate) {
      // Dry-run: return diff only
      return NextResponse.json({
        simulated: true,
        diff: {
          action: "inject_schema",
          target: "/inventory/vehicle-123",
          field: "offers.availability",
          value: "InStock"
        },
        estimatedImpactUSD: 8200,
        estimatedTimeMin: 17
      });
    }

    // Enqueue fix job
    const { id: jobId } = await enqueue({
      type: "schema-fix",
      data: {
        tenantId,
        pulseId,
        ...fix
      }
    });

    const receipt = {
      fixId: jobId,
      pulseId,
      tenantId,
      appliedAt: new Date().toISOString(),
      status: "queued",
      undoWindowMinutes: 10
    };

    // Store idempotency result
    if (redis) {
      await redis.set(
        `fix:${tenantId}:${idempotencyKey}`,
        JSON.stringify(receipt),
        { ex: 600 } // 10 minutes
      );
    }

    // Log telemetry
    await storeTelemetry({
      event_type: "fix.apply_success",
      tenant_id: tenantId,
      metadata: { pulseId, jobId, tier }
    }).catch(() => {});

    return NextResponse.json(receipt, { status: 202 });
  } catch (error) {
    console.error("Fix apply error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to apply fix" },
      { status: 500 }
    );
  }
});

