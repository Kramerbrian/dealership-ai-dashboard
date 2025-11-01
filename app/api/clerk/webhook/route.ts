import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/clerk/webhook
 * 
 * Handles Clerk webhook events for user lifecycle management.
 * 
 * Phase 1 (Discover): clerk.user.created → Pre-seed CRM lead + auto-provision tenant
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = headers();
    const svixId = headersList.get("svix-id");
    const svixTimestamp = headersList.get("svix-timestamp");
    const svixSignature = headersList.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: "Missing svix headers" },
        { status: 400 }
      );
    }

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

    let evt: any;

    try {
      evt = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (err) {
      console.error("Clerk webhook verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const { type, data } = evt;

    // Phase 1: Handle user creation - Auto-provision tenant and pre-seed CRM lead
    if (type === "user.created") {
      await handleUserCreated(data);
    } else if (type === "user.updated") {
      await handleUserUpdated(data);
    } else if (type === "user.deleted") {
      await handleUserDeleted(data);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Clerk webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Phase 1 (Discover): Auto-provision tenant and pre-seed CRM lead
 */
async function handleUserCreated(userData: any) {
  try {
    const email = userData.email_addresses?.[0]?.email_address;
    const firstName = userData.first_name || "";
    const lastName = userData.last_name || "";
    const name = `${firstName} ${lastName}`.trim() || email?.split("@")[0] || "Guest";
    const clerkId = userData.id;

    if (!email) {
      console.warn("User created without email address");
      return;
    }

    // Auto-provision tenant (dealership) for new user
    let dealership;
    try {
      // Check if user already has a dealership (from free scan)
      dealership = await prisma.dealership.findFirst({
        where: { email },
      });

      if (!dealership) {
        // Create new dealership/tenant
        dealership = await prisma.dealership.create({
          data: {
            name: name || email.split("@")[0],
            domain: email.split("@")[1] || "unknown",
            email,
            plan: "STARTER", // Free tier
            status: "ACTIVE",
          },
        });
      }
    } catch (dbError) {
      console.error("Error creating dealership:", dbError);
    }

    // Create user record in database
    try {
      await prisma.user.upsert({
        where: { email },
        create: {
          email,
          name,
          role: "user",
          dealershipId: dealership?.id,
          metadata: JSON.stringify({
            clerkId,
            firstName,
            lastName,
            source: "clerk_webhook",
            createdAt: new Date().toISOString(),
          }),
        },
        update: {
          name,
          metadata: JSON.stringify({
            clerkId,
            firstName,
            lastName,
            updatedAt: new Date().toISOString(),
          }),
        },
      });
    } catch (userError) {
      console.error("Error creating user:", userError);
    }

    // Pre-seed CRM lead and sync account status in Supabase (if configured)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Sync account status (auto-provision tenant)
        await supabase.rpc('sync_account_status', {
          event: {
            userId: clerkId,
            email,
            plan: 'FREE',
            status: 'active',
            source: 'clerk'
          }
        });

        // Track PLG event
        await supabase.rpc('track_plg_event', {
          p_user_id: clerkId,
          p_event_type: 'user.created',
          p_source: 'clerk',
          p_event_data: {
            email,
            name,
            firstName,
            lastName
          }
        });

        // Insert lead into CRM (for backward compatibility)
        await supabase.from("leads").upsert({
          email,
          company: name || email.split("@")[0],
          source: "clerk_user_created",
          status: "new",
          created_at: new Date().toISOString(),
        }, {
          onConflict: "email",
        });

        console.log(`✅ Account synced and CRM lead created for: ${email}`);
      } catch (supabaseError) {
        console.error("Error syncing to Supabase:", supabaseError);
      }
    }

    // Create default free subscription
    try {
      if (dealership) {
        await prisma.subscription.upsert({
          where: { userId: (await prisma.user.findUnique({ where: { email } }))?.id || "" },
          create: {
            userId: (await prisma.user.findUnique({ where: { email } }))?.id || "",
            plan: "FREE",
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          },
          update: {},
        });
      }
    } catch (subError) {
      console.error("Error creating default subscription:", subError);
    }

    console.log(`✅ User auto-provisioned: ${email} (Clerk ID: ${clerkId})`);

  } catch (error) {
    console.error("Error handling user.created:", error);
    throw error;
  }
}

/**
 * Handle user updated event
 */
async function handleUserUpdated(userData: any) {
  try {
    const email = userData.email_addresses?.[0]?.email_address;
    const firstName = userData.first_name || "";
    const lastName = userData.last_name || "";
    const name = `${firstName} ${lastName}`.trim() || email?.split("@")[0];

    if (!email) return;

    await prisma.user.updateMany({
      where: { email },
      data: {
        name,
        metadata: JSON.stringify({
          firstName,
          lastName,
          updatedAt: new Date().toISOString(),
        }),
      },
    });

    console.log(`✅ User updated: ${email}`);
  } catch (error) {
    console.error("Error handling user.updated:", error);
  }
}

/**
 * Handle user deleted event
 */
async function handleUserDeleted(userData: any) {
  try {
    const email = userData.email_addresses?.[0]?.email_address;
    if (!email) return;

    // Soft delete: Update user status
    await prisma.user.updateMany({
      where: { email },
      data: {
        metadata: JSON.stringify({
          deletedAt: new Date().toISOString(),
          deleted: true,
        }),
      },
    });

    // Cancel subscriptions
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.subscription.updateMany({
        where: { userId: user.id },
        data: { status: "CANCELLED" },
      });
    }

    console.log(`✅ User deleted: ${email}`);
  } catch (error) {
    console.error("Error handling user.deleted:", error);
  }
}

