// Read ?page= and ?limit= safely (defaults: page 1, 12 per page, max 50)
const getPagination = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1)
  const limit = Math.min(Math.max(parseInt(query.limit) || 12, 1), 50)
  return { page, limit, skip: (page - 1) * limit }
}

export default getPagination
