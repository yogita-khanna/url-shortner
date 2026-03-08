const redis = require("../config/redis");

/**
 * Producer: Pushes click metadata into a Redis List (Queue).
 * Architecture: Event-Driven / Message Broker Pattern.
 */
exports.sendClickEvent = async (shortCode, metadata) => {
    try {
        const payload = JSON.stringify({
            shortCode,
            metadata,
            timestamp: new Date().toISOString()
        });

        // LPUSH: Atomic operation to add message to the tail of the list.
        // Even if the worker is busy, the events are SAFELY buffered in Redis.
        await redis.lPush('analytics_queue', payload);
        
    } catch (err) {
        console.error("[Producer] Failed to push to Redis Queue:", err.message);
    }
};
