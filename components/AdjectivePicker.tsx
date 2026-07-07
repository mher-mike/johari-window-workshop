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
      <div className="sticky top-0 z-10 -mx-1 bg-white/95 px-1 pb-3 pt-1 backdrop-blur">
        <label className="block text-sm font-medium text-neutral-700" htmlFor="adjective-search">
          Search adjectives
        </label>
        <input
          id="adjective-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Type to filter"
          className="mt-2 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
        />
      </div>

      {selectedLabels.length > 0 ? (
        <div className="rounded-md border border-line bg-panel p-3">
          <p className="mb-2 text-xs font-medium uppercase text-neutral-500">{selected.length} selected</p>
          <div className="flex flex-wrap gap-2">
            {selectedLabels.map((label) => (
              <span key={label} className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-sm">
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
                "min-h-11 rounded-md border px-3 py-2 text-left text-sm transition",
                isActive
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-line bg-white text-neutral-800 hover:border-neutral-400",
                isDisabled ? "opacity-45" : ""
              ].join(" ")}
            >
              {adjective.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-md border border-line bg-panel p-6 text-center text-sm text-neutral-500">
          No adjectives match this search.
        </div>
      ) : null}
    </div>
  );
}
