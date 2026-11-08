import { NextRequest, NextResponse } from "next/server";
import { q } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function csv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const text = value == null ? "" : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [headers.join(","), ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))].join("\r\n");
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type } = await params;
  let rows: Record<string, unknown>[] = [];
  let filename = `${type}-${new Date().toISOString().slice(0, 10)}.csv`;

  if (type === "bookings") {
    const status = req.nextUrl.searchParams.get("status");
    rows = await q<Record<string, unknown>>(
      `SELECT b.reference, b.full_name, b.email, b.phone, b.nationality, t.title AS trip, b.travelers,
              b.start_date, b.subtotal, b.discount, b.total, b.currency, b.coupon_code, b.status, b.payment_status,
              b.payment_method, b.created_at
       FROM bookings b JOIN trips t ON t.id = b.trip_id
       ${status ? "WHERE b.status = ?" : ""}
       ORDER BY b.created_at DESC`,
      status ? [status] : []
    );
  } else if (type === "users") {
    rows = await q<Record<string, unknown>>(
      `SELECT u.id, u.name, u.email, u.username, u.phone, u.country, u.role, u.status, u.created_at,
        (SELECT COUNT(*) FROM bookings b WHERE b.user_id = u.id) AS bookings,
        (SELECT COALESCE(SUM(b.total),0) FROM bookings b WHERE b.user_id = u.id AND b.payment_status='paid') AS paid_spend
       FROM users u ORDER BY u.created_at DESC`
    );
  } else if (type === "newsletter") {
    rows = await q<Record<string, unknown>>("SELECT id, email, created_at FROM newsletter_subscribers ORDER BY created_at DESC");
  } else if (type === "inquiries") {
    rows = await q<Record<string, unknown>>("SELECT id, name, email, phone, subject, message, status, created_at FROM inquiries ORDER BY created_at DESC");
  } else {
    return NextResponse.json({ error: "Unknown export type" }, { status: 404 });
  }

  filename = `${type}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse("\uFEFF" + csv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
