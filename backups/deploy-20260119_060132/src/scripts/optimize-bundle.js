#!/usr/bin/env node

/**
 * Bundle Optimization Script
 * Phân tích và đề xuất tối ưu hóa bundle size
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
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Performance budgets (theo bytes)
const BUDGETS = {
  javascript: 250 * 1024, // 250 KB
  css: 50 * 1024, // 50 KB
  images: 500 * 1024, // 500 KB
  fonts: 100 * 1024, // 100 KB
  total: 1 * 1024 * 1024, // 1 MB
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  if (!fs.existsSync(dirPath)) return 0;

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      totalSize += getDirectorySize(filePath);
    } else {
      totalSize += stat.size;
    }
  });

  return totalSize;
}

function getFileSize(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  return fs.statSync(filePath).size;
}

function getLargestFiles(dirPath, limit = 10) {
  const files = [];

  function scanDirectory(currentPath) {
    if (!fs.existsSync(currentPath)) return;

    const items = fs.readdirSync(currentPath);

    items.forEach((item) => {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        scanDirectory(itemPath);
      } else {
        files.push({
          path: itemPath,
          size: stat.size,
          name: item,
        });
      }
    });
  }

  scanDirectory(dirPath);

  return files
    .sort((a, b) => b.size - a.size)
    .slice(0, limit)
    .map((file) => ({
      ...file,
      sizeFormatted: formatBytes(file.size),
    }));
}

function analyzeBundle(buildDir = 'build') {
  log('\n📊 PHÂN TÍCH BUNDLE SIZE', 'cyan');
  log('='.repeat(60), 'cyan');
  console.log('');

  if (!fs.existsSync(buildDir)) {
    log('❌ Build directory không tồn tại!', 'red');
    log('💡 Chạy: npm run build trước', 'yellow');
    process.exit(1);
  }

  const staticDir = path.join(buildDir, 'static');
  const jsDir = path.join(staticDir, 'js');
  const cssDir = path.join(staticDir, 'css');

  // Tính tổng kích thước
  const jsSize = getDirectorySize(jsDir);
  const cssSize = getDirectorySize(cssDir);
  const imageSize = getDirectorySize(path.join(staticDir, 'media'));
  const fontSize = getDirectorySize(path.join(staticDir, 'fonts'));
  const totalSize = jsSize + cssSize + imageSize + fontSize;

  // Hiển thị kết quả
  log('📦 Kích Thước Bundle:', 'blue');
  console.log('');

  function checkBudget(name, size, budget) {
    const percentage = ((size / budget) * 100).toFixed(1);
    const status = size > budget ? '❌' : '✅';
    const color = size > budget ? 'red' : 'green';
    log(
      `${status} ${name.padEnd(10)}: ${formatBytes(size).padStart(10)} / ${formatBytes(budget).padStart(10)} (${percentage}%)`,
      color
    );
  }

  checkBudget('JAVASCRIPT', jsSize, BUDGETS.javascript);
  checkBudget('CSS', cssSize, BUDGETS.css);
  checkBudget('IMAGES', imageSize, BUDGETS.images);
  checkBudget('FONTS', fontSize, BUDGETS.fonts);
  checkBudget('TOTAL', totalSize, BUDGETS.total);

  console.log('');

  // Top files
  log('📁 Top Files Lớn Nhất:', 'blue');
  console.log('');

  const largestFiles = getLargestFiles(buildDir, 15);
  largestFiles.forEach((file, index) => {
    const relativePath = path.relative(buildDir, file.path);
    log(
      `  ${(index + 1).toString().padStart(2)}. ${relativePath.padEnd(50)} ${file.sizeFormatted.padStart(10)}`,
      'cyan'
    );
  });

  console.log('');

  // Recommendations
  log('💡 Đề Xuất Tối Ưu Hóa:', 'yellow');
  console.log('');

  const recommendations = [];

  if (jsSize > BUDGETS.javascript) {
    recommendations.push({
      priority: 'HIGH',
      issue: 'JavaScript bundle quá lớn',
      solutions: [
        '✅ Đã có lazy loading trong App.jsx - cần cải thiện thêm',
        '🔍 Kiểm tra dependencies lớn: antd, recharts, socket.io-client',
        '📦 Sử dụng dynamic imports cho các components không cần thiết ngay',
        '🗑️  Xóa unused imports và dependencies',
        '⚡ Sử dụng tree-shaking để loại bỏ code không dùng',
        '📚 Code splitting theo routes thay vì chỉ components',
      ],
    });
  }

  if (cssSize > BUDGETS.css) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'CSS bundle quá lớn',
      solutions: [
        '🎨 Import chỉ các component Ant Design cần thiết',
        '📝 Sử dụng CSS modules thay vì global CSS',
        '🗑️  Xóa unused CSS classes',
        '🔧 Sử dụng PurgeCSS để loại bỏ CSS không dùng',
      ],
    });
  }

  if (totalSize > BUDGETS.total) {
    recommendations.push({
      priority: 'HIGH',
      issue: 'Tổng bundle size vượt quá budget',
      solutions: [
        '📊 Sử dụng source-map-explorer để phân tích chi tiết',
        '🔍 Chạy: npm run analyze:bundle',
        '⚡ Tối ưu hóa images (WebP, compression)',
        '📦 Chỉ load libraries khi cần (lazy loading)',
        '🗜️  Enable gzip/brotli compression trên server',
      ],
    });
  }

  recommendations.forEach((rec, index) => {
    const priorityColor = rec.priority === 'HIGH' ? 'red' : 'yellow';
    log(`\n${index + 1}. ${rec.issue}`, priorityColor);
    rec.solutions.forEach((sol) => {
      log(`   ${sol}`, 'cyan');
    });
  });

  console.log('');

  // Scripts để chạy
  log('🚀 Scripts Để Phân Tích:', 'blue');
  console.log('');
  log(
    '   1. npm run analyze:bundle    - Phân tích bundle với source-map-explorer',
    'green'
  );
  log('   2. npm run build:stats       - Build với webpack stats', 'green');
  log('   3. npm run perf:check        - Kiểm tra performance', 'green');
  console.log('');

  // Dependencies lớn cần kiểm tra
  log('📚 Dependencies Có Thể Tối Ưu:', 'yellow');
  console.log('');

  const largeDeps = [
    {
      name: 'antd',
      suggestion: "Import từng component: import Button from 'antd/es/button'",
    },
    { name: 'recharts', suggestion: 'Lazy load chart components' },
    {
      name: 'socket.io-client',
      suggestion: 'Chỉ load khi cần WebSocket connection',
    },
    {
      name: 'react-grid-layout',
      suggestion: 'Lazy load chỉ khi cần dashboard customization',
    },
    {
      name: '@ant-design/icons',
      suggestion: "Import từng icon: import { Icon } from '@ant-design/icons'",
    },
  ];

  largeDeps.forEach((dep) => {
    log(`   • ${dep.name.padEnd(25)} → ${dep.suggestion}`, 'cyan');
  });

  console.log('');

  return {
    sizes: {
      javascript: jsSize,
      css: cssSize,
      images: imageSize,
      fonts: fontSize,
      total: totalSize,
    },
    largestFiles,
    recommendations,
  };
}

function generateOptimizationReport(analysis) {
  const reportPath = path.join(process.cwd(), 'BUNDLE_OPTIMIZATION_REPORT.md');

  const report = `# 📊 Bundle Optimization Report

**Generated:** ${new Date().toLocaleString('vi-VN')}

## 📦 Bundle Sizes

| Type | Current | Budget | Status |
|------|---------|--------|--------|
| JavaScript | ${formatBytes(analysis.sizes.javascript)} | ${formatBytes(BUDGETS.javascript)} | ${analysis.sizes.javascript > BUDGETS.javascript ? '❌ OVER' : '✅ OK'} |
| CSS | ${formatBytes(analysis.sizes.css)} | ${formatBytes(BUDGETS.css)} | ${analysis.sizes.css > BUDGETS.css ? '❌ OVER' : '✅ OK'} |
| Images | ${formatBytes(analysis.sizes.images)} | ${formatBytes(BUDGETS.images)} | ${analysis.sizes.images > BUDGETS.images ? '❌ OVER' : '✅ OK'} |
| Total | ${formatBytes(analysis.sizes.total)} | ${formatBytes(BUDGETS.total)} | ${analysis.sizes.total > BUDGETS.total ? '❌ OVER' : '✅ OK'} |

## 📁 Top Largest Files

\`\`\`
${analysis.largestFiles.map((f, i) => `${i + 1}. ${path.relative('build', f.path)} - ${f.sizeFormatted}`).join('\n')}
\`\`\`

## 💡 Recommendations

${analysis.recommendations
  .map(
    (rec, i) => `
### ${i + 1}. ${rec.issue} [${rec.priority}]

${rec.solutions.map((sol) => `- ${sol.replace(/^[✅🔍📦🗑️⚡📚🎨📝🔧📊🔍⚡📦🗜️]+\s*/, '')}`).join('\n')}
`
  )
  .join('\n')}

## 🚀 Next Steps

1. Run detailed analysis: \`npm run analyze:bundle\`
2. Review and implement recommendations
3. Rebuild and verify improvements

---

*Auto-generated by optimize-bundle.js*
`;

  fs.writeFileSync(reportPath, report, 'utf8');
  log(`📄 Report đã được tạo: ${reportPath}`, 'green');
}

// Main
if (require.main === module) {
  try {
    const analysis = analyzeBundle();
    generateOptimizationReport(analysis);

    log('\n✅ Phân tích hoàn tất!', 'green');
    log('💡 Xem chi tiết trong: BUNDLE_OPTIMIZATION_REPORT.md', 'cyan');
  } catch (error) {
    log(`\n❌ Lỗi: ${error.message}`, 'red');
    process.exit(1);
  }
}

module.exports = { analyzeBundle, formatBytes, BUDGETS };
