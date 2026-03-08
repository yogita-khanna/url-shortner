const service = require("../services/url.service");
const redis = require("../config/redis");

/**
 * Controller to handle URL-related API requests.
 * Implements Caching Strategy (L1: Redis, L2: DB).
 */
exports.createShort = async (req, res) => {
  try {
    const { longUrl } = req.body;
    if (!longUrl) {
      return res.status(400).json({ error: "longUrl is required" });
    }

    // Shorten the URL via the service layer
    const code = await service.createShortURL(longUrl);

    // Cache the link immediately upon creation (Write-through pattern or similar)
    // Helps with immediate high read traffic.
    await redis.set(code, longUrl, {
        EX: 3600 * 24 // 24 hours cache for new links
    });

    res.json({
      shortUrl: `http://localhost:3000/${code}`,
      shortCode: code
    });
  } catch (err) {
    console.error("Create Short URL Error:", err);
    res.status(500).json({ error: "Failed to shorten URL" });
  }
};

/**
 * Redirects the short URL code to the original long URL.
 * Checks Redis first, then falls back to the database.
 */
exports.redirect = async (req, res) => {
  try {
    const { code } = req.params;

    // 1. L1 Cache: Redis GET
    const cached = await redis.get(code);

    if (cached) {
      console.log(`Cache Hit for: ${code}`);
      return res.redirect(cached);
    }

    // 2. L2 Cache: Database Miss
    console.log(`Cache Miss for: ${code}, fetching from DB...`);
    const doc = await service.getLongURL(code);

    if (!doc) {
      return res.status(404).send("Short URL Not found");
    }

    // 3. Cache the result for future requests (Populate L1)
    // Prevents "Cache Stampede" by filling it back quickly.
    await redis.set(code, doc.longUrl, {
        EX: 3600 * 24 // Cache for 1 day
    });

    res.redirect(doc.longUrl);
  } catch (err) {
    console.error("Redirect URL Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
