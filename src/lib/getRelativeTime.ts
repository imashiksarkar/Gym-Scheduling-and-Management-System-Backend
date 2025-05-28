export default function getRelativeTime(fromMs: number) {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const now = Date.now()
  const elapsed = now - fromMs

  const units = [
    { unit: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: 'day', ms: 1000 * 60 * 60 * 24 },
    { unit: 'hour', ms: 1000 * 60 * 60 },
    { unit: 'minute', ms: 1000 * 60 },
    { unit: 'second', ms: 1000 },
  ]

  for (const { unit, ms } of units) {
    const delta = Math.floor(elapsed / ms)
    if (delta >= 1) {
      return rtf.format(-delta, unit as Intl.RelativeTimeFormatUnit) // Negative = past (e.g., "2 days ago")
    }
  }

  return 'just now'
}