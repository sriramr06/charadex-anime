// "2026-11-18T10:30:00.000Z" -> "Nov 18, 2026"
export const formatDate = (isoString) =>
  new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
