import { randomBytes } from "crypto";

/** Tahmin edilemez, URL güvenli kimlik (varsayılan 16 karakter ≈ 96 bit). */
export const token = (bytes = 12) => randomBytes(bytes).toString("base64url");
export const id = () => randomBytes(8).toString("base64url");
