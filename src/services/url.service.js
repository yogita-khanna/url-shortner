const URL = require("../models/url.model");
const { encode } = require("../utils/base62");
const { generateID } = require("../utils/idGenerator");
const redis = require("../config/redis");
const { sendClickEvent } = require("../utils/analyticsQueue");
const { getShardId } = require("../utils/shardRouter");

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

  // Identify the Shard (Consistent Hashing)
  const shardId = getShardId(shortCode);
  console.log(`[Sharding] Logic: ${shortCode} will be stored in Shard: ${shardId}`);

  // Persist to MongoDB (In real life, this would use ShardDB_${shardId} connection)
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
    // Cache Miss - Need to find which Shard has this URL
    const shardId = getShardId(shortCode);
    console.log(`[Sharding] Cache Miss! Querying Shard: ${shardId} for code: ${shortCode}`);
    
    // In real life (we are using only one DB for now): urlEntry = await ShardDB[shardId].findOne({ shortCode });
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
