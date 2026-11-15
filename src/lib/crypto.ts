import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/** AES-256-GCM with a key derived from SESSION_SECRET, for secrets stored in the database. */
function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return createHash("sha256").update(`healthyzone-db-secret:${secret}`).digest();
}

export function encrypt(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

export function decrypt(token: string) {
  const [iv, tag, data] = token.split(".").map((p) => Buffer.from(p, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

/** Short-lived signed value (e.g. OAuth state): "<expiry>.<nonce>.<mac>". */
export function signState(ttlSeconds = 600) {
  const body = `${Date.now() + ttlSeconds * 1000}.${randomBytes(12).toString("base64url")}`;
  const mac = createHmac("sha256", key()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function verifyState(state: string) {
  const i = state.lastIndexOf(".");
  if (i < 0) return false;
  const body = state.slice(0, i);
  const mac = Buffer.from(state.slice(i + 1));
  const expected = Buffer.from(createHmac("sha256", key()).update(body).digest("base64url"));
  if (mac.length !== expected.length || !timingSafeEqual(mac, expected)) return false;
  return Number(body.split(".")[0]) > Date.now();
}
