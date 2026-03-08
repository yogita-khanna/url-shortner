/**
 * Shard Router - Logical Sharding Logic.
 * This determines which database node (Shard) handles a specific shortCode.
 * 
 * In a real massive system, we'd have Shard1_URI, Shard2_URI, etc.
 */

// We'll simulate 2 shards for now
const NUM_SHARDS = 2;

/**
 * Consistent Hashing / Range Partitioning Logic.
 * Simple Approach: Take the first character of the code and hash it.
 */
exports.getShardId = (shortCode) => {
  if (!shortCode) return 0;
  
  // String ko unique number (hash) mein convert karne ka logic:
  let hash = 0;
  for (let i = 0; i < shortCode.length; i++) {
    /**
     * (hash << 5) - hash: Yeh shortcut hai hash * 31 ka. 
     * Bitwise operations multiplication se fast hote hain.
     */
    hash = (hash << 5) - hash + shortCode.charCodeAt(i);
    
    /**
     * hash |= 0: Yeh float number ko 32-bit integer mein convert karne ki cool truck hai.
     * Isse hash hamesha ek whole number rehta hai.
     */
    hash |= 0; 
  }
  
  // Return either 0 or 1 (the Shard Index)
  const shardId = Math.abs(hash) % NUM_SHARDS;
  
  return shardId;
};

/**
 * In a real scenario, this would return a specific Mongoose connection.
 * exports.getDbConnection = (shardId) => connections[shardId];
 */
