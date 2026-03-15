#!/usr/bin/env node
/**
 * Legacy shim: delegates to canonical script in project-root scripts/.
 */
const path = require("path");
const target = path.resolve(
  __dirname,
  "../../scripts",
  path.basename(__filename)
);
module.exports = require(target);
