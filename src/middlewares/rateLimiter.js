const redis = require("../config/redis");

/**
 * Rate Limiter Middleware - (Fixed Window Counter Pattern)
 * This protects the server from "Denial of Service" (DoS) attacks and abuse.
 * 
 * Logic:
 * 1. Identify user by IP.
 * 2. Count requests in a 1-minute window in Redis.
 * 3. Reject if limit exceeded.
 */
const rateLimiter = (limit, windowSeconds) => {
  return async (req, res, next) => {
    try {
      const key = `ratelimit:${req.ip}`;
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (current > limit) {
        console.warn(`[RateLimiter] 🚫 Limit exceeded for IP: ${req.ip}`);
        return res.status(429).json({
          error: "Too many requests",
          message: `Ouch! Rate limit hit. Try again in ${windowSeconds} seconds.`,
          retryAfter: `${windowSeconds}s`
        });
      }

      next();
    } catch (err) {
      console.error("[RateLimiter] Error:", err.message);
      next();
    }
  };
};

module.exports = rateLimiter;
