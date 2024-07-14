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
    "prettier/prettier": "error",
    "react/function-component-definition": [
      "error",
      {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function",
      },
    ],
    "import/extensions": ["off", "ignorePackages"],
    "jsx-a11y/no-static-element-interactions": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "react/require-default-props": "off",
    "import/no-extraneous-dependencies": ["error", { "devDependencies": ["**/electron/**", "**/preload/**"] }],
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