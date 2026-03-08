const URL = require("../models/url.model");
const { encode } = require("../utils/base62");
const { generateID } = require("../utils/idGenerator");
const redis = require("../config/redis");
const { sendClickEvent } = require("../utils/analyticsQueue");

/**
 * Service to handle URL shortening logic.
 * Encapsulates the write path (ID generation -> Base62 -> DB Save -> L1 Cache).
 * Supports Optional Custom Aliases.
 */
exports.createShortURL = async (longUrl, customAlias = null) => {
  let shortCode;

  if (customAlias) {
    const existing = await URL.findOne({ shortCode: customAlias });
    if (existing) {
      throw new Error("Alias already taken. Try another one!");
    }
    shortCode = customAlias;
  } else {
    const id = generateID();
    shortCode = encode(id);
  }

  await URL.create({ shortCode, longUrl });
  await redis.set(shortCode, longUrl, {
    EX: 3600 * 24 // 24 hours cache TTL
  });

  return shortCode;
};

/**
 * Service to handle the read path (Cache-first lookups + Asynchronous Analytics).
 */
exports.resolveURL = async (shortCode, metadata = {}) => {
  const cached = await redis.get(shortCode);
  let longUrl = null;

  if (cached) {
    console.log(`[Service] Cache Hit for: ${shortCode}`);
    longUrl = cached;
  } else {
    console.log(`[Service] Cache Miss for: ${shortCode}, fetching from DB...`);
    const urlEntry = await URL.findOne({ shortCode });
    
    if (urlEntry) {
      longUrl = urlEntry.longUrl;
      await redis.set(shortCode, longUrl, { EX: 3600 * 24 });
    }
  }

  // BIG STEP: Async Analytics (Don't await this, don't block the user!)
  if (longUrl) {
    sendClickEvent(shortCode, metadata); 
  }

  return longUrl;
};
