const path = require("path");
const CONFIG = require("../config/config");


let sequelize;

jest.setTimeout(30000);

beforeAll(async () => {
  // Each test file gets its own Sequelize instance so we can safely close it
  // in afterAll without breaking other suites.
  delete require.cache[require.resolve("../config/db")];
  delete require.cache[require.resolve("../models")];

  ({ sequelize } = require("../config/db"));

  // Ensure models + associations are registered
  require("../models");

  // Use force: true for tests to ensure clean schema and avoid "Too many keys" error with alter: true
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  if (sequelize) {
    await sequelize.close();
  }
});

beforeEach(async () => {
  // MySQL + FKs: truncate needs FK checks disabled
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

  const models = Object.values(sequelize.models);
  for (const model of models) {
    // TRUNCATE is fastest; restartIdentity is handled by TRUNCATE in MySQL
    await model.truncate();
  }

  await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
});
