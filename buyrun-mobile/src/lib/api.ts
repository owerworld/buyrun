import type { EventInput, Party, Guest } from "./model";

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || "";
const development = typeof __DEV__ !== "undefined" && __DEV__;
export const API_URL = (
  configuredApiUrl || (development ? "http://127.0.0.1:3000" : "")
).replace(/\/$/, "");
function configurationError(): string | null {
  if (!API_URL)
    return "Bu sürümün sunucu adresi yapılandırılmamış. Lütfen uygulamanın geliştiricisine bildirin.";
  try {
    const url = new URL(API_URL);
    if (
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !["http:", "https:"].includes(url.protocol)
    )
      return "Uygulamanın sunucu adresi geçersiz. Lütfen geliştiricisine bildirin.";
    if (!development && url.protocol !== "https:")
      return "Bu sürüm için güvenli bir sunucu bağlantısı ayarlanmamış. Lütfen uygulamanın geliştiricisine bildirin.";
  } catch {
    return "Uygulamanın sunucu adresi geçersiz. Lütfen geliştiricisine bildirin.";
  }
  return null;
}
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | null = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const invalid = configurationError();
  if (invalid) throw new ApiError(invalid);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(API_URL + path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new ApiError(
        response.status === 404
          ? "Plan bulunamadı veya bağlantının süresi doldu."
          : "Sunucudan geçerli bir yanıt alınamadı. Lütfen tekrar deneyin.",
        response.status,
      );
    }
    if (!response.ok) {
      const message =
        data &&
        typeof data === "object" &&
        "error" in data &&
        typeof data.error === "string"
          ? data.error
          : "İşlem tamamlanamadı. Lütfen yeniden deneyin.";
      throw new ApiError(message, response.status);
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Bağlantı kurulamadı. Son kaydedilen bilgiler korunuyor; güncel yanıtlar alınamadı. Bağlantınızı kontrol edip tekrar deneyin.",
    );
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  create: (data: EventInput) =>
    request<Party>("/api/mobile/events", "POST", data),
  get: (token: string) =>
    request<Party>("/api/mobile/events/" + encodeURIComponent(token)),
  update: (token: string, data: EventInput) =>
    request<Party>(
      "/api/mobile/events/" + encodeURIComponent(token),
      "PATCH",
      data,
    ),
  add: (token: string, name: string) =>
    request<Guest>(
      "/api/mobile/events/" + encodeURIComponent(token) + "/guests",
      "POST",
      { name },
    ),
  guest: (token: string, id: string, data: Partial<Guest>) =>
    request<Guest>(
      "/api/mobile/events/" +
        encodeURIComponent(token) +
        "/guests/" +
        encodeURIComponent(id),
      "PATCH",
      data,
    ),
};
