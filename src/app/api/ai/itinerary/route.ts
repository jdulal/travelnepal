import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "node:crypto";
import { exec } from "@/lib/db";
import { getSession } from "@/lib/session";
import { generateItinerary } from "@/lib/ai";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  let body: { destination?: string; days?: number; travelers?: number; budgetTier?: string; interests?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = rateLimit(clientKey("ai-plan", ip), 15, 10 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many plans generated. Please try again in a few minutes." }, { status: 429 });

  const destination = String(body.destination || "").slice(0, 120);
  const days = Math.min(Math.max(Number(body.days) || 5, 1), 21);
  const travelers = Math.min(Math.max(Number(body.travelers) || 2, 1), 20);
  const budgetTier = ["budget", "mid", "luxury"].includes(String(body.budgetTier)) ? String(body.budgetTier) : "mid";
  const interests = Array.isArray(body.interests) ? body.interests.map(String).slice(0, 6) : [];

  const { plan, source } = await generateItinerary({ destination, days, travelers, budgetTier, interests });
  const token = "pln_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const session = await getSession();

  await exec(
    `INSERT INTO plans (user_id, token, title, destination, days, travelers, budget_tier, interests, plan_json, source)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [session?.id ?? null, token, plan.title, plan.destination, days, travelers, budgetTier, JSON.stringify(interests), JSON.stringify(plan), source]
  );

  return NextResponse.json({ plan, token, source });
}
