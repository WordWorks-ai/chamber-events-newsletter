export function LoadingState() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(16,35,61,0.08)]">
      <div className="animate-pulse space-y-6 p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-24 rounded-2xl bg-slate-200" />
            <div className="space-y-3">
              <div className="h-4 w-40 rounded-full bg-slate-200" />
              <div className="h-8 w-96 rounded-full bg-slate-200" />
              <div className="h-4 w-72 rounded-full bg-slate-200" />
            </div>
          </div>
          <div className="h-16 w-44 rounded-2xl bg-slate-200" />
        </div>
        <div className="space-y-4">
          <div className="h-4 w-48 rounded-full bg-slate-200" />
          <div className="h-44 rounded-3xl bg-slate-100" />
          <div className="h-44 rounded-3xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
