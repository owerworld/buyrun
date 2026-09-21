import { randomBytes, randomInt } from "crypto";

/** Tahmin edilemez, URL güvenli kimlik (varsayılan 16 karakter ≈ 96 bit). */
export const token = (bytes = 12) => randomBytes(bytes).toString("base64url");
export const id = () => randomBytes(8).toString("base64url");

/** Karıştırılması kolay harfler (I, L, O, 0, 1) bilerek yok. */
const KOD_ALFABE = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Elle yazılabilen kurtarma kodu: ABCD-EFGH-JKMN (yaklaşık 59 bit). */
export const recoveryCode = () =>
  Array.from({ length: 3 }, () =>
    Array.from({ length: 4 }, () => KOD_ALFABE[randomInt(KOD_ALFABE.length)]).join("")
  ).join("-");

/** Kullanıcı kodu boşluklu, küçük harfle ya da tiresiz yazmış olabilir. */
export function normalizeCode(input: string) {
  const raw = input.toLocaleUpperCase("en").replace(/[^A-Z0-9]/g, "").slice(0, 12);
  return raw.length === 12 ? `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}` : "";
}
