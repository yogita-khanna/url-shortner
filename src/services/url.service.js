const URL = require("../models/url.model");
const { encode } = require("../utils/base62");
const { generateID } = require("../utils/idGenerator");

/**
 * Service to handle URL shortening logic.
 * Encapsulates the business logic: ID generation -> Encoding -> Database storage.
 */
exports.createShortURL = async (longUrl) => {
  // 1. Generate a globally unique, distributed Snowflake ID
  const id = generateID();
  
  // 2. Encode the numeric ID into a Base62 string (Short Code)
  const shortCode = encode(id);

  // 3. Store in the database
  const doc = await URL.create({
    shortCode,
    longUrl
  });

  return shortCode;
};

exports.getLongURL = async (shortCode) => {
    return await URL.findOne({ shortCode });
};
