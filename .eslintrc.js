module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "react/prop-types": "off",
      },
    },
    {
      // Applies to all files
      files: ["*"],
      rules: {
        // "@typescript-eslint/no-unused-vars": "warn",
        // "react/no-unescaped-entities": "warn",
        // ... add other specific rules you want as warnings here ...
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "react"],
  rules: {},
};
