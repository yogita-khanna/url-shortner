const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Encodes a number (including BigInt) into Base62 string.
 * This is crucial for URL shorteners to create short, unique codes from numeric IDs.
 * @param {number|bigint|string} num 
 * @returns {string}
 */
exports.encode = function(num) {
  let n = BigInt(num);
  if (n === 0n) return chars[0];
  let str = "";
  while (n > 0n) {
    str = chars[Number(n % 62n)] + str;
    n = n / 62n;
  }
  return str;
};
