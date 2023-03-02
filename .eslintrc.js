module.exports = {
    env: {
        browser: true,
        node: true,
        es2020: true,
        "jest/globals": true,
    },
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ["prettier", "jest"],
    extends: ["plugin:import/errors", "plugin:import/warnings", "prettier"],
    rules: {},
    settings: {
        "import/resolver": {
            node: {
                paths: ["~"],
            },
        },
    },
};
