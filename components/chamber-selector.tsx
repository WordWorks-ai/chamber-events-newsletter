"use client";

import type { Chamber } from "@/lib/utils/validation";

interface ChamberSelectorProps {
  chambers: Chamber[];
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function ChamberSelector({ chambers, value, disabled, onChange }: ChamberSelectorProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-800">Choose a Chamber</span>
      <select
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">Select a chamber</option>
        {chambers.map((chamber) => (
          <option key={chamber.id} value={chamber.id}>
            {chamber.name}
          </option>
        ))}
      </select>
    </label>
  );
}
