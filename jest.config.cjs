process.env.NODE_ENV = "test";
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          module: "commonjs",
          types: ["node", "jest", "@testing-library/jest-dom"],
        },
      },
    ],
  },
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
};
