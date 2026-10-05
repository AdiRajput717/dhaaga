// Small dependency-free in-memory rate limiter for auth endpoints.
// Per-instance and reset on restart; swap for express-rate-limit + a shared
// store (e.g. Redis) if the API is ever scaled to multiple instances.

const createRateLimiter = ({ windowMs, max, message }) => {
  const hits = new Map();

  setInterval(() => {
    const now = Date.now();

    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;

    if (entry.count > max) {
      res.set("Retry-After", Math.ceil((entry.resetAt - now) / 1000));

      return res.status(429).json({
        message: message || "Too many requests, please try again later",
      });
    }

    next();
  };
};

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many attempts, please try again in a few minutes",
});

module.exports = { createRateLimiter, authLimiter };
