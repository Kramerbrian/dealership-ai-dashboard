// Lightweight client for DealershipAI Orchestration API

export type PlatformScore = {
  platform: string;
  score: number;
  confidence: "LOW" | "MEDIUM" | "HIGH";
};

export type KpiScoreboard = {
  QAI_star: number;
  VAI_Penalized: number;
  PIQR: number;
  HRP: number;
  OCI: number;
};

export interface AIScores {
  timestamp: string;
  dealerId: string;
  model_version: string;
  kpi_scoreboard: KpiScoreboard;
  platform_breakdown: PlatformScore[];
  zero_click_inclusion_rate: number; // 0..1
  ugc_health_score: number; // 0..1
}

export interface PutOriginBody {
  origin: string;
  refresh?: boolean;
}

export interface SiteInjectBody {
  hosts: string[];
  head_html: string;
  footer_html?: string;
}

export class DealershipAI {
  constructor(
    private base = "https://api.dealershipai.com",
    private apiKey?: string
  ) {}

  private async req<T>(path: string, init?: RequestInit): Promise<T> {
    const r = await fetch(`${this.base}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(this.apiKey ? { "x-api-key": this.apiKey } : {}),
        ...(init?.headers || {}),
      },
      cache: "no-store",
    });

    if (!r.ok) {
      const errorText = await r.text();
      throw new Error(`${r.status} ${r.statusText}: ${errorText}`);
    }

    return (await r.json()) as T;
  }

  // 1) Scores
  getAIScores(domain: string) {
    return this.req<AIScores>(
      `/api/ai-scores?domain=${encodeURIComponent(domain)}`
    );
  }

  // 2) Refresh
  postRefresh(origin: string) {
    return this.req<{ job_id: string; status: string }>(`/api/refresh`, {
      method: "POST",
      body: JSON.stringify({ origin }),
    });
  }

  // 3) Origins
  getOrigins() {
    return this.req<
      { origin: string; dealerId: string; status: string }[]
    >(`/api/origins`);
  }

  putOrigin(body: PutOriginBody) {
    return this.req<{ dealerId: string; updated: boolean }>(`/api/origins`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  deleteOrigin(origin: string) {
    return this.req<{ deleted: boolean }>(
      `/api/origins?origin=${encodeURIComponent(origin)}`,
      {
        method: "DELETE",
      }
    );
  }

  // 4) Auto-fix injector (JSON-LD, head/footer HTML)
  postSiteInject(body: SiteInjectBody) {
    return this.req<{
      status: string;
      verification?: {
        rich_results_pass?: boolean;
        perplexity_check?: string;
      };
    }>(`/api/site-inject`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
}
