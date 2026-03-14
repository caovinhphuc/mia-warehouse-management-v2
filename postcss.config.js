/**
 * =============================================================================
 * 🎨 PostCSS Configuration - MIA.vn Google Integration Platform
 * =============================================================================
 * PostCSS configuration for CSS processing
 * =============================================================================
 */

module.exports = {
  plugins: [
    require("autoprefixer")({
      overrideBrowserslist: [
        ">0.2%",
        "not dead",
        "not op_mini all",
        "not ie <= 11",
      ],
    }),
    // cssnano will be added in production builds
    ...(process.env.NODE_ENV === "production"
      ? [
          require("@fullhuman/postcss-purgecss")({
            content: [
              "./index.html",
              "./login.html",
              "./src/**/*.{js,jsx,ts,tsx}",
            ],
            safelist: { greedy: [/^ant-/, /^rc-/, /^css-/, /^adm-/, /^antd-/] },
          }),
          require("cssnano")({
            preset: [
              "default",
              {
                discardComments: {
                  removeAll: true,
                },
                normalizeWhitespace: true,
              },
            ],
          }),
        ]
      : []),
  ],
};
