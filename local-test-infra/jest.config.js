module.exports = {
  modulePathIgnorePatterns: ["cdk.out"],
  testMatch: ["**/*.test.ts"],
  testPathIgnorePatterns: [".*infrastructure\.test\.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
};
