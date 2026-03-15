interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">Something went wrong</p>
          <p className="mt-1 leading-6">{message}</p>
        </div>
        {onRetry ? (
          <button
            className="inline-flex items-center justify-center rounded-full border border-rose-300 px-4 py-2 text-sm font-medium text-rose-900 transition hover:bg-rose-100"
            onClick={onRetry}
            type="button"
          >
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}
