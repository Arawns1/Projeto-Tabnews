const dotenv = require("dotenv");
const nextJest = require("next/jest");
dotenv.config({
  path: ".env.development",
});

const createJestConfig = nextJest({
  dir: ".",
});
const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: 60000,
  watchPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/.git/",
  ],
});

module.exports = jestConfig;
