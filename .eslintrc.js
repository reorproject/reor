module.exports = {
  root: true,
  ignorePatterns: [".eslintrc.js"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      extends: [
        "plugin:@typescript-eslint/strict-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
        "plugin:prettier/recommended",
        "plugin:tailwindcss/recommended",
        "plugin:electron/recommended",
      ],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
      },
      plugins: ["@typescript-eslint", "prettier", "tailwindcss", "electron"],
      rules: {
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/no-misused-promises": "off",
        "prettier/prettier": "error",
      },
    },
    {
      files: ["*.js", "*.jsx"],
      extends: [
        "eslint:recommended",
        "plugin:prettier/recommended",
        "plugin:tailwindcss/recommended",
        "plugin:electron/recommended",
      ],
      env: {
        node: true,
      },
    },
  ],
};
