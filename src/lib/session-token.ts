export function generateSessionTokenId() {
  return globalThis.crypto.randomUUID();
}
