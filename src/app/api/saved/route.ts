import { NextRequest, NextResponse } from "next/server";
import { exec, q1 } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to save trips." }, { status: 401 });

  let body: { tripId?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const tripId = Number(body.tripId);
  if (!tripId) return NextResponse.json({ error: "Missing trip." }, { status: 400 });

  const existing = await q1<{ trip_id: number }>("SELECT trip_id FROM saved_trips WHERE user_id = ? AND trip_id = ?", [session.id, tripId]);
  if (existing) {
    await exec("DELETE FROM saved_trips WHERE user_id = ? AND trip_id = ?", [session.id, tripId]);
    return NextResponse.json({ saved: false });
  }
  await exec("INSERT INTO saved_trips (user_id, trip_id) VALUES (?, ?)", [session.id, tripId]);
  return NextResponse.json({ saved: true });
}
