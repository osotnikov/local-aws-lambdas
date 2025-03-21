module.exports = {
  moduleDirectories: ['node_modules', '../node_modules'],
  moduleNameMapper: {
    "/opt/nodejs/lambda-common": "../../lambda-common"
  },
  testMatch: ["**/*.test.ts"],
  testPathIgnorePatterns: [".*infrastructure\.test\.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
};
