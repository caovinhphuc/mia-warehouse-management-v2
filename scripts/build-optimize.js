#!/usr/bin/env node

/**
 * Build Optimization Script for MIA.vn Google Integration
 * Optimizes the production build for better performance
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logInfo(message) {
  log(`[INFO] ${message}`, 'green');
}

function logWarn(message) {
  log(`[WARN] ${message}`, 'yellow');
}

function logError(message) {
  log(`[ERROR] ${message}`, 'red');
}

function logSuccess(message) {
  log(`[SUCCESS] ${message}`, 'cyan');
}

// Build optimization functions
function optimizeBuild() {
  logInfo('Starting build optimization...');

  try {
    // 1. Clean previous build
    logInfo('Cleaning previous build...');
    if (fs.existsSync('build')) {
      fs.rmSync('build', { recursive: true, force: true });
    }

    // 2. Set production environment variables
    logInfo('Setting production environment variables...');
    process.env.NODE_ENV = 'production';
    process.env.GENERATE_SOURCEMAP = 'false';
    process.env.INLINE_RUNTIME_CHUNK = 'false';
    process.env.IMAGE_INLINE_SIZE_LIMIT = '0';

    // 3. Run production build
    logInfo('Running production build...');
    execSync('npm run build', { stdio: 'inherit' });

    // 4. Optimize build files
    logInfo('Optimizing build files...');
    optimizeBuildFiles();

    // 5. Generate build report
    logInfo('Generating build report...');
    generateBuildReport();

    logSuccess('Build optimization completed successfully!');

  } catch (error) {
    logError(`Build optimization failed: ${error.message}`);
    process.exit(1);
  }
}

function optimizeBuildFiles() {
  const buildDir = 'build';

  if (!fs.existsSync(buildDir)) {
    throw new Error('Build directory not found');
  }

  // Optimize HTML files
  optimizeHtmlFiles(buildDir);

  // Optimize CSS files
  optimizeCssFiles(buildDir);

  // Optimize JS files
  optimizeJsFiles(buildDir);

  // Optimize images
  optimizeImages(buildDir);

  // Add security headers
  addSecurityHeaders(buildDir);
}

function optimizeHtmlFiles(buildDir) {
  logInfo('Optimizing HTML files...');

  const htmlFiles = findFiles(buildDir, '.html');

  htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Remove comments
    content = content.replace(/<!--[\s\S]*?-->/g, '');

    // Minify inline CSS and JS
    content = content.replace(/<style[^>]*>([\s\S]*?)<\/style>/g, (match, css) => {
      const minifiedCss = css.replace(/\s+/g, ' ').trim();
      return `<style>${minifiedCss}</style>`;
    });

    // Add preload hints for critical resources
    if (file.endsWith('index.html')) {
      const preloadLinks = `
    <link rel="preload" href="/static/css/main.css" as="style">
    <link rel="preload" href="/static/js/main.js" as="script">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
`;
      content = content.replace('</head>', `${preloadLinks}</head>`);
    }

    fs.writeFileSync(file, content);
  });

  logSuccess(`Optimized ${htmlFiles.length} HTML files`);
}

function optimizeCssFiles(buildDir) {
  logInfo('Optimizing CSS files...');

  const cssFiles = findFiles(buildDir, '.css');

  cssFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Remove comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');

    // Remove unnecessary whitespace
    content = content.replace(/\s+/g, ' ').trim();

    // Remove empty rules
    content = content.replace(/[^{}]+{\s*}/g, '');

    fs.writeFileSync(file, content);
  });

  logSuccess(`Optimized ${cssFiles.length} CSS files`);
}

function optimizeJsFiles(buildDir) {
  logInfo('Optimizing JavaScript files...');

  const jsFiles = findFiles(buildDir, '.js');

  jsFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Remove console.log statements in production
    content = content.replace(/console\.(log|debug|info)\([^)]*\);?/g, '');

    // Remove debugger statements
    content = content.replace(/debugger;?/g, '');

    fs.writeFileSync(file, content);
  });

  logSuccess(`Optimized ${jsFiles.length} JavaScript files`);
}

function optimizeImages(buildDir) {
  logInfo('Optimizing images...');

  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
  const imageFiles = [];

  imageExtensions.forEach(ext => {
    imageFiles.push(...findFiles(buildDir, ext));
  });

  // Note: For production, you might want to use tools like imagemin
  // This is a placeholder for image optimization
  logInfo(`Found ${imageFiles.length} image files (optimization placeholder)`);
}

function addSecurityHeaders(buildDir) {
  logInfo('Adding security headers...');

  // Create .htaccess file for Apache
  const htaccessContent = `
# Security Headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"

# Cache Control
<FilesMatch "\\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, immutable"
</FilesMatch>

# Gzip Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
`;

  fs.writeFileSync(path.join(buildDir, '.htaccess'), htaccessContent);

  logSuccess('Security headers added');
}

function generateBuildReport() {
  const buildDir = 'build';
  const report = {
    timestamp: new Date().toISOString(),
    buildSize: getDirectorySize(buildDir),
    files: {
      html: findFiles(buildDir, '.html').length,
      css: findFiles(buildDir, '.css').length,
      js: findFiles(buildDir, '.js').length,
      images: findFiles(buildDir, '.png').length + findFiles(buildDir, '.jpg').length + findFiles(buildDir, '.svg').length
    },
    optimization: {
      sourceMaps: false,
      minification: true,
      compression: true,
      securityHeaders: true
    }
  };

  fs.writeFileSync('build-report.json', JSON.stringify(report, null, 2));

  logSuccess('Build report generated: build-report.json');
  logInfo(`Build size: ${formatBytes(report.buildSize)}`);
  logInfo(`Files: ${report.files.html} HTML, ${report.files.css} CSS, ${report.files.js} JS, ${report.files.images} Images`);
}

function findFiles(dir, extension) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith(extension)) {
        files.push(fullPath);
      }
    });
  }

  traverse(dir);
  return files;
}

function getDirectorySize(dir) {
  let size = 0;

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else {
        size += stat.size;
      }
    });
  }

  traverse(dir);
  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Main execution
if (require.main === module) {
  log('🚀 MIA.vn Google Integration - Build Optimizer', 'cyan');
  log('================================================', 'cyan');

  optimizeBuild();
}

module.exports = { optimizeBuild };
