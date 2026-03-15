import { NewsletterBuilder } from "@/components/newsletter-builder";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 lg:px-10">
      <section className="mb-10 rounded-[36px] border border-slate-200 bg-white/80 px-8 py-8 shadow-[0_24px_80px_rgba(16,35,61,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Chamber Events Newsletter</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Deterministic chamber event newsletters, ready for review and PDF export.
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600 md:text-base">
            Choose a chamber, process its public events page through a deterministic adapter pipeline, and generate a polished government-style newsletter preview with chamber branding.
          </p>
        </div>
      </section>

      <NewsletterBuilder />
    </main>
  );
}
