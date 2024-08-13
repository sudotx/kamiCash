module.exports = {
  preset: "ts-jest",
  testEnvironment: "node", // or 'jsdom' if you are testing browser-specific code
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  // other configurations like coverage, testPathIgnorePatterns, etc.
};
