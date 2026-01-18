#!/usr/bin/env node

/**
 * Save Webpack Stats
 * Lưu webpack stats từ build process
 */

const fs = require('fs');
const path = require('path');

// This script would be called after build to save stats
// For now, we'll use a simpler approach with webpack-bundle-analyzer CLI

console.log('📊 Webpack stats sẽ được tạo khi build với GENERATE_STATS=true');
console.log(
  '💡 Sử dụng: npm run analyze:build để tự động tạo stats và analyze'
);
