import { NewsletterBuilder } from "@/components/newsletter-builder";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 lg:px-10">
      <section className="mb-10 overflow-hidden rounded-[36px] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/40 to-sky-50/30 px-8 py-8 shadow-[0_24px_80px_rgba(16,35,61,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">Chamber Events Newsletter</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 bg-clip-text text-4xl font-semibold tracking-tight text-transparent md:text-5xl">
              Chamber event newsletters, ready for review and PDF export.
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600 md:text-base">
            Choose a chamber, scrape its public events page, and generate a polished newsletter preview with chamber branding — then download as PDF.
          </p>
        </div>
      </section>

      <NewsletterBuilder />
    </main>
  );
}
