// Runs when no route matched the request
export const notFound = (req, res, next) => {
  res.status(404)
  next(new Error(`Not found: ${req.originalUrl}`))
}

// Central error handler: sends a JSON error instead of crashing
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode

  res.status(statusCode).json({
    message: err.message,
    // Only show the stack trace while developing
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  })
}
