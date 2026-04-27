import { getLS, setLS } from "./storage";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("sat:deviceId");
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("sat:deviceId", id);
  }
  return id;
}

async function serverGet<T>(store: string): Promise<T | null> {
  const deviceId = getDeviceId();
  if (!deviceId) return null;
  try {
    const res = await fetch(`/api/storage?store=${encodeURIComponent(store)}`, {
      headers: { "x-device-id": deviceId },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as T ?? null;
  } catch {
    return null;
  }
}

async function serverSet(store: string, data: unknown): Promise<void> {
  const deviceId = getDeviceId();
  if (!deviceId) return;
  try {
    await fetch("/api/storage", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-device-id": deviceId },
      body: JSON.stringify({ store, data }),
    });
  } catch {
    // silent — localStorage is already updated
  }
}

/**
 * Loads from Vercel KV (server), falls back to localStorage.
 * Keeps localStorage in sync with server data.
 */
export async function loadData<T>(key: string, fallback: T): Promise<T> {
  const local = getLS(key, fallback);
  const server = await serverGet<T>(key);
  const isEmptyObj = (v: unknown) =>
    v !== null &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Object.keys(v as object).length === 0;
  const isEmptyArr = (v: unknown) => Array.isArray(v) && (v as unknown[]).length === 0;

  // Server wins unless it's null/empty — prefer local data in that case
  if (server !== null && !isEmptyObj(server) && !isEmptyArr(server)) {
    setLS(key, server);
    return server;
  }
  return local;
}

/** Writes to both localStorage and Vercel KV */
export async function saveData<T>(key: string, value: T): Promise<void> {
  setLS(key, value);
  await serverSet(key, value);
}
