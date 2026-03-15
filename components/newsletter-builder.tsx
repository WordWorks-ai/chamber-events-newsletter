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
    <div className="grid gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">
      <section className="space-y-5 rounded-[32px] border border-indigo-100 bg-gradient-to-b from-white via-white to-indigo-50/30 p-6 shadow-[0_20px_70px_rgba(16,35,61,0.08)] backdrop-blur">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-500">Workflow</p>
          <h2 className="text-2xl font-semibold text-slate-950">Build a newsletter</h2>
          <p className="text-sm leading-6 text-slate-600">
            Select a chamber, optionally customize the title, then generate a preview and downloadable PDF.
          </p>
        </div>

        <ChamberSelector chambers={chambers} disabled={loading} onChange={setSelectedChamberId} value={selectedChamberId} />

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800">Custom Title</span>
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            onChange={(event) => setCustomTitle(event.target.value)}
            placeholder="Optional newsletter title override"
            value={customTitle}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800">Intro Line</span>
          <textarea
            className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            onChange={(event) => setIntroLine(event.target.value)}
            placeholder="Optional short intro line for the newsletter header"
            value={introLine}
          />
        </label>

        <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Force Refresh</p>
            <p className="text-xs leading-5 text-slate-500">Bypass the 6-hour scrape cache.</p>
          </div>
          <input
            checked={forceRefresh}
            className="h-5 w-5 rounded border-slate-300 accent-indigo-600 focus:ring-indigo-400"
            onChange={(event) => setForceRefresh(event.target.checked)}
            type="checkbox"
          />
        </label>

        <UploadGraphic onChange={setUploadedGraphic} value={uploadedGraphic} />

        <button
          className="inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          disabled={loading || !selectedChamberId}
          onClick={() => void processNewsletter()}
          type="button"
        >
          {loading ? "Processing..." : "Process Newsletter"}
        </button>

        {error ? <ErrorAlert message={error} onRetry={selectedChamberId ? () => void processNewsletter() : undefined} /> : null}
      </section>

      <section className="space-y-5">
        <div className="rounded-[32px] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/20 to-sky-50/20 p-6 shadow-[0_24px_80px_rgba(16,35,61,0.08)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-500">Preview</p>
              <h2 className="text-2xl font-semibold text-slate-950">
                {selectedChamber ? `${selectedChamber.name}` : "Newsletter preview"}
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-600">
              What you see here closely matches the exported PDF.
            </p>
          </div>
        </div>

        {loading ? <LoadingState /> : preview ? <NewsletterPreview isDownloading={downloading} onDownload={() => void downloadPdf()} preview={preview} /> : (
          <div className="rounded-[28px] border border-dashed border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30 px-8 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-2xl text-indigo-500">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">No preview yet</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
              Choose a chamber and click Process Newsletter to generate the preview.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
