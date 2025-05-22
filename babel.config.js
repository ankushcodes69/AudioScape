module.exports = function (api) {
  api.cache(true);
  return {
    plugins: [
      [
        "@babel/plugin-syntax-import-attributes",
        { deprecatedAssertSyntax: true },
      ],
      "@babel/plugin-transform-export-namespace-from",
      [
        "dotenv-import",
        {
          moduleName: "@env",
          path: ".env-guideline-sizes",
          blocklist: null,
          allowlist: null,
          safe: false,
          allowUndefined: false,
        },
      ],
    ],
    presets: ["babel-preset-expo"],
  };
};
