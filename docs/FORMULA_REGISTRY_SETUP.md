# Formula Registry Setup

## Installation

The Formula Registry uses YAML parsing. Install the required dependency:

```bash
npm install js-yaml
npm install -D @types/js-yaml
```

## File Structure

```
configs/
  formulas/
    registry.yaml    # Main registry file
```

## Usage

The registry is automatically loaded by:
- `lib/formulas/registry.ts` - Registry loader
- `lib/adapters/visibility.ts` - Uses thresholds for pulse generation
- `components/visibility/AIVStrip.tsx` - Uses thresholds for color coding
- `components/visibility/AIVCompositeChip.tsx` - Uses weights for score calculation

## Default Values

If the registry file cannot be loaded, the system falls back to these defaults:

**Thresholds:**
- ChatGPT: warn 80%, critical 70%
- Perplexity: warn 75%, critical 65%
- Gemini: warn 75%, critical 70%
- Copilot: warn 72%, critical 65%

**Weights:**
- ChatGPT: 0.35
- Perplexity: 0.25
- Gemini: 0.25
- Copilot: 0.15

## Tenant Overrides

Tenants can override thresholds via:
- `POST /api/admin/integrations/visibility-thresholds`
- Stored in `integrations.metadata.visibility_thresholds`

The presence API merges tenant overrides with registry defaults.

