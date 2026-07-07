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

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-[760px] px-5 py-10 sm:py-14">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-500">Admin</p>
            <h1 className="text-3xl font-semibold text-neutral-950">Johari Window Results</h1>
            <p className="text-neutral-600">Aggregated patterns only. Individual peer responses are private.</p>
          </div>
          <button
            type="button"
            onClick={load}
            className="rounded-md border border-line bg-white px-4 py-2 text-sm font-medium transition hover:bg-neutral-50"
          >
            Refresh
          </button>
        </div>

        {loading ? <p className="text-neutral-500">Loading workshop status...</p> : null}
        {error ? <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

        {data ? (
          <div className="space-y-6">
            <section className="rounded-md border border-line bg-white p-4 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-neutral-500">Session status</p>
                  <p className="mt-1 text-xl font-semibold capitalize text-neutral-950">{data.session.status}</p>
                  <p className="mt-1 text-sm text-neutral-600">{data.completeCount} of 7 participants complete</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResults(true)}
                    className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
                  >
                    Calculate/view results
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionStatus(data.session.status === "closed" ? "active" : "closed")}
                    className="rounded-md border border-line bg-white px-4 py-2 text-sm font-medium transition hover:bg-neutral-50"
                  >
                    {data.session.status === "closed" ? "Reopen session" : "Close session"}
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-neutral-950">Participant completion</h2>
              <div className="divide-y divide-line rounded-md border border-line bg-white">
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
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-line bg-panel text-neutral-600"
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
                  <article key={result.participantId} className="rounded-md border border-line bg-white p-5">
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
            <span key={trait.adjectiveId} className="rounded-full border border-line bg-panel px-3 py-1.5 text-sm text-neutral-800">
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
