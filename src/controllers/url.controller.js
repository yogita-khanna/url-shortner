const service = require("../services/url.service");

/**
 * Controller for URL related API calls.
 * (Skinny) Responsibilities: Parsing, Mapping, and Response Generation.
 */
exports.createShort = async (req, res) => {
  try {
    const { longUrl, customAlias } = req.body;
    if (!longUrl) {
      return res.status(400).json({ error: "longUrl is required" });
    }
    const shortCode = await service.createShortURL(longUrl, customAlias);

    res.json({
      shortUrl: `http://localhost:3000/${shortCode}`,
      shortCode: shortCode
    });
  } catch (err) {
    if (err.message.includes("Alias already taken")) {
      return res.status(400).json({ error: err.message });
    }
    console.error("[Controller] Create Short URL Error:", err);
    res.status(500).json({ error: "Failed to shorten URL" });
  }
};

/**
 * Endpoint for redirection.
 * Handles: Analytics metadata and CDN Cache-Control headers.
 */
exports.redirect = async (req, res) => {
  try {
    const { code } = req.params;
    const metadata = {
        userAgent: req.headers['user-agent'],
        ip: req.ip
    };

    const longUrl = await service.resolveURL(code, metadata);

    if (!longUrl) {
      return res.status(404).send("Short URL Not found");
    }

    // 3. SOLUTION: Hot Key Problem (CDN Caching)
    // By setting public cache, we tell Cloudflare/Fastly to serve the redirect from their edge.
    // This protects our origin servers and Redis from massive spike in traffic.
    /**
     * 🔥 Hot Key Problem Ka Solution (CDN Caching):
     * Agar koi link viral ho jaye, toh millions of requests humare server ko crash kar sakti hain.
     * 'public, max-age=300' se hum Cloudflare/CDNs ko bolte hain ki woh redirect ko 5 min tak
     * apne paas save (Edge Cache) rakhein taaki requests humare server aur Redis tak na pahunchein.
     */
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes at the edge

    // 4. Redirect with definitive status (302 for temp redirect is safer for CDNs to keep refreshing)
    res.redirect(302, longUrl);
    
  } catch (err) {
    console.error("[Controller] Redirect URL Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
