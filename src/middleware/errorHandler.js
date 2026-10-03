import { isProd } from '../config/env.js';

export function notFound(req, res) {
  res.status(404).json({ message: 'Not found' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (!isProd) console.error(err);
  else console.error(err.message);
  const status = err.status && err.status < 600 ? err.status : 500;
  res.status(status).json({
    message: status === 500 ? 'Something went wrong' : err.message,
  });
}