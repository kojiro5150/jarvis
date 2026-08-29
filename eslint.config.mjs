import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // Next 16's React Hooks plugin introduces additional compiler-era rules
      // that were not part of JARVIS's pre-upgrade lint contract. Preserve the
      // existing behavioral boundary during this framework/security migration;
      // assess these rules separately rather than refactoring working UI here.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
