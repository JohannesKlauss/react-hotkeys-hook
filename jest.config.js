/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
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
