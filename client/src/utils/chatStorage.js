




export const lastSeenKey = (userId) => `safeMother_lastSeen_${userId}`;

export function readLastSeen(userId) {
  try {
    return JSON.parse(localStorage.getItem(lastSeenKey(userId)) ?? "{}");
  } catch {
    return {};
  }
}

export function writeLastSeen(userId, map) {
  try {
    localStorage.setItem(lastSeenKey(userId), JSON.stringify(map));
  } catch {}
}
