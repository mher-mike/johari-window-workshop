import { NextResponse } from "next/server";
import { PARTICIPANTS, SESSION_ID } from "@/lib/constants";
import { ensureWorkshopData } from "@/lib/supabase";

const participantIds = new Set<string>(PARTICIPANTS.map((participant) => participant.id));

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const respondentId = searchParams.get("respondentId");

    if (!respondentId || !participantIds.has(respondentId)) {
      return NextResponse.json({ error: "Choose a valid participant." }, { status: 400 });
    }

    const supabase = await ensureWorkshopData();

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("status")
      .eq("id", SESSION_ID)
      .single();

    if (sessionError) throw sessionError;

    const { count, error: countError } = await supabase
      .from("responses")
      .select("id", { count: "exact", head: true })
      .eq("session_id", SESSION_ID)
      .eq("respondent_id", respondentId);

    if (countError) throw countError;

    return NextResponse.json({
      submitted: (count || 0) > 0,
      sessionStatus: session.status
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not check submission status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
