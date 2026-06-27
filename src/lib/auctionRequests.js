export function normalizeRequestedChanges(changes) {
  if (!changes) return {};
  if (changes instanceof Map) {
    return Object.fromEntries(changes.entries());
  }
  if (typeof changes === 'object') {
    return changes;
  }
  return {};
}
