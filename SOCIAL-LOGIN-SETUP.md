# Social Login Setup Guide

## Adding Social Login Providers to Ory

### Supported Providers:
- Google
- GitHub
- Microsoft
- Apple
- Facebook
- LinkedIn
- Discord
- Slack

---

## 1. Google OAuth Setup

### Step 1: Create Google OAuth App
1. Go to: https://console.cloud.google.com/apis/credentials
2. Create a new project: "DealershipAI"
3. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
4. Choose **"Web application"**
5. Add authorized redirect URIs:
   ```
   https://optimistic-haslett-3r8udelhc2.projects.oryapis.com/self-service/methods/oidc/callback/google
   ```
6. Copy the **Client ID** and **Client Secret**

### Step 2: Enable Google Login in Ory

Run this command with your credentials:

```bash
ory patch identity-config \
  --project 360ebb8f-2337-48cd-9d25-fba49a262f9c \
  --workspace 83af532a-eee6-4ad8-96c4-f4802a90940a \
  --replace '/selfservice/methods/oidc/enabled=true' \
  --add '/selfservice/methods/oidc/config/providers/-={
    "id": "google",
    "provider": "google",
    "client_id": "YOUR_GOOGLE_CLIENT_ID",
    "client_secret": "YOUR_GOOGLE_CLIENT_SECRET",
    "mapper_url": "base64://bG9jYWwgY2xhaW1zID0gc3RkLmV4dFZhcihcJ2NsYWltc1wnKSArIHt9Owp7CiAgaWRlbnRpdHk6IHsKICAgIHRyYWl0czogewogICAgICBlbWFpbDogY2xhaW1zLmVtYWlsLAogICAgICBuYW1lOiBjbGFpbXMubmFtZSwKICAgICAgcGljdHVyZTogY2xhaW1zLnBpY3R1cmUsCiAgICB9LAogIH0sCn0K",
    "scope": ["openid", "email", "profile"],
    "requested_claims": {
      "id_token": {
        "email": {"essential": true},
        "email_verified": {"essential": true}
      }
    }
  }'
```

---

## 2. GitHub OAuth Setup

### Step 1: Create GitHub OAuth App
1. Go to: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name:** DealershipAI
   - **Homepage URL:** https://dealershipai.com
   - **Authorization callback URL:**
     ```
     https://optimistic-haslett-3r8udelhc2.projects.oryapis.com/self-service/methods/oidc/callback/github
     ```
4. Copy the **Client ID** and generate a **Client Secret**

### Step 2: Enable GitHub Login in Ory

```bash
ory patch identity-config \
  --project 360ebb8f-2337-48cd-9d25-fba49a262f9c \
  --workspace 83af532a-eee6-4ad8-96c4-f4802a90940a \
  --replace '/selfservice/methods/oidc/enabled=true' \
  --add '/selfservice/methods/oidc/config/providers/-={
    "id": "github",
    "provider": "github",
    "client_id": "YOUR_GITHUB_CLIENT_ID",
    "client_secret": "YOUR_GITHUB_CLIENT_SECRET",
    "mapper_url": "base64://bG9jYWwgY2xhaW1zID0gc3RkLmV4dFZhcihcJ2NsYWltc1wnKSArIHt9Owp7CiAgaWRlbnRpdHk6IHsKICAgIHRyYWl0czogewogICAgICBlbWFpbDogY2xhaW1zLmVtYWlsLAogICAgICBuYW1lOiBjbGFpbXMubmFtZSwKICAgICAgcGljdHVyZTogY2xhaW1zLmF2YXRhcl91cmwsCiAgICB9LAogIH0sCn0K",
    "scope": ["user:email"]
  }'
```

---

## 3. Microsoft OAuth Setup

### Step 1: Create Microsoft App Registration
1. Go to: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
2. Click **"+ New registration"**
3. Fill in:
   - **Name:** DealershipAI
   - **Redirect URI:** Web →
     ```
     https://optimistic-haslett-3r8udelhc2.projects.oryapis.com/self-service/methods/oidc/callback/microsoft
     ```
4. Copy **Application (client) ID**
5. Go to **Certificates & secrets** → Create new client secret

### Step 2: Enable Microsoft Login in Ory

```bash
ory patch identity-config \
  --project 360ebb8f-2337-48cd-9d25-fba49a262f9c \
  --workspace 83af532a-eee6-4ad8-96c4-f4802a90940a \
  --replace '/selfservice/methods/oidc/enabled=true' \
  --add '/selfservice/methods/oidc/config/providers/-={
    "id": "microsoft",
    "provider": "microsoft",
    "client_id": "YOUR_MICROSOFT_CLIENT_ID",
    "client_secret": "YOUR_MICROSOFT_CLIENT_SECRET",
    "microsoft_tenant": "common",
    "mapper_url": "base64://bG9jYWwgY2xhaW1zID0gc3RkLmV4dFZhcihcJ2NsYWltc1wnKSArIHt9Owp7CiAgaWRlbnRpdHk6IHsKICAgIHRyYWl0czogewogICAgICBlbWFpbDogY2xhaW1zLmVtYWlsLAogICAgICBuYW1lOiBjbGFpbXMubmFtZSwKICAgIH0sCiAgfSwKfQo=",
    "scope": ["openid", "email", "profile"]
  }'
```

---

## 4. Quick Setup (Enable OIDC Method)

First, just enable the OIDC method:

```bash
ory patch identity-config \
  --project 360ebb8f-2337-48cd-9d25-fba49a262f9c \
  --workspace 83af532a-eee6-4ad8-96c4-f4802a90940a \
  --replace '/selfservice/methods/oidc/enabled=true'
```

---

## Testing Social Login

After adding providers:

1. **Start services:**
   ```bash
   # Terminal 1: Ory Tunnel
   ory tunnel --project 360ebb8f-2337-48cd-9d25-fba49a262f9c http://localhost:3000

   # Terminal 2: Dev Server
   npm run dev
   ```

2. **Test sign-up:**
   - Go to: http://localhost:3000/sign-up
   - You should see social login buttons (Google, GitHub, etc.)
   - Click a button to test OAuth flow

3. **Verify:**
   ```bash
   ory list identities --project 360ebb8f-2337-48cd-9d25-fba49a262f9c
   ```

---

## Important URLs

### Production Redirect URIs:
When you deploy to production, update redirect URIs in OAuth apps:

**Google:**
```
https://auth.dealershipai.com/self-service/methods/oidc/callback/google
```

**GitHub:**
```
https://auth.dealershipai.com/self-service/methods/oidc/callback/github
```

**Microsoft:**
```
https://auth.dealershipai.com/self-service/methods/oidc/callback/microsoft
```

---

## Current Ory Configuration

- **Project ID:** 360ebb8f-2337-48cd-9d25-fba49a262f9c
- **Workspace ID:** 83af532a-eee6-4ad8-96c4-f4802a90940a
- **Ory URL:** https://optimistic-haslett-3r8udelhc2.projects.oryapis.com
- **Callback Base:** https://optimistic-haslett-3r8udelhc2.projects.oryapis.com/self-service/methods/oidc/callback/

---

## Next Steps

1. Choose which providers you want (Google recommended for start)
2. Create OAuth apps in provider dashboards
3. Run the Ory patch commands with your credentials
4. Test the sign-up flow

Need help? Check Ory docs: https://www.ory.sh/docs/kratos/social-signin/overview
