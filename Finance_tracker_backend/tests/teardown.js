const { sequelize } = require("../config/db");

module.exports = async () => {
  try {
    await sequelize.close();
  } catch (e) {
    // ignore teardown errors
  }
};
