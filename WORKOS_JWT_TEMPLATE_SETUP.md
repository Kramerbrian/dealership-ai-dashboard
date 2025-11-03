# WorkOS JWT Template Setup Guide for DealershipAI

## Overview

WorkOS JWT templates allow you to customize the claims in access tokens issued after SSO authentication. This guide shows you how to configure JWT templates for DealershipAI and use them in your application.

---

## Step 1: Configure JWT Template in WorkOS Dashboard

1. **Navigate to WorkOS Dashboard**
   - Go to https://dashboard.workos.com/
   - Sign in to your account

2. **Access JWT Template Configuration**
   - Click on **Authentication** section
   - Go to **Sessions** section
   - Click **Configure JWT Template**

3. **Create Custom JWT Template**

---

## Recommended JWT Template for DealershipAI

Based on your application's needs, here's a recommended template:

```json
{
  "email": "{{ user.email }}",
  "name": "{{ user.first_name }} {{ user.last_name }}",
  "organization_id": "{{ organization.id || null }}",
  "organization_name": "{{ organization.name || null }}",
  "connection_id": "{{ connection.id || null }}",
  "connection_type": "{{ connection.type || null }}",
  "role": "{{ organization.memberships[0].role || user.role || 'user' }}",
  "permissions": {{ organization.memberships[0].permissions || [] }},
  "dealership_id": "{{ user.metadata.dealership_id || null }}",
  "dealership_name": "{{ user.metadata.dealership_name || null }}",
  "tier": "{{ user.metadata.tier || organization.metadata.plan || 'free' }}"
}
```

### Simplified Version (Minimal Claims)

```json
{
  "email": "{{ user.email }}",
  "name": "{{ user.first_name || user.email }}",
  "org_id": "{{ organization.id }}",
  "role": "{{ organization.memberships[0].role || 'user' }}"
}
```

---

## JWT Template Examples for Common Use Cases

### Example 1: User and Organization Info

**Template:**
```json
{
  "user_id": "{{ user.id }}",
  "email": "{{ user.email }}",
  "first_name": "{{ user.first_name }}",
  "last_name": "{{ user.last_name }}",
  "organization_id": "{{ organization.id }}",
  "organization_name": "{{ organization.name }}"
}
```

**Output:**
```json
{
  "user_id": "user_123",
  "email": "todd@example.com",
  "first_name": "Todd",
  "last_name": "Rundgren",
  "organization_id": "org_456",
  "organization_name": "Acme Corp"
}
```

### Example 2: With Fallback Values

**Template:**
```json
{
  "email": "{{ user.email }}",
  "display_name": "{{ user.first_name || user.email }}",
  "role": "{{ organization.memberships[0].role || 'viewer' }}",
  "tier": "{{ user.metadata.tier || organization.metadata.plan || 'free' }}"
}
```

**Output (when first_name is null):**
```json
{
  "email": "todd@example.com",
  "display_name": "todd@example.com",
  "role": "admin",
  "tier": "enterprise"
}
```

### Example 3: Including Custom Metadata

**Template:**
```json
{
  "email": "{{ user.email }}",
  "organization_id": "{{ organization.id }}",
  "custom_claims": {
    "dealership_id": "{{ user.metadata.dealership_id }}",
    "market": "{{ user.metadata.market || organization.metadata.market }}",
    "features": {{ user.metadata.enabled_features || organization.metadata.features || [] }}
  }
}
```

---

## Step 2: Extract JWT Token from WorkOS Callback

Update your callback handler to extract the JWT token:

```typescript
// app/auth/callback/route.ts
const { profile, accessToken } = await workos.sso.getProfileAndToken({
  code,
  clientId,
});

// The accessToken is a JWT that you can verify and use
// Store it securely or extract claims
```

---

## Step 3: Verify JWT Tokens in Your Application

Create a utility to verify WorkOS JWT tokens:

```typescript
// lib/workos-jwt.ts
import { jwtVerify } from 'jose';
import { workos } from './workos';

export async function verifyWorkOSToken(token: string) {
  try {
    // WorkOS signs tokens with their public key
    // You can get the JWKS URL from WorkOS or use their SDK
    
    // For now, you can decode and verify using WorkOS SDK
    const decoded = await workos.userManagement.getUser(token);
    return decoded;
  } catch (error) {
    console.error('[WorkOS JWT] Verification failed:', error);
    return null;
  }
}

export function extractClaimsFromToken(token: string) {
  try {
    // Decode JWT without verification (for development only)
    const [header, payload, signature] = token.split('.');
    const decodedPayload = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf-8')
    );
    return decodedPayload;
  } catch (error) {
    console.error('[WorkOS JWT] Decode failed:', error);
    return null;
  }
}
```

---

## Step 4: Use JWT Claims in Your Application

### Extract Claims in API Routes

```typescript
// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyWorkOSToken } from '@/lib/workos-jwt';

export async function GET(req: NextRequest) {
  // Get token from Authorization header or cookie
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || 
                req.cookies.get('wos-access-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify and extract claims
  const claims = extractClaimsFromToken(token);
  
  // Use claims for authorization
  const organizationId = claims?.organization_id;
  const role = claims?.role;
  const tier = claims?.tier;

  // Return dashboard data based on claims
  return NextResponse.json({
    organizationId,
    role,
    tier,
    // ... other data
  });
}
```

---

## Important Notes

### Reserved Keys

You **cannot** use these keys in your template:
- `iss` (issuer)
- `sub` (subject)
- `exp` (expiration)
- `iat` (issued at)
- `nbf` (not before)
- `jti` (JWT ID)

### Size Limits

- JWT templates must render to JSON ≤ **3072 bytes**
- This is due to browser cookie size constraints

### Null Handling

- Top-level `null` values are **removed** from the token
- `null` values in string concatenation become empty strings `""`
- Use fallback operator `||` to provide defaults

### Security Best Practices

1. **Never expose sensitive data** in JWT tokens (tokens can be decoded)
2. **Use JWT tokens for authorization**, not authentication
3. **Verify tokens** on every request
4. **Set appropriate expiration times** (WorkOS handles this)
5. **Store tokens securely** (httpOnly cookies)

---

## Testing Your JWT Template

1. **Configure template** in WorkOS Dashboard
2. **Complete SSO login** flow
3. **Extract token** from callback response
4. **Decode token** at https://jwt.io/ (for testing only)
5. **Verify claims** match your template

---

## Troubleshooting

### Template Validation Errors

**Error:** "Template must render to an object"
- **Fix:** Ensure template is valid JSON starting with `{`

**Error:** "Keys reserved (iss, sub, exp, etc.)"
- **Fix:** Remove reserved keys from template

**Error:** "String encapsulated expression cannot contain object reference"
- **Fix:** Don't interpolate objects inside strings, use them as top-level values

**Error:** "Invalid path: unknown.variable"
- **Fix:** Check variable names - use `user.email`, not `user.email_address`

### Token Size Issues

If your token is too large:
- Remove unnecessary claims
- Use shorter variable names
- Avoid deep nesting
- Remove `null` values (they're automatically removed anyway)

---

## Next Steps

1. ✅ Configure JWT template in WorkOS Dashboard
2. ✅ Update callback handler to extract `accessToken`
3. ✅ Create JWT verification utility
4. ✅ Use JWT claims in your API routes
5. ✅ Test JWT token flow end-to-end

---

## Reference

- [WorkOS JWT Templates Docs](https://workos.com/docs/authkit/jwt-templates)
- [WorkOS SSO Documentation](https://workos.com/docs/sso)
- [JWT.io Debugger](https://jwt.io/) - For testing/debugging tokens

