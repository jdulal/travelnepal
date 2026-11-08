import { NextRequest, NextResponse } from "next/server";
import { exec } from "@/lib/db";
import { getSession } from "@/lib/session";
import { analyzeTool } from "@/lib/ai";

export async function POST(req: NextRequest) {
  let body: { type?: string; image?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ note: "Invalid request." }, { status: 400 });
  }

  const type = body.type;
  if (type !== "landmark" && type !== "receipt" && type !== "food") {
    return NextResponse.json({ note: "Unknown tool." }, { status: 400 });
  }
  if (body.image && !body.image.startsWith("data:image/")) {
    return NextResponse.json({ note: "Please upload a JPG or PNG image." }, { status: 400 });
  }
  if (body.image && body.image.length > 5_500_000) {
    return NextResponse.json({ note: "That image is too large. Please use one under 4 MB." }, { status: 400 });
  }

  const result = await analyzeTool(type, { image: body.image, text: (body.text || "").slice(0, 600) });

  const session = await getSession();
  if (session) {
    const title =
      type === "landmark" ? String(result.name ?? "Landmark scan")
      : type === "receipt" ? String(result.vendor ?? "Receipt scan")
      : String(result.dish ?? "Food scan");
    const summary =
      type === "landmark" ? String(result.description ?? "")
      : type === "receipt" ? `Total ${result.currency ?? "NPR"} ${Number(result.total ?? 0).toLocaleString()}`
      : `${result.calories ?? "?"} kcal · ${result.protein ?? "?"} g protein`;
    await exec(
      "INSERT INTO scans (user_id, type, title, summary, result_json) VALUES (?,?,?,?,?)",
      [session.id, type, title, summary, JSON.stringify(result)]
    );
    if (type === "receipt" && result.total) {
      await exec(
        "INSERT INTO expenses (user_id, label, category, amount, currency, spent_on, note) VALUES (?,?, 'other', ?, ?, CURDATE(), ?)",
        [session.id, String(result.vendor ?? "Scanned receipt"), Number(result.total), String(result.currency ?? "NPR"), "Added from AI receipt scan"]
      );
    }
  }

  return NextResponse.json(result);
}
