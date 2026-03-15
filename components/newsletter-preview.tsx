import { NewsletterPreviewRenderer } from "@/lib/newsletter/preview-renderer";
import type { NewsletterPreviewResponse } from "@/lib/utils/validation";

interface NewsletterPreviewProps {
  preview: NewsletterPreviewResponse;
  isDownloading: boolean;
  onDownload: () => void;
}

export function NewsletterPreview({ preview, isDownloading, onDownload }: NewsletterPreviewProps) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">Preview ready</p>
          <p className="text-sm text-slate-600">
            {preview.events.length} upcoming event{preview.events.length === 1 ? "" : "s"} · Cache {preview.cache.hit ? "hit" : "refreshed"}
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isDownloading}
          onClick={onDownload}
          type="button"
        >
          {isDownloading ? "Preparing PDF..." : "Download PDF"}
        </button>
      </div>

      <NewsletterPreviewRenderer viewModel={preview.viewModel} />
    </section>
  );
}
