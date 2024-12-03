export default {
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "@swc/jest",
  },
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
