# How to Use the JSON Blueprint with Cursor for Code Generation

## 🎯 Quick Start

### Method 1: Direct File Reference (Recommended)

1. **Open the JSON blueprint in Cursor:**
   ```bash
   # In Cursor, open:
   COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json
   ```

2. **Use Cursor Composer with this prompt:**
   ```
   Using the architecture defined in COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json, 
   generate the complete monorepo structure with:
   
   1. Create the apps/web directory structure with Next.js 14 App Router
   2. Create the apps/dashboard directory structure with authentication routes
   3. Scaffold all API routes defined in the blueprint
   4. Create component skeletons for Mission Board, HAL Chat, and Confidence Ribbon
   5. Set up the packages/ directory with shared, orchestrator, agents, and ui packages
   6. Generate TypeScript types from the database schema
   7. Create Supabase migration files
   ```

### Method 2: Copy-Paste JSON into Chat

1. **Open Cursor Chat (Cmd+L / Ctrl+L)**

2. **Paste this prompt:**
   ```
   I have a complete architecture blueprint in JSON format. Generate the 
   monorepo structure based on this specification:
   
   [Paste the entire contents of COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json]
   
   Please create:
   - The complete directory structure
   - All API route files with TypeScript types
   - Component skeletons
   - Database schema migrations
   ```

### Method 3: Step-by-Step Generation

Generate components incrementally using specific sections of the blueprint:

#### Step 1: Repository Structure
```
Using COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json, create the monorepo root 
structure with:
- apps/web/package.json
- apps/dashboard/package.json
- packages/shared/package.json
- Root package.json with workspace configuration
- Turborepo or Nx configuration
```

#### Step 2: API Routes
```
From the blueprint's apiEndpoints section, generate all API route files:
- apps/dashboard/app/api/orchestrator/route.ts
- apps/dashboard/app/api/ai/autofix/route.ts
- apps/dashboard/app/api/agents/schema-king/route.ts
- etc.

Each route should include:
- TypeScript types from the blueprint
- Authentication checks
- Error handling
- Response formatting
```

#### Step 3: Components
```
From the blueprint's interfaceParadigm.components section, create:
- components/missions/MissionBoard.tsx
- components/missions/MissionCard.tsx
- components/orchestrator/HALChat.tsx
- components/orchestrator/ConfidenceRibbon.tsx

Use the brand voice and personality evolution from the blueprint.
```

#### Step 4: Database Schema
```
From the blueprint's databaseSchema section, generate:
- Supabase migration files
- Prisma schema (if using Prisma)
- TypeScript types for all models
```

---

## 📝 Example Prompts

### Generate Complete Monorepo
```
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json

Generate the complete monorepo structure as specified in the blueprint:
1. Root configuration (package.json, tsconfig.json, etc.)
2. apps/web with marketing routes and calculators
3. apps/dashboard with auth routes and API endpoints
4. packages/ with shared, orchestrator, agents, ui
5. All TypeScript types from the schema
6. Basic component skeletons with proper imports
```

### Generate Specific Feature
```
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json

Generate the Mission Board feature from the blueprint:
- components/missions/MissionBoard.tsx (primary interface)
- components/missions/MissionCard.tsx (individual mission display)
- components/missions/EvidencePanel.tsx (evidence trail viewer)
- API route: /api/missions/route.ts
- Database migration for Missions table
- TypeScript types for Mission interface

Follow the interfaceParadigm.missionBoard specifications.
```

### Generate API Layer
```
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json

Generate all API routes from the apiEndpoints section:
- Use Next.js 14 App Router format
- Include TypeScript types
- Add authentication middleware
- Implement error handling
- Follow the architecture.brain specifications for hybrid internal/remote GPT
```

### Generate Database Migrations
```
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json

Generate Supabase migration files from databaseSchema:
- Create all tables with proper indexes
- Add RLS policies for multi-tenant security
- Include foreign key relationships
- Add triggers for auto-updates
- Generate TypeScript types for all models
```

---

## 🔧 Advanced Usage

### Using with Cursor Rules

Create a `.cursorrules` file that references the blueprint:

```markdown
# Cursor Rules for Cognitive Ops Platform

## Architecture Reference
Always refer to COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json for:
- API endpoint specifications
- Database schema definitions
- Component structure
- Agent hierarchy
- Pricing tiers

## Code Generation Guidelines
1. Follow the repository structure from blueprint.repositoryStructure
2. Use TypeScript types from blueprint.databaseSchema
3. Implement API routes per blueprint.apiEndpoints
4. Use brand voice from blueprint.brandVoice
5. Follow execution guardrails from blueprint.executionGuardrails
```

### Using with Cursor Composer

1. **Open Cursor Composer** (Cmd+I / Ctrl+I)

2. **Reference the blueprint:**
   ```
   @COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Generate the complete 
   apps/dashboard structure with all routes, components, and API endpoints 
   as specified in the blueprint.
   ```

3. **Or use the markdown blueprint:**
   ```
   @COGNITIVE_OPS_MASTER_BLUEPRINT_V1.md Create the monorepo structure 
   following the repository structure section.
   ```

---

## 🎯 Best Practices

### 1. Generate Incrementally
Don't try to generate everything at once. Break it down:
- Week 1: Repository structure + basic routes
- Week 2: Core components
- Week 3: Agent implementations
- Week 4: Marketplace features

### 2. Validate Against Blueprint
After generation, verify:
```bash
# Check structure matches blueprint
tree -L 3 apps/ packages/

# Verify API routes exist
find apps/dashboard/app/api -name "route.ts" | wc -l
# Should match count in blueprint.apiEndpoints
```

### 3. Use TypeScript Types
Always generate TypeScript types from the blueprint schema:
```
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json

Generate TypeScript types for:
- DealerContext
- GlobalPatterns
- OrchestratorUsage
- Missions
- OrchestratorState

Export from packages/shared/types/index.ts
```

### 4. Follow Brand Voice
When generating UI components, reference:
```
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json

Generate HAL Chat component following:
- Personality evolution from brandVoice.personalityEvolution
- Message types from architecture.agentHierarchy.hal
- Voice traits from brandVoice.traits
```

---

## 🚀 Quick Commands

### Generate Everything
```bash
# In Cursor Chat
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Generate complete monorepo
```

### Generate Specific App
```bash
# Generate web app
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Generate apps/web structure

# Generate dashboard app
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Generate apps/dashboard structure
```

### Generate Packages
```bash
# Generate shared package
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Generate packages/shared

# Generate orchestrator package
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Generate packages/orchestrator
```

---

## 📋 Checklist

After generation, verify:

- [ ] Monorepo root structure matches blueprint
- [ ] All apps/ directories created
- [ ] All packages/ directories created
- [ ] API routes match blueprint.apiEndpoints
- [ ] Components match blueprint.interfaceParadigm.components
- [ ] Database schema matches blueprint.databaseSchema
- [ ] TypeScript types generated
- [ ] Package.json files configured
- [ ] Workspace configuration set up

---

## 💡 Pro Tips

1. **Use @ mentions** - Reference the blueprint file directly in Cursor
2. **Be specific** - Ask for specific sections rather than "everything"
3. **Iterate** - Generate, review, refine, repeat
4. **Validate** - Always check generated code against blueprint specs
5. **Document** - Add comments referencing blueprint sections

---

## 🎓 Example Workflow

```bash
# Step 1: Generate structure
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Create monorepo root with 
package.json, tsconfig.json, and workspace config

# Step 2: Generate apps
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Generate apps/web and apps/dashboard 
with Next.js 14 App Router structure

# Step 3: Generate API routes
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Generate all API routes from 
apiEndpoints section

# Step 4: Generate components
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Generate Mission Board, HAL Chat, 
and Confidence Ribbon components

# Step 5: Generate database
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Generate Supabase migrations and 
TypeScript types
```

---

*This guide shows you how to leverage the JSON blueprint for efficient code generation in Cursor.*

