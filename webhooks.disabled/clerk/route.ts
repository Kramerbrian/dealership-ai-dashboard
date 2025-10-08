import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { userService } from '@/backend/src/services/userService';
import { tenantService } from '@/backend/src/services/tenantService';

export async function POST(req: NextRequest) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
    }

    // Get the headers
    const headerPayload = req.headers;
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error occured -- no svix headers', {
        status: 400,
      });
    }

    // Get the body
    const payload = await req.text();
    const body = JSON.parse(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error occured', {
        status: 400,
      });
    }

    // Handle the webhook
    const eventType = evt.type;

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      
      // Create user in our database
      // For now, we'll create a default tenant for individual users
      const defaultTenant = await tenantService.createTenant({
        name: `${first_name} ${last_name}'s Dealership`,
        type: 'single',
        settings: {
          features_enabled: ['basic_analytics'],
          billing_tier: 'basic',
        }
      });

      await userService.createUser({
        clerkId: id,
        tenantId: defaultTenant.id,
        role: 'dealership_admin',
      });

      console.log('User created:', { id, email: email_addresses[0]?.email_address });
    }

    if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      
      // Update user in our database
      // This would typically update the user's profile information
      console.log('User updated:', { id, email: email_addresses[0]?.email_address });
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;
      
      // Handle user deletion
      // This might involve anonymizing data or transferring ownership
      console.log('User deleted:', { id });
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
