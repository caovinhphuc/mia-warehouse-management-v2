#!/usr/bin/env node

/**
 * Bundle Analyzer Script
 * Phân tích bundle size và hiển thị visualization
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

function checkBuildDirectory() {
  const buildDir = 'build';
  const jsDir = path.join(buildDir, 'static', 'js');

  if (!fs.existsSync(buildDir)) {
    log('❌ Build directory không tồn tại!', 'red');
    log('💡 Chạy: npm run build trước', 'yellow');
    return false;
  }

  if (!fs.existsSync(jsDir)) {
    log('❌ Thư mục build/static/js không tồn tại!', 'red');
    log('💡 Chạy: npm run build trước', 'yellow');
    return false;
  }

  const jsFiles = fs
    .readdirSync(jsDir)
    .filter((file) => file.endsWith('.js') && !file.endsWith('.map'));

  if (jsFiles.length === 0) {
    log('❌ Không tìm thấy file JavaScript trong build!', 'red');
    log('💡 Chạy: npm run build trước', 'yellow');
    return false;
  }

  log(`✅ Tìm thấy ${jsFiles.length} file JavaScript`, 'green');
  return true;
}

function analyzeBundle() {
  log('📊 Bundle Analyzer', 'cyan');
  log('='.repeat(50), 'cyan');
  console.log('');

  // Check if build exists
  if (!checkBuildDirectory()) {
    process.exit(1);
  }

  // Check if webpack-bundle-analyzer is installed
  try {
    execSync('npx webpack-bundle-analyzer --version', { stdio: 'ignore' });
  } catch (error) {
    log('⚠️  webpack-bundle-analyzer chưa được cài đặt', 'yellow');
    log('📦 Đang cài đặt...', 'cyan');
    try {
      execSync('npm install -g webpack-bundle-analyzer', { stdio: 'inherit' });
      log('✅ Đã cài đặt webpack-bundle-analyzer', 'green');
    } catch (installError) {
      log('❌ Không thể cài đặt webpack-bundle-analyzer', 'red');
      log('💡 Chạy: npm install -g webpack-bundle-analyzer', 'yellow');
      process.exit(1);
    }
  }

  // Get all JS files
  const jsDir = path.join('build', 'static', 'js');
  const jsFiles = fs
    .readdirSync(jsDir)
    .filter((file) => file.endsWith('.js') && !file.endsWith('.map'))
    .map((file) => path.join(jsDir, file));

  if (jsFiles.length === 0) {
    log('❌ Không tìm thấy file JavaScript!', 'red');
    process.exit(1);
  }

  log(`📁 Phân tích ${jsFiles.length} file JavaScript...`, 'cyan');
  console.log('');

  // Show file sizes
  let totalSize = 0;
  jsFiles.forEach((file) => {
    const stats = fs.statSync(file);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    totalSize += stats.size;
    const fileName = path.basename(file);
    log(`  ${fileName.padEnd(50)} ${sizeMB} MB`, 'cyan');
  });

  console.log('');
  log(
    `📊 Tổng kích thước: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`,
    'cyan'
  );
  console.log('');

  // Generate webpack stats.json if not exists
  log('📊 Đang tạo webpack stats...', 'cyan');
  const statsFile = path.join('build', 'bundle-stats.json');

  if (!fs.existsSync(statsFile)) {
    log('⚠️  Không tìm thấy bundle-stats.json', 'yellow');
    log('💡 Cần build với --stats để tạo stats file', 'yellow');
    log('💡 Hoặc sử dụng script phân tích khác:', 'yellow');
    log('   npm run perf:bundle  (phân tích bundle size)', 'cyan');
    log('   npm run perf:deps    (phân tích dependencies)', 'cyan');
    console.log('');

    // Alternative: Use source-map-explorer or just show file sizes
    log('📁 Thông tin Bundle Files:', 'cyan');
    jsFiles.forEach((file) => {
      const stats = fs.statSync(file);
      const sizeKB = (stats.size / 1024).toFixed(2);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      const fileName = path.basename(file);
      const sizeStr =
        stats.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
      log(`  ${fileName.padEnd(50)} ${sizeStr}`, 'cyan');
    });

    console.log('');
    log('💡 Để phân tích chi tiết, chạy:', 'yellow');
    log('   npm run build -- --stats', 'cyan');
    log('   Sau đó chạy lại: npm run analyze', 'cyan');
    return;
  }

  // Run webpack-bundle-analyzer with stats file
  log('🚀 Đang mở webpack-bundle-analyzer...', 'cyan');
  log('💡 Browser sẽ tự động mở với visualization', 'yellow');
  console.log('');

  try {
    log(`📊 Đang phân tích: ${statsFile}`, 'cyan');
    execSync(`npx webpack-bundle-analyzer ${statsFile}`, { stdio: 'inherit' });
  } catch (error) {
    log('❌ Lỗi khi chạy webpack-bundle-analyzer', 'red');
    log(`   ${error.message}`, 'red');
    console.log('');
    log('💡 Thử các cách sau:', 'yellow');
    log('   1. npm install --save-dev webpack-bundle-analyzer', 'cyan');
    log('   2. npm run perf:bundle (phân tích không cần stats)', 'cyan');
    log('   3. npm run perf:deps (phân tích dependencies)', 'cyan');
    process.exit(1);
  }
}

if (require.main === module) {
  analyzeBundle();
}

module.exports = { analyzeBundle, checkBuildDirectory };
