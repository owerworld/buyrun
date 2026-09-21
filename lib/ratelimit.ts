import { createHash } from "crypto";
import { headers } from "next/headers";
import { q } from "./db";

/**
 * Basit istek sınırlama.
 *
 * Aynı IP'den kısa sürede çok sayıda davetiye/davetli oluşturulmasını engeller.
 * IP adresi ASLA ham hâliyle saklanmaz; sunucudaki gizli anahtarla birlikte
 * özetlenir (hash), yalnızca bu özet ve sayaç tutulur. Sayaçlar süresi dolunca
 * gece çalışan temizlik işinde silinir.
 */

const SALT = process.env.CRON_SECRET || "buyrun-yerel-gelistirme";

/** Ziyaretçinin IP'sini vekil sunucu başlıklarından okur. */
async function clientIp() {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : h.get("x-real-ip") || "").trim() || "bilinmiyor";
}

/** IP + işlem adından geri döndürülemez bir anahtar üretir. */
async function bucketKey(action: string) {
  return `${action}:${createHash("sha256").update(`${SALT}|${await clientIp()}`).digest("base64url").slice(0, 22)}`;
}

/**
 * Sayacı bir artırır. Sınır aşıldıysa false döner.
 * Sayım penceresi dolduğunda sayaç kendiliğinden sıfırlanır.
 */
export async function allow(action: string, limit: number, windowSeconds: number) {
  const bucket = await bucketKey(action);
  const rows = await q<{ hits: number }>(
    `INSERT INTO rate_limits (bucket, hits, reset_at)
       VALUES ($1, 1, now() + make_interval(secs => $2))
     ON CONFLICT (bucket) DO UPDATE SET
       hits = CASE WHEN rate_limits.reset_at <= now() THEN 1 ELSE rate_limits.hits + 1 END,
       reset_at = CASE WHEN rate_limits.reset_at <= now() THEN now() + make_interval(secs => $2) ELSE rate_limits.reset_at END
     RETURNING hits`,
    [bucket, windowSeconds]
  );
  return (rows[0]?.hits ?? 1) <= limit;
}

/** Süresi dolmuş sayaçları siler (gece çalışan temizlik işinden çağrılır). */
export async function cleanupRateLimits() {
  const rows = await q<{ bucket: string }>(`DELETE FROM rate_limits WHERE reset_at <= now() RETURNING bucket`);
  return rows.length;
}

/** Sınırlar tek yerde dursun ki ayarlamak kolay olsun. */
export const LIMITS = {
  // Bir düğün için tek davetiye yeter; saatte 5 fazlasıyla geniş.
  davetiye: { action: "davetiye", limit: 5, window: 3600 },
  // Kalabalık Türk düğünlerinde aile tek oturuşta yüzlerce kişi girebilir.
  davetli: { action: "davetli", limit: 150, window: 3600 },
  // Kurtarma kodunun denenerek bulunmasını engeller.
  kurtarma: { action: "kurtarma", limit: 10, window: 3600 },
} as const;
