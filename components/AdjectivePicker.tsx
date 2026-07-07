"use client";

import { ADJECTIVES } from "@/lib/constants";

type Props = {
  selected: string[];
  required: number;
  search: string;
  onSearchChange: (value: string) => void;
  onToggle: (id: string) => void;
};

export function AdjectivePicker({ selected, required, search, onSearchChange, onToggle }: Props) {
  const selectedSet = new Set(selected);
  const normalizedSearch = search.trim().toLocaleLowerCase("hy");
  const visible = ADJECTIVES.filter((adjective) =>
    adjective.label.toLocaleLowerCase("hy").includes(normalizedSearch)
  );
  const selectedLabels = ADJECTIVES.filter((adjective) => selectedSet.has(adjective.id)).map(
    (adjective) => adjective.label
  );

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-10 -mx-1 bg-[#f7f7f5]/85 px-1 pb-3 pt-1 backdrop-blur-xl">
        <label className="block text-sm font-medium text-neutral-700" htmlFor="adjective-search">
          Search adjectives
        </label>
        <input
          id="adjective-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Type to filter"
          className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm shadow-soft outline-none transition duration-200 focus:border-sky-200 focus:bg-white focus:ring-4 focus:ring-sky-100"
        />
      </div>

      {selectedLabels.length > 0 ? (
        <div className="glass-panel rounded-2xl border border-white/70 p-3 shadow-soft">
          <p className="mb-2 text-xs font-medium uppercase text-neutral-500">{selected.length} selected</p>
          <div className="flex flex-wrap gap-2">
            {selectedLabels.map((label) => (
              <span key={label} className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-sm text-sky-900">
                {label}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {visible.map((adjective) => {
          const isActive = selectedSet.has(adjective.id);
          const isDisabled = !isActive && selected.length >= required;

          return (
            <button
              key={adjective.id}
              type="button"
              aria-pressed={isActive}
              disabled={isDisabled}
              onClick={() => onToggle(adjective.id)}
              className={[
                "min-h-11 rounded-2xl border px-3 py-2 text-left text-sm shadow-sm transition duration-200 active:scale-[0.99]",
                isActive
                  ? "border-sky-200 bg-sky-600 text-white shadow-button"
                  : "border-white/70 bg-white/[0.82] text-neutral-800 hover:-translate-y-0.5 hover:border-sky-100 hover:bg-white",
                isDisabled ? "opacity-45" : ""
              ].join(" ")}
            >
              {adjective.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-white/70 p-6 text-center text-sm text-neutral-500 shadow-soft">
          No adjectives match this search.
        </div>
      ) : null}
    </div>
  );
}
