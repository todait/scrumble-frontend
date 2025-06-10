import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // TypeScript rules (완화된 설정)
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      
      // React rules  
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-no-target-blank": "error",
      "react/no-unescaped-entities": "error",
      
      // General rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      "no-unused-vars": "off", // Use TypeScript version instead
      
      // Import rules (완화된 설정)
      "import/order": "off"
    },
    settings: {
      "import/resolver": {
        "typescript": {}
      }
    }
  }
];

export default eslintConfig;
