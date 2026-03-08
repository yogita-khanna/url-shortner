const router = require("express").Router();
const controller = require("../controllers/url.controller");

/**
 * URL Routes for the Shortener Service.
 * POST /shorten - Shorten a given longUrl.
 * GET /:code - Redirect to the longUrl based on the short code.
 */
router.post("/shorten", controller.createShort);
router.get("/:code", controller.redirect);

module.exports = router;
