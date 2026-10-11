import { NextResponse } from "next/server";
import { z } from "zod";
import { contactSchema } from "@/lib/contact-schema";
import { deliverContact } from "@/lib/contact-delivery";
import strings from "@/strings.json";

/**
 * POST /api/contact
 * Validates with the same Zod schema as the form, filters bots (honeypot +
 * minimum fill time + a simple per-IP rate limit), then hands off to
 * lib/contact-delivery.ts.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
/** In-memory rate limit. Per serverless instance — use Upstash/Redis for a global limit. */
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Bots: honeypot filled or submitted inhumanly fast → pretend success, send nothing.
  const elapsed = Number(body.elapsedMs ?? 0);
  if (
    (typeof body.website === "string" && body.website.length > 0) ||
    (elapsed > 0 && elapsed < 2500)
  ) {
    return NextResponse.json({ ok: true });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      {
        ok: false,
        error: strings.contact.api.rateLimited,
      },
      { status: 429 },
    );
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: strings.contact.api.formInvalid,
        fields: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const result = await deliverContact(parsed.data);
    if (!result.ok) {
      console.error("[contact] delivery failed:", result.error);
      return NextResponse.json(
        { ok: false, error: strings.contact.api.deliveryFailed },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: strings.contact.api.deliveryFailed },
      { status: 500 },
    );
  }
}
