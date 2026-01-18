#!/usr/bin/env node

/**
 * Generate Webpack Bundle Stats
 * Tạo stats.json từ webpack build để phân tích bundle
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateBundleStats() {
  log('📊 Generating Webpack Bundle Stats', 'cyan');
  log('='.repeat(50), 'cyan');
  console.log('');

  const buildDir = 'build';
  const statsFile = path.join(buildDir, 'bundle-stats.json');

  // Check if build exists
  if (!fs.existsSync(buildDir)) {
    log('❌ Build directory không tồn tại!', 'red');
    log('💡 Chạy: npm run build trước', 'yellow');
    process.exit(1);
  }

  log('💡 Để phân tích bundle với webpack-bundle-analyzer:', 'cyan');
  log('   1. Cần build với webpack stats', 'yellow');
  log('   2. Sử dụng source-map-explorer (đơn giản hơn)', 'yellow');
  console.log('');

  log('📦 Đang cài đặt source-map-explorer...', 'cyan');
  try {
    execSync('npm install --save-dev source-map-explorer', {
      stdio: 'inherit',
    });
    log('✅ Đã cài đặt source-map-explorer', 'green');
  } catch (error) {
    log('⚠️  Không thể cài source-map-explorer', 'yellow');
  }

  console.log('');
  log('💡 Cách sử dụng:', 'cyan');
  log('   npm run perf:bundle     (phân tích bundle size - đơn giản)', 'green');
  log('   npm run perf:deps       (phân tích dependencies)', 'green');
  log(
    '   npm run analyze:build   (build + analyze với webpack-bundle-analyzer)',
    'green'
  );
  console.log('');

  log('📝 Lưu ý:', 'yellow');
  log('   webpack-bundle-analyzer cần stats.json từ webpack', 'yellow');
  log('   Để tạo stats, cần cấu hình webpack build process', 'yellow');
  log('   Hoặc sử dụng source-map-explorer (đơn giản hơn)', 'yellow');
}

if (require.main === module) {
  generateBundleStats();
}

module.exports = { generateBundleStats };
