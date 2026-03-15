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
      <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">Preview ready</p>
          <p className="text-sm text-slate-600">
            {preview.events.length} upcoming event{preview.events.length === 1 ? "" : "s"} · Cache {preview.cache.hit ? "hit" : "refreshed"}
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
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
