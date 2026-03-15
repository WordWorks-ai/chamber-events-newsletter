"use client";

import { useId, useState } from "react";

import { validateUploadedGraphic, type UploadedGraphic } from "@/lib/utils/validation";

interface UploadGraphicProps {
  value: UploadedGraphic | null;
  onChange: (value: UploadedGraphic | null) => void;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read file as a data URL."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}

export function UploadGraphic({ value, onChange }: UploadGraphicProps) {
  const inputId = useId();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">Optional Symbol / Graphic</p>
          <p className="text-xs leading-5 text-slate-500">Small PNG, JPEG, WebP, or SVG. Kept in-session only.</p>
        </div>
        {value ? (
          <button
            className="text-xs font-semibold text-slate-600 underline-offset-4 hover:underline"
            onClick={() => {
              onChange(null);
              setError(null);
            }}
            type="button"
          >
            Remove
          </button>
        ) : null}
      </div>

      <label
        className="flex cursor-pointer items-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-slate-400 hover:bg-slate-100"
        htmlFor={inputId}
      >
        {value ? (
          <img alt={value.fileName} className="h-12 w-12 rounded-xl border border-slate-200 bg-white object-contain p-1" src={value.dataUrl} />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
            +
          </div>
        )}

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{value ? value.fileName : "Upload a small graphic"}</p>
            <p className="text-xs text-slate-500">
              {value ? `${Math.max(1, Math.round(value.sizeBytes / 1024))} KB` : "Used in the header and PDF download"}
            </p>
          </div>
        </label>

      <input
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="sr-only"
        id={inputId}
        onChange={async (event) => {
          const input = event.currentTarget;
          const file = event.currentTarget.files?.[0];
          if (!file) {
            return;
          }

          try {
            const dataUrl = await fileToDataUrl(file);
            const graphic = validateUploadedGraphic({
              fileName: file.name,
              mimeType: file.type as UploadedGraphic["mimeType"],
              dataUrl,
              sizeBytes: file.size
            });
            onChange(graphic);
            setError(null);
          } catch {
            onChange(null);
            setError("That file could not be used. Please choose a small PNG, JPEG, WebP, or SVG image.");
          } finally {
            input.value = "";
          }
        }}
        type="file"
      />

      {error ? <p className="text-xs font-medium text-rose-700">{error}</p> : null}
    </div>
  );
}
