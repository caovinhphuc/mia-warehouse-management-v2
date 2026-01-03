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
