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
  ]),
  // Project-level rule overrides
  {
    rules: {
      // setState in useEffect is a valid pattern for syncing external state / initializing from localStorage
      "react-hooks/set-state-in-effect": "warn",
      // Downgrade no-explicit-any to warn — strict any should be addressed over time
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);

export default eslintConfig;
