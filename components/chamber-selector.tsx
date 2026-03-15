"use client";

import { useMemo, useState } from "react";

import type { Chamber } from "@/lib/utils/validation";

interface ChamberSelectorProps {
  chambers: Chamber[];
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AZ: "Arizona", CA: "California", CO: "Colorado",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", IA: "Iowa",
  IL: "Illinois", IN: "Indiana", KS: "Kansas", LA: "Louisiana",
  MD: "Maryland", MI: "Michigan", MO: "Missouri", NC: "North Carolina",
  NE: "Nebraska", NM: "New Mexico", NY: "New York", OH: "Ohio",
  OK: "Oklahoma", SC: "South Carolina", TN: "Tennessee",
  TX: "Texas", UT: "Utah", WA: "Washington", WI: "Wisconsin"
};

function stateLabel(code: string): string {
  return STATE_NAMES[code] ?? code;
}

export function ChamberSelector({ chambers, value, disabled, onChange }: ChamberSelectorProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return chambers;
    return chambers.filter((c) => {
      const meta = c.metadata as Record<string, unknown>;
      const state = typeof meta.state === "string" ? meta.state : "";
      const region = typeof meta.region === "string" ? meta.region : "";
      return (
        c.name.toLowerCase().includes(q) ||
        region.toLowerCase().includes(q) ||
        state.toLowerCase().includes(q) ||
        stateLabel(state).toLowerCase().includes(q)
      );
    });
  }, [chambers, search]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Chamber[]>();
    for (const c of filtered) {
      const meta = c.metadata as Record<string, unknown>;
      const state = typeof meta.state === "string" ? meta.state : "Other";
      const existing = groups.get(state) ?? [];
      existing.push(c);
      groups.set(state, existing);
    }
    return [...groups.entries()].sort((a, b) => stateLabel(a[0]).localeCompare(stateLabel(b[0])));
  }, [filtered]);

  const selectedChamber = chambers.find((c) => c.id === value);

  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold text-slate-800">Choose a Chamber</span>
      <input
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        disabled={disabled}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by city, state, or chamber name..."
        type="text"
        value={search}
      />
      <select
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        size={Math.min(12, Math.max(6, filtered.length + grouped.length))}
        value={value}
      >
        {grouped.map(([state, items]) => (
          <optgroup key={state} label={`${stateLabel(state)} (${state})`}>
            {items.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {selectedChamber && (
        <p className="text-xs text-slate-500">
          Selected: <span className="font-medium text-slate-700">{selectedChamber.name}</span>
        </p>
      )}
    </div>
  );
}
