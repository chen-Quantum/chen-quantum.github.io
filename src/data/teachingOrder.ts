// Presentation order only. Never renumber exercises, change PDF pages, or
// mutate the canonical handbook/source arrays.
export function newestNumberedFirst<T extends { number: number }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => b.number - a.number);
}

// Only use a date actually supplied by the recording source. Undated legacy
// recordings keep their relative source order; no dates are inferred from IDs,
// titles, playlist positions, or import time. Dated recordings appear first.
export function newestRecordingsFirst<T extends { publishedAt?: string }>(items: readonly T[]): T[] {
  return items
    .map((item, position) => {
      const parsed = item.publishedAt ? Date.parse(item.publishedAt) : Number.NaN;
      return { item, position, timestamp: Number.isFinite(parsed) ? parsed : 0 };
    })
    .sort((a, b) => b.timestamp - a.timestamp || a.position - b.position)
    .map(({ item }) => item);
}
