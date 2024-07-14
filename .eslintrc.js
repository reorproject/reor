module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "airbnb",
    "airbnb/hooks",
    "airbnb-typescript",
    "plugin:prettier/recommended",
    "plugin:tailwindcss/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "import",
    "jsx-a11y",
    "unused-imports",
    "prettier",
    "tailwindcss",
  ],
  rules: {
    "unused-imports/no-unused-imports": "error",
    // eslint-disable import/extensions:
    // "unused-imports/no-unused-vars": [
    //   "warn",
    //   {
    //     vars: "all",
    //     varsIgnorePattern: "^_",
    //     args: "after-used",
    //     argsIgnorePattern: "^_",
    //   },
    // ],
    "prettier/prettier": "error",
    "react/function-component-definition": [
      "error",
      {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function",
      },
    ],
    "import/extensions": ["off", "ignorePackages"],
    "jsx-a11y/no-static-element-interactions": "off", // Add this line to disable the rule
    "jsx-a11y/click-events-have-key-events": "off", // Add this line to disable the rule
    "react/require-default-props": "off",
  },
  ignorePatterns: ["vite.config.ts", ".eslintrc.js"],
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
};