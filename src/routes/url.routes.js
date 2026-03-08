const router = require("express").Router();
const controller = require("../controllers/url.controller");
const rateLimiter = require("../middlewares/rateLimiter");

/**
 * URL Routes for the Shortener Service.
 * POST /shorten - Protected by Rate Limiter (Limit: 5 requests per 1 minute for local testing).
 * GET /:code - Redirect to the longUrl based on the short code.
 */
router.post("/shorten", rateLimiter(5, 60), controller.createShort);
router.get("/:code", controller.redirect);

module.exports = router;
