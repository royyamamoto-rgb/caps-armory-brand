import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html", "lcov"],
      // Coverage tracks the library surface only. Scripts are orchestrators
      // exercised end-to-end in CI (`pnpm extract-tokens`, `pnpm drift-check`,
      // `pnpm test:tarball`) rather than unit-tested. `src/index.ts` is a
      // pure re-export barrel; `tokens/index.ts` likewise. `contrast-pairs.ts`
      // is a constant table — verified by its consumers in `contrast.test.ts`.
      include: ["src/**/*"],
      exclude: [
        "**/*.d.ts",
        "src/**/index.ts",
        "src/fonts/manifest.ts",
        "src/a11y/contrast-pairs.ts",
        "src/tokens/**",
      ],
      // v8 reports the leading multi-line JSDoc as one uncovered statement —
      // tightening to ignore empty/comment-only lines gives accurate counts.
      ignoreEmptyLines: true,
      thresholds: { statements: 95, branches: 90, functions: 90, lines: 95 }
    }
  }
});
