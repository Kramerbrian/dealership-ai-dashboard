# Google Directory Sync Setup Guide for DealershipAI

## Overview

This guide explains how to set up Google Workspace Directory Sync with WorkOS for DealershipAI. Directory Sync automatically synchronizes users and groups from Google Workspace to your application, keeping user data up-to-date.

---

## Prerequisites

- WorkOS account with Directory Sync enabled
- Google Workspace admin account
- Organization created in WorkOS Dashboard

---

## Step 1: Select Environment

1. **Login to WorkOS Dashboard**
   - Go to https://dashboard.workos.com/
   - Sign in to your account
   - Ensure you have the desired **environment** selected (Production/Development)

---

## Step 2: Send Admin Invite Link

### For WorkOS Dashboard (Manual):

1. **Navigate to Organizations**
   - In the WorkOS Dashboard, select **"Organizations"** in the navigation
   - Select the organization you want to enable Google Directory Sync for

2. **Invite Admin**
   - On the Organization page, find **"Invite an admin to set up this organization"**
   - Click **"Invite Admin"** button

3. **Configure Features**
   - Select **"Directory Sync"** 
   - Optionally select other features (SSO, User Management, etc.)
   - Click **Continue**

4. **Send Invite**
   - Enter the email address of the organization admin
   - OR copy the setup link and send it manually
   - Click **"Send Invite"**

### Programmatic Approach (API):

You can also generate Directory Sync portal links programmatically:

```typescript
// app/api/workos/directory-sync/invite/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateDirectorySyncPortalLink } from '@/lib/workos-portal';

export async function POST(req: NextRequest) {
  try {
    const { organizationId, returnUrl } = await req.json();
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Generate Directory Sync portal link
    const portalLink = await generateDirectorySyncPortalLink(
      organizationId,
      returnUrl || 'https://dealershipai.com/settings'
    );

    return NextResponse.json({
      success: true,
      portalLink,
      message: 'Send this link to the organization admin'
    });

  } catch (error: any) {
    console.error('[Directory Sync Invite] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate portal link' },
      { status: 500 }
    );
  }
}
```

---

## Step 3: Authenticate with Google Admin Credentials

**Organization Admin Steps:**

1. **Access the Portal Link**
   - Admin receives the invite email or link
   - Opens the link in their browser

2. **Select Google Provider**
   - In the portal, choose **Google** as the directory provider
   - Follow the Google OAuth prompts

3. **Grant Permissions**
   - Google will request admin permissions:
     - View and manage users in your Google Workspace organization
     - View and manage groups in your Google Workspace organization
   - Click **"Allow"** to grant permissions

4. **Admin Authentication**
   - Admin signs in with their Google Workspace admin account
   - Authorization is completed

---

## Step 4: Select Groups to Sync

**Admin Configuration:**

1. **Group Selection Screen**
   - After authentication, admin sees a list of Google Workspace groups
   - Admin can choose which groups to sync

2. **Filter Groups**
   - ✅ **Sync All Groups**: Sync all users from all groups
   - ✅ **Sync Selected Groups**: Only sync users from selected groups
   - Selected groups filter determines which users are synced

3. **Important Note:**
   - If groups are filtered, **only users with membership in synced groups** will be synced
   - Users not in any synced groups will **not** appear in your directory

4. **Complete Setup**
   - Click **"Complete Setup"** or **"Save"**
   - Directory Sync begins immediately

---

## Step 5: Sync Users and Groups

### Automatic Sync

- **Initial Sync**: Begins immediately after setup completion
- **Regular Sync**: Performed approximately every **30 minutes** automatically
- **Real-time Updates**: Changes in Google Workspace are synced within 30 minutes

### Viewing Synced Data

**In WorkOS Dashboard:**

1. Navigate to **Directory Sync** → **Users** tab
2. View all synced users from Google Workspace
3. Check user details, groups, and membership status

### API Integration

To integrate synced data into your application:

```typescript
// lib/workos-directory-sync.ts
import { workos } from './workos';

/**
 * List directory users
 */
export async function listDirectoryUsers(directoryId: string) {
  if (!workos) {
    throw new Error('WorkOS not configured');
  }

  const users = await workos.directorySync.listUsers({
    directory: directoryId,
  });

  return users;
}

/**
 * List directory groups
 */
export async function listDirectoryGroups(directoryId: string) {
  if (!workos) {
    throw new Error('WorkOS not configured');
  }

  const groups = await workos.directorySync.listGroups({
    directory: directoryId,
  });

  return groups;
}

/**
 * Get user by email
 */
export async function getDirectoryUserByEmail(
  directoryId: string,
  email: string
) {
  if (!workos) {
    throw new Error('WorkOS not configured');
  }

  const users = await workos.directorySync.listUsers({
    directory: directoryId,
    email,
  });

  return users.data[0] || null;
}
```

---

## API Endpoint: Directory Sync Users

Create an API route to access synced users:

```typescript
// app/api/workos/directory-sync/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-protection';
import { listDirectoryUsers } from '@/lib/workos-directory-sync';

export async function GET(req: NextRequest) {
  try {
    // Require authentication
    const authResult = await getAuthenticatedUser(req);
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const directoryId = searchParams.get('directoryId');
    const organizationId = searchParams.get('organizationId');

    if (!directoryId && !organizationId) {
      return NextResponse.json(
        { error: 'directoryId or organizationId is required' },
        { status: 400 }
      );
    }

    // Get directory ID from organization if not provided
    let finalDirectoryId = directoryId;
    if (!finalDirectoryId && organizationId) {
      // Fetch organization to get directory ID
      const organization = await workos.organizations.getOrganization(organizationId);
      finalDirectoryId = organization.domains?.[0]?.directoryId || null;
    }

    if (!finalDirectoryId) {
      return NextResponse.json(
        { error: 'Directory not found' },
        { status: 404 }
      );
    }

    const users = await listDirectoryUsers(finalDirectoryId);

    return NextResponse.json({
      success: true,
      users: users.data,
      total: users.listMetadata.total,
    });

  } catch (error: any) {
    console.error('[Directory Sync Users] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch directory users' },
      { status: 500 }
    );
  }
}
```

---

## Webhook: Handle Directory Sync Events

Set up webhooks to handle real-time directory sync events:

```typescript
// app/api/webhooks/workos/directory-sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { workos } from '@/lib/workos';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature (important for security)
    const signature = req.headers.get('workos-signature');
    const body = await req.text();

    // Verify webhook (WorkOS provides signature verification)
    // See: https://workos.com/docs/webhooks/securing
    
    const event = JSON.parse(body);

    switch (event.type) {
      case 'dsync.user.created':
        await handleUserCreated(event.data);
        break;
      
      case 'dsync.user.updated':
        await handleUserUpdated(event.data);
        break;
      
      case 'dsync.user.deleted':
        await handleUserDeleted(event.data);
        break;
      
      case 'dsync.group.created':
        await handleGroupCreated(event.data);
        break;
      
      case 'dsync.group.updated':
        await handleGroupUpdated(event.data);
        break;
      
      case 'dsync.group.deleted':
        await handleGroupDeleted(event.data);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('[Directory Sync Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleUserCreated(userData: any) {
  // Sync user to your database
  await prisma.user.upsert({
    where: { email: userData.email },
    update: {
      name: `${userData.firstName} ${userData.lastName}`,
      metadata: JSON.stringify({
        workosUserId: userData.id,
        directoryId: userData.directoryId,
      }),
    },
    create: {
      email: userData.email,
      name: `${userData.firstName} ${userData.lastName}`,
      metadata: JSON.stringify({
        workosUserId: userData.id,
        directoryId: userData.directoryId,
      }),
    },
  });
}

async function handleUserUpdated(userData: any) {
  // Update user in your database
  await prisma.user.update({
    where: { email: userData.email },
    data: {
      name: `${userData.firstName} ${userData.lastName}`,
    },
  });
}

async function handleUserDeleted(userData: any) {
  // Remove user from your database (or mark as deleted)
  await prisma.user.update({
    where: { email: userData.email },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });
}

async function handleGroupCreated(groupData: any) {
  // Sync group to your database
  console.log('Group created:', groupData);
}

async function handleGroupUpdated(groupData: any) {
  // Update group in your database
  console.log('Group updated:', groupData);
}

async function handleGroupDeleted(groupData: any) {
  // Remove group from your database
  console.log('Group deleted:', groupData);
}
```

---

## Frequently Asked Questions

### Can you selectively sync users and groups from Google Workspace?

**Yes!** During setup (Step 4), you can select specific groups to sync. Only users with membership in the selected groups will be synced to your directory.

### When do users get removed from a directory?

Users are removed from the directory in two scenarios:

1. **User removed/archived in Google Workspace**: When a user is deleted or archived in Google Workspace and no longer returned by the Google API
2. **User removed from all synced groups**: When directory sync is filtering specific groups, and a user is removed from all groups that are being filtered in

### How often do Google Workspace directories perform a sync?

**Every ~30 minutes** starting from the time of the initial sync. This is automatic and requires no configuration.

### Does Google Directory Sync support nested groups?

**Yes!** Nested groups (groups within groups) are supported. This feature is currently in restricted preview. Contact [WorkOS support](mailto:support@workos.com) to enable nested groups.

### What is the `idp_id` for directory groups from Google Workspace?

The `idp_id` is the unique identifier provided by Google Workspace for each group. This is persisted as the `idp_id` for [directory groups](https://workos.com/docs/reference/directory-sync/directory-group) in WorkOS.

---

## Integration Checklist

- [ ] Organization created in WorkOS Dashboard
- [ ] Admin invite link generated and sent
- [ ] Admin authenticated with Google Workspace
- [ ] Groups selected for sync (if filtering)
- [ ] Initial sync completed
- [ ] Webhook endpoint created and configured
- [ ] Webhook URL added to WorkOS Dashboard
- [ ] Directory users accessible via API
- [ ] User provisioning integrated with your database

---

## Security Best Practices

1. **Verify Webhook Signatures**: Always verify WorkOS webhook signatures
2. **HTTPS Only**: Use HTTPS for all webhook endpoints
3. **Rate Limiting**: Implement rate limiting on webhook endpoints
4. **Idempotency**: Handle duplicate webhook events gracefully
5. **Error Handling**: Log and monitor webhook failures

---

## Next Steps

1. **Set up webhook URL** in WorkOS Dashboard
2. **Test directory sync** with a small test organization
3. **Monitor sync status** in WorkOS Dashboard
4. **Integrate synced users** into your application's user management
5. **Set up notifications** for sync failures or user deletions

---

## Resources

- [WorkOS Directory Sync Documentation](https://workos.com/docs/directory-sync)
- [WorkOS Webhooks Guide](https://workos.com/docs/webhooks)
- [WorkOS Directory Sync API Reference](https://workos.com/docs/reference/directory-sync)

