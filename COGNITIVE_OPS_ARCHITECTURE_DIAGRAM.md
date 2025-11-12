# Cognitive Ops Platform — Architecture Diagram

## System Architecture Overview

```mermaid
graph TB
    subgraph "User Interface Layer"
        MB[Mission Board]
        HAL[HAL Chat]
        CR[Confidence Ribbon]
        PV[Pulse Dashboard]
    end

    subgraph "Orchestrator Layer"
        HAL_SUP[HAL Supervisor]
        ORCH[Orchestrator 3.0]
        QAI[QAI Calculator]
        PIQR[PIQR Analyzer]
        OCI[OCI Calculator]
        ASR[ASR Generator]
    end

    subgraph "Agent Layer"
        SK[Schema King]
        MS[Mystery Shop]
        AF[Auto-Fix Engine]
    end

    subgraph "Data Layer"
        DB[(Supabase)]
        REDIS[(Redis Cache)]
        GPT[GPT Endpoint]
    end

    subgraph "Validation Layer"
        VAL[β-Calibration]
        FEED[Feedback Loop]
    end

    MB --> HAL_SUP
    HAL --> HAL_SUP
    CR --> ORCH
    PV --> ORCH

    HAL_SUP --> ORCH
    ORCH --> QAI
    ORCH --> PIQR
    ORCH --> OCI
    ORCH --> ASR

    ORCH --> SK
    ORCH --> MS
    ASR --> AF

    ORCH --> GPT
    ORCH --> DB
    ORCH --> REDIS

    AF --> VAL
    VAL --> FEED
    FEED --> ORCH
```

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant HAL
    participant Orchestrator
    participant Agent
    participant AutoFix
    participant Validation

    User->>HAL: Query/Command
    HAL->>Orchestrator: Parse Intent
    Orchestrator->>Orchestrator: Compute QAI/PIQR/OCI
    Orchestrator->>Agent: Route to Agent
    Agent->>AutoFix: Generate Fix
    AutoFix->>Validation: Execute & Validate
    Validation->>Orchestrator: Feedback Loop
    Orchestrator->>HAL: Results
    HAL->>User: Response + Mission Card
```

## Agent Hierarchy

```mermaid
graph TD
    HAL[HAL - Supervisor]
    
    HAL --> ORCH[Orchestrator 3.0]
    
    ORCH --> QAI[QAI Calculator]
    ORCH --> PIQR[PIQR Analyzer]
    ORCH --> OCI[OCI Calculator]
    ORCH --> ASR[ASR Generator]
    
    HAL --> SK[Schema King]
    HAL --> MS[Mystery Shop]
    
    ASR --> AF[Auto-Fix Engine]
    AF --> VAL[Validation Layer]
    VAL --> ORCH
```

## Repository Structure

```mermaid
graph LR
    ROOT[dealershipai-monorepo]
    
    ROOT --> APPS[apps/]
    ROOT --> PKGS[packages/]
    ROOT --> DOCS[docs/]
    
    APPS --> WEB[web/]
    APPS --> DASH[dashboard/]
    APPS --> ADMIN[admin/]
    
    WEB --> MARKET[marketing/]
    WEB --> CALC[calculators/]
    
    DASH --> AUTH[auth/]
    DASH --> ONBOARD[onboarding/]
    DASH --> API[api/]
    
    PKGS --> SHARED[shared/]
    PKGS --> ORCH_PKG[orchestrator/]
    PKGS --> AGENTS_PKG[agents/]
    PKGS --> UI_PKG[ui/]
```

## Memory Architecture

```mermaid
graph TB
    SESSION[Per-Session<br/>Volatile]
    DEALER[Per-Dealer<br/>30-day retention]
    GLOBAL[Global Anonymized<br/>90-day rolling]
    
    SESSION --> REACT[React State]
    SESSION --> CACHE[In-Memory Cache]
    
    DEALER --> SUPABASE[(Supabase JSONB)]
    
    GLOBAL --> PATTERNS[Pattern Database]
    GLOBAL --> RETRAIN[Model Retraining]
    
    PATTERNS --> GDPR[GDPR Compliant]
```

## Execution Flow

```mermaid
flowchart TD
    START[User Action] --> CHECK{Guardrail Check}
    
    CHECK -->|Low Risk<br/>< $500, ≥85%| AUTO[Auto-Deploy]
    CHECK -->|Medium Risk<br/>$500-$2K, 70-84%| PREVIEW[Preview Mode]
    CHECK -->|High Risk<br/>> $2K, <70%| MANUAL[Manual Review]
    
    AUTO --> NOTIFY[Send Notification]
    PREVIEW --> APPROVE{User Approves?}
    MANUAL --> REVIEW[Admin Review]
    
    APPROVE -->|Yes| EXECUTE[Execute Fix]
    APPROVE -->|No| CANCEL[Cancel]
    
    REVIEW -->|Approved| EXECUTE
    REVIEW -->|Rejected| CANCEL
    
    EXECUTE --> VALIDATE[Validate Results]
    VALIDATE --> FEEDBACK[β-Calibration Feedback]
    FEEDBACK --> UPDATE[Update Models]
```

## API Endpoint Map

```mermaid
graph LR
    API[API Routes]
    
    API --> ORCH_API[/api/orchestrator]
    API --> AUTOFIX[/api/ai/autofix]
    API --> ASR_API[/api/ai/asr]
    API --> SK_API[/api/agents/schema-king]
    API --> MS_API[/api/agents/mystery-shop]
    API --> SCORES[/api/ai-scores]
    API --> INTEL[/api/competitive-intel]
    API --> PRIORITIES[/api/priorities]
    API --> INTEGRATIONS[/api/integrations]
    
    ORCH_API --> ORCH[Orchestrator 3.0]
    AUTOFIX --> AF[Auto-Fix Engine]
    ASR_API --> ASR[ASR Generator]
    SK_API --> SK[Schema King]
    MS_API --> MS[Mystery Shop]
```

## Pricing & Metering

```mermaid
graph TB
    TIER[Pricing Tiers]
    
    TIER --> TEST[Test Drive<br/>Free, 5 ASR/month]
    TIER --> INTEL[Intelligence<br/>$299/mo, 50 ASR/month]
    TIER --> BOSS[Boss Mode<br/>$999/mo, Unlimited]
    
    TEST --> METER[Usage Metering]
    INTEL --> METER
    BOSS --> METER
    
    METER --> TRACK[Track in orchestrator_usage]
    METER --> OVERAGE[Overage: $0.50/ASR]
    
    OVERAGE --> FUTURE[Future API Product<br/>$99/mo, 10 ASR]
```

---

*These diagrams visualize the complete Cognitive Ops Platform architecture as defined in the Master Blueprint v1.*

