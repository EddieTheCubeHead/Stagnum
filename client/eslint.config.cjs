const react = require("eslint-plugin-react")
const react_refresh = require("eslint-plugin-react-refresh")

module.exports = [
    {
        root: true,
        env: { browser: true, es2020: true },
        extends: [
            "eslint:recommended",
            "plugin:@typescript-eslint/strict-type-checked",
            "plugin:react-hooks/recommended",
            "plugin:@typescript-eslint/stylistic-type-checked",
            "plugin:react/recommended",
            "plugin:react/jsx-runtime",
        ],
        ignorePatterns: ["dist"],
        parser: "@typescript-eslint/parser",
        plugins: [react_refresh, react],
        rules: {
            "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
        },
        globals: {
            __dirname: true,
        },
        parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            project: ["./tsconfig.json", "./tsconfig.node.json"],
            tsconfigRootDir: __dirname,
        },
    },
]
