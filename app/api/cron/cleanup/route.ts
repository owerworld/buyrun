import { NextResponse } from "next/server";
import { cleanupExpired } from "@/lib/data";
import { cleanupRateLimits } from "@/lib/ratelimit";
import { cleanupMobileExpired } from "@/lib/mobile";
import { todayIso } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const deleted = await cleanupExpired(todayIso());
  const mobileDeleted = await cleanupMobileExpired(todayIso());
  const limits = await cleanupRateLimits();
  return NextResponse.json({ deleted, mobileDeleted, limits });
}
