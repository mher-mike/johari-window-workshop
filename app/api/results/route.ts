import { NextResponse } from "next/server";
import { SESSION_ID } from "@/lib/constants";
import { buildCompletion, buildResults } from "@/lib/results";
import { ensureWorkshopData } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = await ensureWorkshopData();
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id,title,status")
      .eq("id", SESSION_ID)
      .single();

    if (sessionError) throw sessionError;

    const { data, error } = await supabase
      .from("responses")
      .select("respondent_id,target_id,adjective_id,response_type")
      .eq("session_id", SESSION_ID);

    if (error) throw error;

    const rows = data || [];
    const completion = buildCompletion(rows);

    return NextResponse.json({
      session,
      completion,
      completeCount: completion.filter((row) => row.complete).length,
      results: buildResults(rows)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load results.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { status?: "active" | "closed" };
    if (body.status !== "active" && body.status !== "closed") {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const supabase = await ensureWorkshopData();
    const { error } = await supabase.from("sessions").update({ status: body.status }).eq("id", SESSION_ID);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
