"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

type DocsPayload = { overview: string; sequenceMermaid: string; exampleSdkJson: any };

function useDocs() {
  const [data, setData] = React.useState<DocsPayload | null>(null);
  const [loading, setLoading] = React.useState(false);
  const load = React.useCallback(async () => {
    if (data || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/docs/orchestrator");
      setData(await res.json());
    } catch {
      setData({ overview: "error", sequenceMermaid: "error", exampleSdkJson: { error: true } });
    } finally {
      setLoading(false);
    }
  }, [data, loading]);
  return { data, loading, load };
}

function Copy({ getText, label = "Copy" }: { getText: () => string; label?: string }) {
  const [ok, setOk] = React.useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(getText());
          setOk(true);
          setTimeout(() => setOk(false), 1200);
        } catch {
          // fallback
          const ta = document.createElement("textarea");
          ta.value = getText();
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          setOk(true);
          setTimeout(() => setOk(false), 1200);
        }
      }}
    >
      {ok ? "Copied" : label}
    </Button>
  );
}

export function OrchestratorDocsModal({ trigger }: { trigger?: React.ReactNode }) {
  const { data, loading, load } = useDocs();

  return (
    <Dialog onOpenChange={(open) => open && load()}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="secondary">Open Orchestrator Docs</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>🚗 Appraise Orchestrator — Docs</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <div className="flex items-center justify-between mb-2">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="mermaid">Mermaid</TabsTrigger>
              <TabsTrigger value="json">SDK JSON</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Copy label="Copy Tab" getText={() => {
                if (!data) return "";
                const el = document.querySelector<HTMLElement>('[data-copy-current="1"]');
                return el?.innerText ?? "";
              }} />
              <Copy label="Copy All" getText={() => JSON.stringify(data ?? {}, null, 2)} />
            </div>
          </div>

          <TabsContent value="overview" className="space-y-2">
            {loading ? (
              <div className="text-sm opacity-70">Loading…</div>
            ) : (
              <pre
                data-copy-current="1"
                className="rounded-xl bg-neutral-900 text-neutral-50 text-xs p-3 whitespace-pre-wrap overflow-auto"
              >
                {data?.overview ?? "—"}
              </pre>
            )}
          </TabsContent>

          <TabsContent value="mermaid" className="space-y-2">
            <div className="text-xs opacity-70">Paste into ```mermaid fenced block.</div>
            {loading ? (
              <div className="text-sm opacity-70">Loading…</div>
            ) : (
              <pre
                data-copy-current="1"
                className="rounded-xl bg-neutral-900 text-neutral-50 text-xs p-3 whitespace-pre overflow-auto"
              >
                {data?.sequenceMermaid ?? "—"}
              </pre>
            )}
          </TabsContent>

          <TabsContent value="json" className="space-y-2">
            {loading ? (
              <div className="text-sm opacity-70">Loading…</div>
            ) : (
              <pre
                data-copy-current="1"
                className="rounded-xl bg-neutral-900 text-neutral-50 text-xs p-3 whitespace-pre overflow-auto"
              >
                {JSON.stringify(data?.exampleSdkJson ?? {}, null, 2)}
              </pre>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

