"use client";

import { useEffect, useMemo, useState } from "react";
import { AdjectivePicker } from "@/components/AdjectivePicker";
import { BottomBar } from "@/components/BottomBar";
import { PARTICIPANTS, REQUIRED_PEER_COUNT, REQUIRED_SELF_COUNT, SESSION_ID } from "@/lib/constants";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Draft } from "@/lib/types";

const STORAGE_KEY = "johari-workshop-draft-v1";

const emptyDraft: Draft = {
  participantId: null,
  self: [],
  peers: {},
  step: "landing",
  peerIndex: 0
};

function uniqueToggle(values: string[], id: string, limit: number) {
  if (values.includes(id)) return values.filter((value) => value !== id);
  if (values.length >= limit) return values;
  return [...values, id];
}

export default function Home() {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [search, setSearch] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "error">("idle");
  const [checkingParticipantId, setCheckingParticipantId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<"active" | "closed" | "unknown">("unknown");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setDraft({ ...emptyDraft, ...JSON.parse(saved) });
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase
      .from("sessions")
      .select("status")
      .eq("id", SESSION_ID)
      .single()
      .then(({ data }) => {
        if (data?.status === "active" || data?.status === "closed") {
          setSessionStatus(data.status);
        }
      });
  }, []);

  const participant = PARTICIPANTS.find((item) => item.id === draft.participantId) || null;
  const peerTargets = useMemo(
    () => PARTICIPANTS.filter((item) => item.id !== draft.participantId),
    [draft.participantId]
  );
  const currentPeer = peerTargets[draft.peerIndex] || null;
  const currentPeerPicks = currentPeer ? draft.peers[currentPeer.id] || [] : [];
  const completedPeerTargets = peerTargets.filter((item) => (draft.peers[item.id] || []).length === REQUIRED_PEER_COUNT)
    .length;

  function updateDraft(next: Partial<Draft>) {
    setError("");
    setSearch("");
    setDraft((current) => ({ ...current, ...next }));
  }

  async function selectParticipant(participantId: string) {
    setCheckingParticipantId(participantId);
    setError("");

    try {
      const response = await fetch(`/api/submissions/status?respondentId=${participantId}`, { cache: "no-store" });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || "Could not check this participant.");
      }

      if (body.sessionStatus === "closed") {
        setError("This workshop session is closed.");
        return;
      }

      if (body.submitted) {
        window.localStorage.removeItem(STORAGE_KEY);
        setDraft({ ...emptyDraft, participantId, step: "alreadySubmitted" });
        return;
      }

      updateDraft({
        participantId,
        self: [],
        peers: {},
        peerIndex: 0,
        step: "self"
      });
    } catch (statusError) {
      const message = statusError instanceof Error ? statusError.message : "Could not check this participant.";
      setError(message);
    } finally {
      setCheckingParticipantId(null);
    }
  }

  async function submit() {
    if (!draft.participantId) return;
    setSubmitState("submitting");
    setError("");

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        respondentId: draft.participantId,
        self: draft.self,
        peers: draft.peers
      })
    });

    const body = await response.json();
    if (!response.ok) {
      setSubmitState("error");
      setError(body.error || "Could not submit responses.");
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    setSubmitState("idle");
    setDraft({ ...emptyDraft, participantId: draft.participantId, step: "done" });
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[760px] px-5 py-10 sm:py-14">
        {draft.step === "landing" ? (
          <section className="soft-enter space-y-7">
            <div className="space-y-3">
              <p className="text-sm font-medium text-sky-700">Team exercise</p>
              <h1 className="text-4xl font-semibold tracking-normal text-neutral-950 sm:text-5xl">
                Johari Window Workshop
              </h1>
              <p className="max-w-2xl text-base leading-7 text-neutral-600">
                Choose the words that describe how you see yourself and how you see your teammates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateDraft({ step: "identity" })}
              className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white shadow-button transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0"
            >
              Start
            </button>
          </section>
        ) : null}

        {draft.step === "identity" ? (
          <section className="soft-enter space-y-7">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-neutral-950">Choose your name</h1>
              <p className="text-neutral-600">Select your own participant card to begin.</p>
              {sessionStatus === "closed" ? (
                <p className="rounded-xl border border-line bg-white/75 p-3 text-sm text-neutral-600 shadow-soft">
                  This workshop session is currently closed.
                </p>
              ) : null}
              {error ? (
                <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
              ) : null}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PARTICIPANTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectParticipant(item.id)}
                  disabled={checkingParticipantId !== null}
                  className="glass-panel rounded-2xl border border-white/70 px-4 py-5 text-left text-lg font-semibold shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-white hover:bg-white/90 active:translate-y-0 disabled:opacity-60"
                >
                  <span className={getParticipantTone(item.id)}>
                    {checkingParticipantId === item.id ? "Checking..." : item.name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {draft.step === "self" ? (
          <section className="soft-enter">
            <div className="mb-6 space-y-2">
              <p className={["text-sm font-semibold", participant ? getParticipantTone(participant.id) : ""].join(" ")}>
                {participant?.name}
              </p>
              <h1 className="text-3xl font-semibold text-neutral-950">Pick 10 adjectives that describe you.</h1>
              <p className="text-neutral-600">You can deselect a word by selecting it again.</p>
            </div>
            <AdjectivePicker
              selected={draft.self}
              required={REQUIRED_SELF_COUNT}
              search={search}
              onSearchChange={setSearch}
              onToggle={(id) => setDraft((current) => ({ ...current, self: uniqueToggle(current.self, id, REQUIRED_SELF_COUNT) }))}
            />
            <BottomBar
              count={`${draft.self.length} / ${REQUIRED_SELF_COUNT} selected`}
              message={draft.self.length === REQUIRED_SELF_COUNT ? "Ready for teammate picks." : "Pick exactly 10 to continue."}
              actionLabel="Continue"
              disabled={draft.self.length !== REQUIRED_SELF_COUNT}
              onBack={() => updateDraft({ step: "identity" })}
              onAction={() => updateDraft({ step: "peer", peerIndex: 0 })}
            />
          </section>
        ) : null}

        {draft.step === "peer" && currentPeer ? (
          <section className="soft-enter">
            <div className="mb-6 space-y-2">
              <p className="text-sm font-medium text-neutral-500">
                {draft.peerIndex + 1} of {peerTargets.length} teammates
              </p>
              <h1 className="text-3xl font-semibold text-neutral-950">
                Pick 15 adjectives that describe{" "}
                <span className={getParticipantTone(currentPeer.id)}>{currentPeer.name}</span>
                .
              </h1>
            </div>
            <AdjectivePicker
              selected={currentPeerPicks}
              required={REQUIRED_PEER_COUNT}
              search={search}
              onSearchChange={setSearch}
              onToggle={(id) =>
                setDraft((current) => ({
                  ...current,
                  peers: {
                    ...current.peers,
                    [currentPeer.id]: uniqueToggle(current.peers[currentPeer.id] || [], id, REQUIRED_PEER_COUNT)
                  }
                }))
              }
            />
            <BottomBar
              count={`${currentPeerPicks.length} / ${REQUIRED_PEER_COUNT} selected`}
              message={`${completedPeerTargets} of ${peerTargets.length} teammates completed`}
              actionLabel={draft.peerIndex === peerTargets.length - 1 ? "Review" : "Next teammate"}
              disabled={currentPeerPicks.length !== REQUIRED_PEER_COUNT}
              onBack={() =>
                updateDraft(
                  draft.peerIndex === 0 ? { step: "self" } : { peerIndex: Math.max(0, draft.peerIndex - 1) }
                )
              }
              onAction={() =>
                updateDraft(
                  draft.peerIndex === peerTargets.length - 1
                    ? { step: "review" }
                    : { peerIndex: draft.peerIndex + 1 }
                )
              }
            />
          </section>
        ) : null}

        {draft.step === "review" ? (
          <section className="soft-enter space-y-6">
            <div className="space-y-2">
              <p className={["text-sm font-semibold", participant ? getParticipantTone(participant.id) : ""].join(" ")}>
                {participant?.name}
              </p>
              <h1 className="text-3xl font-semibold text-neutral-950">Review your responses</h1>
              <p className="text-neutral-600">Only aggregated results will be shown after the workshop.</p>
            </div>
            <div className="glass-panel space-y-3 rounded-2xl border border-white/70 p-4 shadow-soft">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="text-neutral-600">Self-picks</span>
                <strong>{draft.self.length} selected</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Peer-picks</span>
                <strong>{completedPeerTargets} teammates completed</strong>
              </div>
            </div>
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            ) : null}
            <BottomBar
              message="Submissions cannot be edited after sending."
              actionLabel={submitState === "submitting" ? "Submitting..." : "Submit responses"}
              disabled={submitState === "submitting"}
              onBack={() => updateDraft({ step: "peer", peerIndex: peerTargets.length - 1 })}
              onAction={submit}
            />
          </section>
        ) : null}

        {draft.step === "done" ? (
          <section className="soft-enter glass-panel space-y-4 rounded-2xl border border-white/70 p-6 shadow-soft">
            <p className="text-sm font-medium text-neutral-500">Submitted</p>
            <h1 className="text-3xl font-semibold text-neutral-950">Your responses were submitted.</h1>
            <p className="text-neutral-600">Results will be available after everyone completes the workshop.</p>
          </section>
        ) : null}

        {draft.step === "alreadySubmitted" ? (
          <section className="soft-enter glass-panel space-y-4 rounded-2xl border border-white/70 p-6 shadow-soft">
            <p className={["text-sm font-semibold", participant ? getParticipantTone(participant.id) : ""].join(" ")}>
              {participant?.name}
            </p>
            <h1 className="text-3xl font-semibold text-neutral-950">You have already submitted your responses.</h1>
            <p className="text-neutral-600">Results will be available after everyone completes the workshop.</p>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function getParticipantTone(participantId: string) {
  const tones: Record<string, string> = {
    ast: "text-blue-700",
    mike: "text-emerald-700",
    armen: "text-amber-700",
    sargis: "text-rose-700",
    krist: "text-violet-700",
    shushan: "text-cyan-700",
    ani: "text-stone-700"
  };

  return tones[participantId] || "text-neutral-900";
}
