export function checkBasicAuth(header: string | null, password: string): boolean {
  if (!header || !header.startsWith("Basic ")) return false;
  let decoded: string;
  try {
    decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  } catch {
    return false;
  }
  const idx = decoded.indexOf(":");
  const supplied = idx === -1 ? decoded : decoded.slice(idx + 1);
  // constant-time-ish compare
  if (supplied.length !== password.length) return false;
  let diff = 0;
  for (let i = 0; i < supplied.length; i++) {
    diff |= supplied.charCodeAt(i) ^ password.charCodeAt(i);
  }
  return diff === 0;
}
