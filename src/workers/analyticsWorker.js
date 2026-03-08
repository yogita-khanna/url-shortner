require("dotenv").config();
const redis = require("../config/redis");
const connectDB = require("../config/db");
const Analytics = require("../models/analytics.model");

/**
 * Analytics Worker - The Consumer.
 * Processes events from Redis Queue and saves them to MongoDB.
 * 
 * Logic Level: 
 * Node.js API (Producer) -> LPUSH -> Redis (Broker) -> BRPOP -> Worker (Consumer) -> MongoDB (Store)
 */
const startWorker = async () => {
    // Worker needs its own DB connection.
    await connectDB();
    console.log("🛠️  Analytics worker is running and waiting for events...");

    while (true) {
        try {
            /** 
             * BRPOP: Blocking Right Pop. 
             * It waits indefinitely until an item is available.
             */
            const element = await redis.brPop('analytics_queue', 0);
            
            if (!element) continue;

            // element response: { key: 'analytics_queue', element: '{"shortCode":...}' }
            const eventData = JSON.parse(element.element);
            
            console.log(`[Worker] ✨ Processing Click: ${eventData.shortCode} | IP: ${eventData.metadata.ip}`);
            
            await Analytics.create({
                shortCode: eventData.shortCode,
                metadata: eventData.metadata,
                timestamp: eventData.timestamp
            });

            console.log(`[Worker] ✅ Analytics saved to DB for: ${eventData.shortCode}`);

        } catch (err) {
            console.error("[Worker] ❌ Error processing event:", err.message);
        }
    }
};

startWorker();
