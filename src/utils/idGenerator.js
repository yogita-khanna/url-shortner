const { Snowflake } = require("@theinternetfolks/snowflake");

/**
 * Generates a globally unique, distributed ID.
 * we use the static 'generate()' method from the library.
 * No need to create a 'new Snowflake()' instance.
 */
exports.generateID = () => {
  return Snowflake.generate();
};
