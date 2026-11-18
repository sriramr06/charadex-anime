// Runs when no route matched the request
export const notFound = (req, res, next) => {
  res.status(404)
  next(new Error(`Not found: ${req.originalUrl}`))
}

// Central error handler: sends a JSON error instead of crashing
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode
  let message = err.message

  // Mongoose schema validation failed (e.g. name too long)
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors).map((e) => e.message).join(', ')
  }

  // Invalid MongoDB id in the URL (e.g. /api/characters/abc)
  if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid id'
  }

  // Unique index violation (e.g. duplicate email or username)
  if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyValue)[0]
    message = `${field} is already in use`
  }

  // Bad JSON in the request body
  if (err.type === 'entity.parse.failed') {
    statusCode = 400
    message = 'Invalid JSON in request body'
  }

  res.status(statusCode).json({
    message,
    // Only show the stack trace while developing
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  })
}
