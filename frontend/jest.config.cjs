const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  testMatch: [
    "**/tests/**/*.ts?(x)",
    "**/?(*.)+(spec|test).ts?(x)",
    "**/*.(spec|test).ts?(x)"
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^../config/api$": "<rootDir>/tests/__mocks__/apiMock.ts",
    "^@/config/api$": "<rootDir>/tests/__mocks__/apiMock.ts",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: "tsconfig.test.json",
    }],
  },
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["lcov", "text", "text-summary"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
    "!src/config/api.ts"
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 72,
      lines: 79,
    },
    // Per-file thresholds for well-tested modules (relaxed for others until more tests added)
    "./src/services/jwtUtils.ts": {
      statements: 95,
      branches: 80,
      functions: 100,
      lines: 95,
    },
    "./src/components/ProtectedRoute/*.tsx": {
      statements: 95,
      branches: 85,
      functions: 100,
      lines: 95,
    },
    "./src/components/AuthForm/*.tsx": {
      statements: 80,
      branches: 65,
      functions: 100,
      lines: 80,
    },
    "./src/pages/dashboard/*.tsx": {
      statements: 80,
      branches: 70,
      functions: 100,
      lines: 80,
    },
  },
};
