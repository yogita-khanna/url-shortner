const { Snowflake } = require("@theinternetfolks/snowflake");

const snowflake = new Snowflake();

exports.generateID = () => {
  return snowflake.nextId();
};
