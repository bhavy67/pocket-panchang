// Lint enforces architecture rules, not just style (ADR 0015).
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const PURE = ["packages/engine/src/**", "packages/calendar/src/**"];

// Real colour values only, so strings like "#today" and plain text don't match.
const RAW_COLOUR = String.raw`/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/`;

const importRule = (paths, patterns) => [
  "error",
  {
    paths,
    patterns: patterns.map((group) => ({
      group,
      message:
        "Dependency direction is app → calendar → (engine, i18n); i18n → engine types only (ADR 0015).",
    })),
  },
];

export default tseslint.config(
  { ignores: ["**/dist/**", "**/coverage/**", ".agents/**", "docs/**"] },

  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
    },
  },
  { files: ["**/*.js"], ...tseslint.configs.disableTypeChecked },

  // §5.2 rule 1 and 3: engine and calendar are pure; time zones only at the UI edge.
  {
    files: PURE,
    rules: {
      "no-restricted-globals": [
        "error",
        ...["window", "document", "indexedDB", "Intl"].map((name) => ({
          name,
          message: "engine/calendar are pure (§5.2): no DOM, storage, or Intl.",
        })),
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message:
            "Pass the instant in; no Date.now() in pure packages (§5.2).",
        },
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message:
            "Pass the instant in; no argument-less new Date() in pure packages (§5.2).",
        },
        {
          selector:
            "MemberExpression[object.name='Math'][property.name='random']",
          message: "No Math.random in pure packages (§5.2).",
        },
      ],
    },
  },

  // §5.2 rule 5: dependency direction.
  {
    files: ["packages/engine/src/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": importRule(
        [],
        [["@panchang/*"]],
      ),
    },
  },
  {
    files: ["packages/i18n/src/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": importRule(
        [
          {
            name: "@panchang/engine",
            allowTypeImports: true,
            message: "i18n may import engine types only (ADR 0015).",
          },
        ],
        [["@panchang/calendar", "@panchang/app"]],
      ),
    },
  },
  {
    files: ["packages/calendar/src/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": importRule(
        [],
        [["@panchang/app"]],
      ),
    },
  },

  // App: hooks, accessibility, and no raw colours outside tokens.css (ADR 0017).
  {
    files: ["apps/app/src/**/*.{ts,tsx}"],
    ...reactHooks.configs.flat["recommended-latest"],
  },
  {
    files: ["apps/app/src/**/*.{ts,tsx}"],
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    files: ["apps/app/src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: `Literal[value=${RAW_COLOUR}]`,
          message:
            "Raw colour: use a semantic token (ADR 0017). Raw colours live only in tokens.css.",
        },
        {
          selector: `TemplateElement[value.raw=${RAW_COLOUR}]`,
          message:
            "Raw colour: use a semantic token (ADR 0017). Raw colours live only in tokens.css.",
        },
      ],
    },
  },

  prettier,
);
