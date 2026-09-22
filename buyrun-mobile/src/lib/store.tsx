import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { AppState, Platform } from "react-native";
import { api, ApiError } from "./api";
import { demoEvents, type Party, type EventInput, type Guest } from "./model";

const KEY = "buyrun.mobile.v1";
const INDEX_KEY = KEY + ".keyIds";
const LEGACY_KEY = KEY + ".keys";
const validId = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9_-]{1,100}$/.test(value);
const validToken = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9_-]{16,128}$/.test(value);
const secureKey = (id: string) => KEY + ".eventKey." + id;
const secretStorage = {
  get: (key: string) =>
    Platform.OS === "web"
      ? AsyncStorage.getItem(key)
      : SecureStore.getItemAsync(key),
  set: (key: string, value: string) =>
    Platform.OS === "web"
      ? AsyncStorage.setItem(key, value)
      : SecureStore.setItemAsync(key, value),
  remove: (key: string) =>
    Platform.OS === "web"
      ? AsyncStorage.removeItem(key)
      : SecureStore.deleteItemAsync(key),
};
const syncMessage =
  "Güncel yanıtlar alınamadı. Son kaydedilen bilgiler gösteriliyor. Bağlantınızı kontrol edip listeyi yenileyin.";
const storageMessage =
  "Cihazda kaydetme başarısız. Yönetim kodunuzu Profil bölümünden yedekleyin.";

function parseIndex(raw: string | null): string[] {
  const parsed: unknown = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(parsed)) throw new Error("Invalid key index");
  return parsed.filter(validId);
}
async function readTokens(cached: Party[]): Promise<Record<string, string>> {
  const [indexRaw, legacyRaw] = await Promise.all([
    AsyncStorage.getItem(INDEX_KEY),
    secretStorage.get(LEGACY_KEY),
  ]);
  const legacy: unknown = legacyRaw ? JSON.parse(legacyRaw) : {};
  if (!legacy || typeof legacy !== "object" || Array.isArray(legacy))
    throw new Error("Invalid legacy keys");
  const tokens: Record<string, string> = {};
  for (const [id, value] of Object.entries(legacy))
    if (validId(id) && validToken(value)) tokens[id] = value;
  // Also rescue any older cache format that still included a management key.
  for (const event of cached)
    if (!event.demo && validId(event.id) && validToken(event.manageToken))
      tokens[event.id] = event.manageToken;
  const ids = new Set([
    ...parseIndex(indexRaw),
    ...Object.keys(tokens),
    ...cached
      .filter((e) => !e.demo)
      .map((e) => e.id)
      .filter(validId),
  ]);
  await Promise.all(
    [...ids].map(async (id) => {
      const value = await secretStorage.get(secureKey(id));
      if (validToken(value)) tokens[id] = value;
    }),
  );
  return tokens;
}
function expired(event: Party, now = new Date()) {
  if (event.demo) return false;
  const explicit = event.deleteAfter;
  const expiry =
    explicit && /^\d{4}-\d{2}-\d{2}$/.test(explicit)
      ? new Date(explicit + "T23:59:59.999Z").getTime()
      : new Date(event.date + "T23:59:59.999Z").getTime() + 90 * 86400000;
  return Number.isFinite(expiry) && now.getTime() > expiry;
}
function safeCache(events: Party[]) {
  return events
    .filter((event) => !expired(event))
    .map(({ manageToken: _manageToken, coverData: _coverData, ...event }) => ({
      ...event,
      guests: event.guests.map(
        ({ token: _token, rsvpUrl: _rsvpUrl, ...guest }) => guest,
      ),
    }));
}
async function persistSnapshot(
  events: Party[],
  tokens: Record<string, string>,
) {
  const previousIds = parseIndex(await AsyncStorage.getItem(INDEX_KEY));
  const entries = Object.entries(tokens).filter(
    ([id, value]) => validId(id) && validToken(value),
  );
  // Each secret is small, avoiding SecureStore's platform-dependent value-size limit.
  // Write secrets first; only retire legacy keys after the new cache and index commit.
  await Promise.all(
    entries.map(([id, value]) => secretStorage.set(secureKey(id), value)),
  );
  await AsyncStorage.setItem(KEY, JSON.stringify(safeCache(events)));
  await AsyncStorage.setItem(
    INDEX_KEY,
    JSON.stringify(entries.map(([id]) => id)),
  );
  await secretStorage.remove(LEGACY_KEY);
  const retained = new Set(entries.map(([id]) => id));
  await Promise.all(
    previousIds
      .filter((id) => !retained.has(id))
      .map((id) => secretStorage.remove(secureKey(id))),
  );
}
function readCache(raw: string | null): Party[] {
  if (!raw) return demoEvents;
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("Invalid cache");
  const stored = parsed.filter(
    (value): value is Party =>
      !!value &&
      typeof value === "object" &&
      validId(value.id) &&
      typeof value.date === "string" &&
      Array.isArray(value.guests),
  );
  // Keep edited demos; add a missing example without removing any saved plan.
  return [
    ...stored,
    ...demoEvents.filter(
      (sample) => !stored.some((event) => event.id === sample.id),
    ),
  ];
}

type Store = {
  events: Party[];
  ready: boolean;
  name: string;
  setName: (s: string) => void;
  create: (data: EventInput) => Promise<Party>;
  update: (id: string, data: EventInput) => Promise<Party>;
  addGuest: (id: string, name: string) => Promise<Guest>;
  updateGuest: (id: string, gid: string, data: Partial<Guest>) => Promise<void>;
  refresh: (id: string) => Promise<void>;
  importEvent: (token: string) => Promise<Party>;
  error: string;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Party[]>(demoEvents);
  const [ready, setReady] = useState(false);
  const [name, setNameState] = useState("");
  const [storageError, setStorageError] = useState("");
  const [syncError, setSyncError] = useState("");
  const [removalNotice, setRemovalNotice] = useState("");
  const current = useRef<Party[]>(demoEvents);
  const keys = useRef<Record<string, string>>({});
  const hydrated = useRef(false);
  const writes = useRef<Promise<void>>(Promise.resolve());
  const failedSync = useRef(new Set<string>());
  const mounted = useRef(true);

  // All persistence goes through one queue. A slower old write can never replace
  // a newer event list, and no default/demo state is persisted before hydration.
  const enqueue = useCallback((operation: () => Promise<void>) => {
    const next = writes.current.catch(() => {}).then(operation);
    writes.current = next;
    return next.catch(() => {
      if (mounted.current) setStorageError(storageMessage);
    });
  }, []);
  const commit = useCallback(
    (next: Party[]) => {
      const active = next.filter((event) => !expired(event));
      next
        .filter((event) => expired(event))
        .forEach((event) => {
          delete keys.current[event.id];
          failedSync.current.delete(event.id);
        });
      current.current = active;
      setEvents(active);
      if (!hydrated.current) return Promise.resolve();
      const keySnapshot = { ...keys.current };
      return enqueue(async () => {
        await persistSnapshot(active, keySnapshot);
        if (mounted.current)
          setStorageError((previous) =>
            previous === storageMessage ? "" : previous,
          );
      });
    },
    [enqueue],
  );
  function remember(event: Party) {
    if (validToken(event.manageToken))
      keys.current[event.id] = event.manageToken;
    return commit([
      event,
      ...current.current.filter((old) => old.id !== event.id),
    ]);
  }
  function remove(id: string) {
    delete keys.current[id];
    failedSync.current.delete(id);
    setSyncError(failedSync.current.size ? syncMessage : "");
    setRemovalNotice(
      "Süresi dolan veya artık erişilemeyen plan cihazdan kaldırıldı.",
    );
    return commit(current.current.filter((event) => event.id !== id));
  }
  function ensureReady() {
    if (!hydrated.current)
      throw new Error(
        "Kayıtlı planlar henüz yüklenemedi. Biraz bekleyip uygulamayı yeniden açın.",
      );
  }
  function find(id: string) {
    ensureReady();
    const event = current.current.find((value) => value.id === id);
    if (!event) throw new Error("Plan bulunamadı.");
    return event;
  }
  function managementKey(event: Party) {
    const value = event.manageToken || keys.current[event.id];
    if (!validToken(value))
      throw new Error(
        "Bu planın yönetim kodu bulunamadı. Profil bölümünden kayıtlı kodunu içe aktar.",
      );
    return value;
  }

  useEffect(() => {
    let alive = true;
    mounted.current = true;
    (async () => {
      try {
        const [cacheRaw, savedName] = await Promise.all([
          AsyncStorage.getItem(KEY),
          AsyncStorage.getItem(KEY + ".name"),
        ]);
        const cached = readCache(cacheRaw);
        const tokens = await readTokens(cached);
        if (!alive) return;
        if (savedName) setNameState(savedName);
        const expiredIds = new Set(
          cached.filter((event) => expired(event)).map((event) => event.id),
        );
        expiredIds.forEach((id) => {
          delete tokens[id];
        });
        const safe = safeCache(cached) as Party[];
        let restored: Party[] = safe.map((event) => ({
          ...event,
          manageToken: tokens[event.id],
        }));
        const results = await Promise.allSettled(
          Object.entries(tokens).map(async ([id, value]) => ({
            id,
            token: value,
            event: await api.get(value),
          })),
        );
        if (!alive) return;
        const entries = Object.entries(tokens);
        let removed = expiredIds.size;
        results.forEach((result, index) => {
          const [id] = entries[index];
          if (result.status === "fulfilled") {
            const event = {
              ...result.value.event,
              manageToken: result.value.token,
            };
            delete tokens[id];
            restored = restored.filter(
              (old) => old.id !== id && old.id !== event.id,
            );
            if (expired(event)) {
              removed++;
              return;
            }
            tokens[event.id] = result.value.token;
            restored.unshift(event);
          } else if (
            result.reason instanceof ApiError &&
            result.reason.status === 404
          ) {
            delete tokens[id];
            restored = restored.filter((event) => event.id !== id);
            removed++;
          } else failedSync.current.add(id);
        });
        keys.current = tokens;
        hydrated.current = true;
        if (failedSync.current.size) setSyncError(syncMessage);
        if (restored.some((event) => !event.demo && !tokens[event.id]))
          setStorageError(
            "Bir planın yönetim kodu cihazda bulunamadı. Profil bölümünden kayıtlı kodunu içe aktar.",
          );
        if (removed)
          setRemovalNotice(
            "Süresi dolan veya artık erişilemeyen planlar cihazdan kaldırıldı.",
          );
        await commit(restored);
      } catch {
        if (alive)
          setStorageError(
            "Kayıtlı planlar yüklenemedi. Verilerin üzerine yazılmadı; uygulamayı yeniden açmayı deneyin.",
          );
      } finally {
        if (alive) setReady(true);
      }
    })();
    const prune = () => {
      if (hydrated.current && current.current.some((event) => expired(event))) {
        setRemovalNotice("Saklama süresi dolan planlar cihazdan kaldırıldı.");
        void commit(current.current);
      }
    };
    const timer = setInterval(prune, 60 * 60 * 1000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") prune();
    });
    return () => {
      alive = false;
      mounted.current = false;
      clearInterval(timer);
      subscription.remove();
    };
  }, [commit]);

  const value: Store = {
    events,
    ready,
    name,
    error: storageError || syncError || removalNotice,
    setName: (next) => {
      if (!hydrated.current) {
        setStorageError(
          "İsmini kaydetmeden önce planların yüklenmesini bekle.",
        );
        return;
      }
      setNameState(next);
      void enqueue(() => AsyncStorage.setItem(KEY + ".name", next));
    },
    create: async (data) => {
      ensureReady();
      const event = await api.create(data);
      await remember(event);
      return event;
    },
    update: async (id, data) => {
      const event = find(id);
      try {
        const next = event.demo
          ? { ...event, ...data }
          : await api.update(managementKey(event), data);
        await remember(next);
        return next;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) await remove(id);
        throw error;
      }
    },
    addGuest: async (id, guestName) => {
      const event = find(id);
      try {
        const guest = event.demo
          ? {
              id: "local-" + Date.now(),
              name: guestName,
              status: "pending" as const,
              count: 1,
            }
          : await api.add(managementKey(event), guestName);
        await commit(
          current.current.map((value) =>
            value.id === id
              ? { ...value, guests: [...value.guests, guest] }
              : value,
          ),
        );
        return guest;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) await remove(id);
        throw error;
      }
    },
    updateGuest: async (id, guestId, data) => {
      const event = find(id);
      const existing = event.guests.find((guest) => guest.id === guestId);
      if (!existing) throw new Error("Davetli bulunamadı.");
      const guest = event.demo
        ? { ...existing, ...data }
        : await api.guest(managementKey(event), guestId, data);
      await commit(
        current.current.map((value) =>
          value.id === id
            ? {
                ...value,
                guests: value.guests.map((old) =>
                  old.id === guestId ? guest : old,
                ),
              }
            : value,
        ),
      );
    },
    refresh: async (id) => {
      const event = find(id);
      if (event.demo) return;
      if (expired(event)) {
        await remove(id);
        return;
      }
      try {
        const fresh = await api.get(managementKey(event));
        failedSync.current.delete(id);
        setSyncError(failedSync.current.size ? syncMessage : "");
        if (expired(fresh)) await remove(id);
        else await remember(fresh);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) await remove(id);
        else {
          failedSync.current.add(id);
          setSyncError(syncMessage);
        }
        throw error;
      }
    },
    importEvent: async (token) => {
      ensureReady();
      const normalized = token.trim();
      try {
        const event = await api.get(normalized);
        if (expired(event)) {
          await remove(event.id);
          throw new Error("Bu planın saklama süresi dolmuş.");
        }
        failedSync.current.delete(event.id);
        setSyncError(failedSync.current.size ? syncMessage : "");
        await remember({ ...event, manageToken: normalized });
        return event;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          const known = Object.entries(keys.current).find(
            ([, value]) => value === normalized,
          );
          if (known) await remove(known[0]);
        }
        throw error;
      }
    },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useStore = () => {
  const value = useContext(Context);
  if (!value) throw new Error("Store unavailable");
  return value;
};
