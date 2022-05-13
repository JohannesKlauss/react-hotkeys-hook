/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    "<rootDir>/setupTests.ts"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/documentation/"
  ]
};
