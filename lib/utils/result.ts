export interface AppError {
  code: string;
  message: string;
  status: number;
  details?: unknown;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: AppError };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function fail(code: string, message: string, status = 500, details?: unknown): Result<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      status,
      details
    }
  };
}
