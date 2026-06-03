import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*", "scripts/**/*"],
      exclude: ["**/*.d.ts", "src/**/index.ts"],
      thresholds: { statements: 95, branches: 90, functions: 90, lines: 95 }
    }
  }
});
