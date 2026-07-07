import { NextResponse } from "next/server";
import { ADJECTIVES, PARTICIPANTS, REQUIRED_PEER_COUNT, REQUIRED_SELF_COUNT, SESSION_ID } from "@/lib/constants";
import { ensureWorkshopData } from "@/lib/supabase";
import type { SubmissionPayload } from "@/lib/types";

const participantIds = new Set<string>(PARTICIPANTS.map((participant) => participant.id));
const adjectiveIds = new Set<string>(ADJECTIVES.map((adjective) => adjective.id));

function unique(values: string[]) {
  return [...new Set(values)];
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SubmissionPayload;

    if (!participantIds.has(payload.respondentId)) {
      return NextResponse.json({ error: "Choose a valid participant." }, { status: 400 });
    }

    if (unique(payload.self).length !== REQUIRED_SELF_COUNT || payload.self.some((id) => !adjectiveIds.has(id))) {
      return NextResponse.json({ error: "Self-picks must contain exactly 10 adjectives." }, { status: 400 });
    }

    const peerTargets = PARTICIPANTS.filter((participant) => participant.id !== payload.respondentId);
    for (const target of peerTargets) {
      const picks = payload.peers[target.id] || [];
      if (unique(picks).length !== REQUIRED_PEER_COUNT || picks.some((id) => !adjectiveIds.has(id))) {
        return NextResponse.json({ error: `Peer-picks for ${target.name} must contain exactly 15 adjectives.` }, { status: 400 });
      }
    }

    const supabase = await ensureWorkshopData();
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("status")
      .eq("id", SESSION_ID)
      .single();

    if (sessionError) throw sessionError;
    if (session?.status === "closed") {
      return NextResponse.json({ error: "This workshop session is closed." }, { status: 409 });
    }

    const { count, error: countError } = await supabase
      .from("responses")
      .select("id", { count: "exact", head: true })
      .eq("session_id", SESSION_ID)
      .eq("respondent_id", payload.respondentId);

    if (countError) throw countError;
    if ((count || 0) > 0) {
      return NextResponse.json({ error: "You have already submitted your responses." }, { status: 409 });
    }

    const rows = [
      ...payload.self.map((adjectiveId) => ({
        session_id: SESSION_ID,
        respondent_id: payload.respondentId,
        target_id: payload.respondentId,
        adjective_id: adjectiveId,
        response_type: "self"
      })),
      ...peerTargets.flatMap((target) =>
        payload.peers[target.id].map((adjectiveId) => ({
          session_id: SESSION_ID,
          respondent_id: payload.respondentId,
          target_id: target.id,
          adjective_id: adjectiveId,
          response_type: "peer"
        }))
      )
    ];

    const { error: insertError } = await supabase.from("responses").insert(rows);
    if (insertError) throw insertError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Submission failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
