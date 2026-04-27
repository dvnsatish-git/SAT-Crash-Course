import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = Redis.fromEnv();

function storageKey(deviceId: string, store: string) {
  return `sat:${deviceId}:${store}`;
}

export async function GET(req: NextRequest) {
  const deviceId = req.headers.get("x-device-id");
  const store = req.nextUrl.searchParams.get("store");

  if (!deviceId || !store) {
    return NextResponse.json({ error: "Missing deviceId or store" }, { status: 400 });
  }

  try {
    const data = await redis.get(storageKey(deviceId, store));
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: null, error: "storage_unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const deviceId = req.headers.get("x-device-id");

  if (!deviceId) {
    return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });
  }

  try {
    const { store, data } = await req.json();
    if (!store) return NextResponse.json({ error: "Missing store" }, { status: 400 });
    // 1-year TTL
    await redis.set(storageKey(deviceId, store), data, { ex: 31_536_000 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }
}
