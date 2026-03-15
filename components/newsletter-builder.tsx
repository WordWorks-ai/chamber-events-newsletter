"use client";

import { startTransition, useEffect, useMemo, useState } from "react";

import { ChamberSelector } from "@/components/chamber-selector";
import { ErrorAlert } from "@/components/error-alert";
import { LoadingState } from "@/components/loading-state";
import { NewsletterPreview } from "@/components/newsletter-preview";
import { UploadGraphic } from "@/components/upload-graphic";
import type { Chamber, NewsletterPreviewResponse, UploadedGraphic } from "@/lib/utils/validation";

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export function NewsletterBuilder() {
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [selectedChamberId, setSelectedChamberId] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [introLine, setIntroLine] = useState("");
  const [forceRefresh, setForceRefresh] = useState(false);
  const [uploadedGraphic, setUploadedGraphic] = useState<UploadedGraphic | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<NewsletterPreviewResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/chambers");
        const data = await readJson<Chamber[]>(response);

        if (cancelled) {
          return;
        }

        setChambers(data);
        setSelectedChamberId((current) => current || data[0]?.id || "");
      } catch {
        if (!cancelled) {
          setError("The chamber list could not be loaded. Please refresh the page.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedChamber = useMemo(
    () => chambers.find((chamber) => chamber.id === selectedChamberId) ?? null,
    [chambers, selectedChamberId]
  );

  async function processNewsletter() {
    if (!selectedChamberId) {
      setError("Please select a chamber before processing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/newsletter/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chamberId: selectedChamberId,
          customTitle: customTitle || undefined,
          introLine: introLine || undefined,
          forceRefresh,
          uploadedGraphic
        })
      });

      if (!response.ok) {
        const payload = await readJson<{ error?: { message?: string } }>(response);
        throw new Error(payload.error?.message ?? "Unable to generate the newsletter preview.");
      }

      const payload = await readJson<NewsletterPreviewResponse>(response);
      startTransition(() => {
        setPreview(payload);
      });
    } catch (error) {
      setPreview(null);
      setError(error instanceof Error ? error.message : "Unable to generate the newsletter preview.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    if (!preview) {
      return;
    }

    setDownloading(true);
    setError(null);

    try {
      const response = await fetch("/api/newsletter/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mode: "viewModel",
          viewModel: preview.viewModel
        })
      });

      if (!response.ok) {
        const payload = await readJson<{ error?: { message?: string } }>(response);
        throw new Error(payload.error?.message ?? "Unable to generate the PDF.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${selectedChamber?.slug ?? "chamber"}-newsletter-${new Date().toISOString().slice(0, 10)}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to generate the PDF.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white/95 p-6 shadow-[0_20px_70px_rgba(16,35,61,0.08)] backdrop-blur">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Workflow</p>
          <h2 className="text-2xl font-semibold text-slate-950">Build a chamber newsletter in one pass</h2>
          <p className="text-sm leading-6 text-slate-600">
            Select a seeded chamber, optionally refine the title, then generate a clean newsletter preview and downloadable PDF.
          </p>
        </div>

        <ChamberSelector chambers={chambers} disabled={loading} onChange={setSelectedChamberId} value={selectedChamberId} />

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800">Custom Title</span>
          <input
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            onChange={(event) => setCustomTitle(event.target.value)}
            placeholder="Optional newsletter title override"
            value={customTitle}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800">Intro Line</span>
          <textarea
            className="min-h-28 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            onChange={(event) => setIntroLine(event.target.value)}
            placeholder="Optional short intro line for the newsletter header"
            value={introLine}
          />
        </label>

        <label className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">Force Refresh</p>
            <p className="text-xs leading-5 text-slate-500">Bypass the 6-hour scrape cache and fetch the chamber page again.</p>
          </div>
          <input
            checked={forceRefresh}
            className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
            onChange={(event) => setForceRefresh(event.target.checked)}
            type="checkbox"
          />
        </label>

        <UploadGraphic onChange={setUploadedGraphic} value={uploadedGraphic} />

        <button
          className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={loading || !selectedChamberId}
          onClick={() => void processNewsletter()}
          type="button"
        >
          {loading ? "Processing..." : "Process"}
        </button>

        {error ? <ErrorAlert message={error} onRetry={selectedChamberId ? () => void processNewsletter() : undefined} /> : null}
      </section>

      <section className="space-y-5">
        <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,247,250,0.96))] p-6 shadow-[0_24px_80px_rgba(16,35,61,0.08)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Preview</p>
              <h2 className="text-2xl font-semibold text-slate-950">
                {selectedChamber ? `${selectedChamber.name} newsletter` : "Generated newsletter preview"}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              The preview is rendered from the same normalized view model used for PDF generation, so what you review here closely matches the exported file.
            </p>
          </div>
        </div>

        {loading ? <LoadingState /> : preview ? <NewsletterPreview isDownloading={downloading} onDownload={() => void downloadPdf()} preview={preview} /> : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-8 py-16 text-center shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">No preview yet</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Choose a chamber and click Process to scrape the public events page, normalize the events, apply chamber branding, and build the downloadable newsletter.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
