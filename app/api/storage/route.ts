import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "../../lib/redisClient";

function storageKey(deviceId: string, store: string) {
  return `sat:${deviceId}:${store}`;
}

export async function GET(req: NextRequest) {
  const deviceId = req.headers.get("x-device-id");
  const store = req.nextUrl.searchParams.get("store");

  if (!deviceId || !store) {
    return NextResponse.json({ error: "Missing deviceId or store" }, { status: 400 });
  }

  const redis = getRedisClient();
  if (!redis) {
    return NextResponse.json({ data: null, error: "storage_unavailable" }, { status: 503 });
  }

  try {
    const raw = await redis.get(storageKey(deviceId, store));
    return NextResponse.json({ data: raw !== null ? JSON.parse(raw) : null });
  } catch {
    return NextResponse.json({ data: null, error: "storage_unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const deviceId = req.headers.get("x-device-id");

  if (!deviceId) {
    return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });
  }

  const redis = getRedisClient();
  if (!redis) {
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }

  try {
    const { store, data } = await req.json();
    if (!store) return NextResponse.json({ error: "Missing store" }, { status: 400 });
    // 1-year TTL
    await redis.set(storageKey(deviceId, store), JSON.stringify(data), "EX", 31_536_000);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }
}
