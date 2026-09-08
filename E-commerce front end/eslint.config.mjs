import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Artefatos do Playwright.
    "test-results/**",
    "playwright-report/**",
  ]),
  {
    rules: {
      // A interface fala por toasts e estados de erro; log em produção é ruído.
      // `console.warn`/`console.error` seguem liberados para falhas de verdade.
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
]);

export default eslintConfig;
