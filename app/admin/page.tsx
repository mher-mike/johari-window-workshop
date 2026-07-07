"use client";

import { useEffect, useState } from "react";
import type { CompletionRow, ParticipantResult } from "@/lib/types";

type AdminData = {
  session: { id: string; title: string; status: "active" | "closed" };
  completion: CompletionRow[];
  completeCount: number;
  results: ParticipantResult[];
};

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/results", { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error || "Could not load admin data.");
      setLoading(false);
      return;
    }
    setData(body);
    setLoading(false);
  }

  async function setSessionStatus(status: "active" | "closed") {
    setError("");
    const response = await fetch("/api/results", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      const body = await response.json();
      setError(body.error || "Could not update session.");
      return;
    }
    await load();
  }

  async function resetWorkshop() {
    const confirmed = window.confirm(
      "Reset all workshop responses? This clears submitted answers for this session and reopens it."
    );
    if (!confirmed) return;

    setResetting(true);
    setError("");
    const response = await fetch("/api/results", { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json();
      setError(body.error || "Could not reset workshop.");
      setResetting(false);
      return;
    }

    setShowResults(false);
    await load();
    setResetting(false);
  }

  function exportPdf() {
    setShowResults(true);
    window.setTimeout(() => window.print(), 100);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[760px] px-5 py-10 sm:py-14">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-sky-700">Admin</p>
            <h1 className="text-3xl font-semibold text-neutral-950">Johari Window Results</h1>
            <p className="text-neutral-600">Aggregated patterns only. Individual peer responses are private.</p>
          </div>
          <button
            type="button"
            onClick={load}
            className="no-print rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-medium transition duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
          >
            Refresh
          </button>
        </div>

        {loading ? <p className="text-neutral-500">Loading workshop status...</p> : null}
        {error ? <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

        {data ? (
          <div className="space-y-6">
            <section className="glass-panel print-card rounded-2xl border border-white/70 p-4 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-neutral-500">Session status</p>
                  <p className="mt-1 text-xl font-semibold capitalize text-neutral-950">{data.session.status}</p>
                  <p className="mt-1 text-sm text-neutral-600">{data.completeCount} of 7 participants complete</p>
                </div>
                <div className="no-print flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResults(true)}
                    className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white shadow-button transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0"
                  >
                    Calculate/view results
                  </button>
                  <button
                    type="button"
                    onClick={exportPdf}
                    className="rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800 transition duration-200 hover:-translate-y-0.5 hover:bg-sky-100 active:translate-y-0"
                  >
                    Export PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionStatus(data.session.status === "closed" ? "active" : "closed")}
                    className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-medium transition duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                  >
                    {data.session.status === "closed" ? "Reopen session" : "Close session"}
                  </button>
                  <button
                    type="button"
                    onClick={resetWorkshop}
                    disabled={resetting}
                    className="rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition duration-200 hover:-translate-y-0.5 hover:bg-red-100 active:translate-y-0 disabled:translate-y-0 disabled:opacity-60"
                  >
                    {resetting ? "Resetting..." : "Reset results"}
                  </button>
                </div>
              </div>
            </section>

            <section className="print-card space-y-3">
              <h2 className="text-lg font-semibold text-neutral-950">Participant completion</h2>
              <div className="glass-panel divide-y divide-line rounded-2xl border border-white/70 shadow-soft">
                {data.completion.map((row) => (
                  <div key={row.participantId} className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="font-medium text-neutral-950">{row.name}</p>
                      <p className="text-sm text-neutral-500">
                        {row.selfCount} self picks, {row.peerTargetsComplete} of 6 teammates, {row.totalCount} / 100 total
                      </p>
                    </div>
                    <span
                      className={[
                        "rounded-full border px-2.5 py-1 text-xs font-medium",
                        row.complete
                          ? "border-emerald-200 bg-emerald-600 text-white"
                          : "border-white/70 bg-white/70 text-neutral-600"
                      ].join(" ")}
                    >
                      {row.complete ? "Complete" : "Incomplete"}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {showResults ? (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-neutral-950">Results</h2>
                {data.results.map((result) => (
                  <article
                    key={result.participantId}
                    className="glass-panel print-card rounded-2xl border border-white/70 p-5 shadow-soft"
                  >
                    <h3 className="text-2xl font-semibold text-neutral-950">{result.name}</h3>
                    <div className="mt-5 grid gap-5">
                      <ResultArea title="Open Area" traits={result.open} />
                      <ResultArea title="Blind Spot" traits={result.blind} />
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-neutral-900">Unknown Area</h4>
                        <p className="text-sm text-neutral-600">
                          Unknown traits: {result.unknownCount} adjectives not selected.
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}

function ResultArea({ title, traits }: { title: string; traits: ParticipantResult["open"] }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-neutral-900">{title}</h4>
      {traits.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {traits.map((trait) => (
            <span
              key={trait.adjectiveId}
              className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-sm text-sky-900"
            >
              {trait.label} · {trait.votes} / 6
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-500">No adjectives selected by peers in this area yet.</p>
      )}
    </div>
  );
}
