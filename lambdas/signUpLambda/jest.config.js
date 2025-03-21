module.exports = {
  moduleDirectories: ['node_modules', '../node_modules'],
  moduleNameMapper: {
    "/opt/nodejs/util-logger": "../../util-logger"
  },
  testMatch: ["**/*.test.ts"],
  testPathIgnorePatterns: [".*infrastructure\.test\.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
};
