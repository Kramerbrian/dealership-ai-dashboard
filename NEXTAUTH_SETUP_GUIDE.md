# 🔐 NextAuth CLI & MCP Setup Guide

## 🚀 Quick Start

### 1. Initialize NextAuth
```bash
npm run auth:init
```

### 2. Generate Secret Key
```bash
npm run auth:secret
```

### 3. Setup OAuth Providers
```bash
npm run auth:setup
```

### 4. Test Configuration
```bash
npm run auth:test
```

### 5. Deploy to Vercel
```bash
npm run auth:deploy
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run auth:init` | Initialize NextAuth configuration |
| `npm run auth:setup` | Show OAuth provider setup instructions |
| `npm run auth:test` | Test authentication configuration |
| `npm run auth:secret` | Generate a new secret key |
| `npm run auth:deploy` | Show Vercel deployment instructions |

## 🔧 OAuth Provider Setup

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://dash.dealershipai.com/api/auth/callback/google`

### GitHub OAuth Setup
1. Go to [GitHub Settings > Developer settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Authorization callback URL: `https://dash.dealershipai.com/api/auth/callback/github`

### Microsoft OAuth Setup
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory > App registrations
3. Create new registration
4. Add redirect URI: `https://dash.dealershipai.com/api/auth/callback/microsoft`

## 🌐 Environment Variables

Add these to your `.env.local` file:

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://dash.dealershipai.com
NEXTAUTH_SECRET=your-generated-secret-key

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=your-microsoft-tenant-id

# Database
DATABASE_URL=postgresql://username:password@host:port/database
```

## 🗄️ Database Schema

The NextAuth MCP automatically generates the required Prisma schema:

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          String    @default("user")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts Account[]
  sessions Session[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

## 🤖 MCP Integration

The NextAuth MCP provides AI assistants with authentication management capabilities:

### Features
- ✅ User management (create, read, update, delete)
- ✅ OAuth provider configuration
- ✅ Session management
- ✅ Role-based access control
- ✅ Password hashing and verification
- ✅ User statistics and analytics
- ✅ Configuration validation
- ✅ Environment variable management

### Usage in AI Assistants
```typescript
import { NextAuthMCP, defaultNextAuthConfig } from '@/mcp/nextauth-mcp';

const authMCP = new NextAuthMCP(defaultNextAuthConfig);

// Create user
const user = await authMCP.createUser({
  email: 'user@example.com',
  name: 'John Doe',
  password: 'securepassword',
  role: 'manager'
});

// Get user stats
const stats = await authMCP.getUserStats();

// Validate configuration
const validation = authMCP.validateConfig();
```

## 🚀 Vercel Deployment

### 1. Add Environment Variables
Go to Vercel Dashboard > Project Settings > Environment Variables and add:

```
NEXTAUTH_URL=https://dash.dealershipai.com
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
DATABASE_URL=your-database-url
```

### 2. Deploy
```bash
vercel --prod
```

## 🧪 Testing

### Test Authentication Flow
1. Start development server: `npm run dev`
2. Visit: `http://localhost:3000/api/auth/signin`
3. Test OAuth providers
4. Test credentials login

### Test API Endpoints
```bash
# Test health check
curl http://localhost:3000/api/health

# Test auth status
curl http://localhost:3000/api/auth/session
```

## 🔒 Security Features

- ✅ JWT-based sessions
- ✅ Password hashing with bcrypt
- ✅ CSRF protection
- ✅ Secure cookie handling
- ✅ Role-based access control
- ✅ OAuth2 security best practices
- ✅ Environment variable validation

## 📊 Monitoring

### User Statistics
```typescript
const stats = await authMCP.getUserStats();
console.log(`Total users: ${stats.totalUsers}`);
console.log(`Active users: ${stats.activeUsers}`);
console.log(`Users by role:`, stats.usersByRole);
```

### Session Management
- Automatic session cleanup
- Token refresh handling
- Secure logout
- Multi-device support

## 🛠️ Troubleshooting

### Common Issues

1. **OAuth Error**: Check client ID and secret
2. **Database Error**: Verify DATABASE_URL
3. **Secret Error**: Generate new secret with `npm run auth:secret`
4. **Redirect Error**: Check callback URLs in OAuth providers

### Debug Mode
Set `NEXTAUTH_DEBUG=true` in your environment variables for detailed logs.

## 📚 API Reference

### NextAuthMCP Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `createUser()` | Create new user | `{ email, name, password?, role? }` |
| `getUserById()` | Get user by ID | `id: string` |
| `updateUser()` | Update user | `id: string, updates: object` |
| `deleteUser()` | Delete user | `id: string` |
| `getUsers()` | Get all users | `options?: object` |
| `getUserStats()` | Get user statistics | - |
| `validateConfig()` | Validate configuration | - |
| `exportConfig()` | Export for deployment | - |

## 🎯 Next Steps

1. ✅ Initialize NextAuth: `npm run auth:init`
2. ✅ Configure OAuth providers
3. ✅ Set environment variables
4. ✅ Deploy to Vercel
5. ✅ Test authentication flow
6. ✅ Monitor user activity
7. ✅ Implement role-based features

Your DealershipAI dashboard now has enterprise-grade authentication! 🚀
