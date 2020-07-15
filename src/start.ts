import express, { Request, Response, NextFunction } from 'express'
import 'express-async-errors'
import logger from 'loglevel' // this is all it takes to enable async/await for express middleware

import { getRoutes } from './routes' // all the routes for my app are retrieved from the src/routes/index.js module

function startServer({ port = process.env.PORT || 4500 } = {}) {
  const app = express()

  app.use('/api', getRoutes()) // I mount my entire app to the /api route (or you could just do "/" if you want)

  app.use(errorMiddleware) // add the generic error handler just in case errors are missed by middleware

  app.listen(port, () => {
    logger.info(`Listening on ${port}`)
  })
}

// here's our generic error handler for situations where we didn't handle
// errors properly
function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    next(error)
  } else {
    logger.error(error)
    res.status(500)
    res.json({
      message: error.message,
      // we only add a `stack` property in non-production environments
      ...(process.env.NODE_ENV === 'production'
        ? null
        : { stack: error.stack }),
    })
  }
}

export { startServer }
