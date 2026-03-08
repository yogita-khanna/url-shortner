/**
 * Yeh hamari "A-B-C" hai short URL ke liye.
 * Total 62 characters hain: 10 numbers (0-9) + 26 lowercase (a-z) + 26 uppercase (A-Z).
 * Inhe use karke hum bade numbers ko bohot chhota bana sakte hain.
 */
const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Massively bade numbers (Snowflake IDs) ko chhotu short code mein badalne ka tareeka.
 * Logic: Bilkul waise hi jaise hum school mein 10 ko Binary (0 aur 1) mein badalte the.
 */
exports.encode = function(num) {
  // 1. BigInt use kar rahe hain kyunki Snowflake IDs itne bade hote hain ki simple JS Number unhe handles nahi kar sakta.
  // JavaScript ke simple Number 15 digits ke baad "pagal" ho jate hain, isiliye BigInt() safe hai.
  let n = BigInt(num);

  // 2. Agar ID zero hai, toh sidha pehla character '0' return kar do.
  if (n === 0n) return chars[0];

  let str = "";

  // 3. Jab tak number 0 nahi ho jata, tab tak ise 62 se divide karte rahenge.
  while (n > 0n) {
    /**
     * Logic Simple Hai:
     * - (n % 62n): Yeh humein batata hai ki kitna "Remainder" (bacha hua) hai.
     *              Maano 125 ko 62 se divide kiya toh 1 bacha. Toh yeh '1' hamara INDEX ban jayega.
     * 
     * - chars[Number(...)]: Hum iss Index se apni ABCD (chars variable) se ek letter uthayenge.
     * 
     * - letters + str: Har naye letter ko hum string ke START mein lagate jayenge.
     */
    str = chars[Number(n % 62n)] + str;

    /**
     * Number ko chhota karte jao:
     * n = n / 62n: BigInt mein division karne par decimal khud hi hat jata hai.
     * Isse hum next position wala letter dhoondne ke liye taiyaar ho jate hain.
     */
    n = n / 62n;
  }

  // Final result (e.g., "aX8")
  return str;
};
