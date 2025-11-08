# DealershipAI Admin Role Patch

## 1️⃣  Purpose
Locks `/admin` to only authorized users (admins listed in `.env` or users with `publicMetadata.role = 'admin'`).

## 2️⃣  Env Setup
Add to `.env.local`:
```
ADMIN_EMAILS=admin@yourdealership.com,ceo@yourgroup.com
NEXT_PUBLIC_ADMIN_EMAILS=admin@yourdealership.com,ceo@yourgroup.com
```

## 3️⃣  Assign roles via Clerk Dashboard
Option A — by Email
- Add emails above to `.env`

Option B — by Metadata
- In Clerk → User → Metadata → `publicMetadata.role = 'admin'`

## 4️⃣  Behavior
- Non-admins visiting `/admin` see an *Access Denied* screen and are redirected to `/landing`.
- Authorized users see the full dashboard with analytics and CSV export.

## 5️⃣  Extend Later
- Add org roles with `@clerk/nextjs` organizations if multi-rooftop access needed.
- Use the `requireAdmin()` helper in server actions or API routes to restrict access beyond UI.

