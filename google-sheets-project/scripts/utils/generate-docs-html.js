#!/usr/bin/env node
/**
 * Generate HTML Documentation from Markdown Files
 * Tự động tạo file HTML documentation từ các file markdown
 */

const fs = require("fs");
const path = require("path");

// Get project root
const PROJECT_ROOT = path.join(__dirname, "../..");

// Documentation files to include
const DOC_FILES = {
  overview: "README.md",
  architecture: "ARCHITECTURE.md",
  architectureGuide: "ARCHITECTURE_GUIDE.md",
  setup: "DEPLOYMENT_GUIDE.md",
  scripts: "SCRIPTS_GUIDE.md",
  python: "PYTHON_FILES_GUIDE.md",
  javascript: "JAVASCRIPT_FILES_GUIDE.md",
  reports: "REPORTS_BACKUPS_GUIDE.md",
  googleSheets: "GOOGLE_SHEETS_SETUP_GUIDE.md",
  websocket: "WEBSOCKET_SETUP_GUIDE.md",
  ui: "UI_COMPONENTS_GUIDE.md",
};

// Simple markdown to HTML converter
function markdownToHTML(markdown) {
  if (!markdown) return "";

  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Lists
    .replace(/^\- (.*$)/gim, "<li>$1</li>")
    .replace(/^(\d+)\. (.*$)/gim, "<li>$2</li>")
    // Links
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Paragraphs
    .split("\n\n")
    .filter((p) => p.trim())
    .map((p) => {
      if (
        p.startsWith("<h") ||
        p.startsWith("<pre") ||
        p.startsWith("<ul") ||
        p.startsWith("<li")
      ) {
        return p;
      }
      return `<p>${p}</p>`;
    })
    .join("\n");

  // Wrap lists
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

  return html;
}

// Read markdown file
function readMarkdown(filename) {
  const filepath = path.join(PROJECT_ROOT, filename);
  try {
    return fs.readFileSync(filepath, "utf8");
  } catch (error) {
    console.warn(`Warning: Could not read ${filename}`);
    return "";
  }
}

// Generate HTML documentation
function generateHTML() {
  const sections = [];

  // Read all documentation
  const docs = {};
  for (const [key, filename] of Object.entries(DOC_FILES)) {
    docs[key] = readMarkdown(filename);
  }

  // Generate sections
  if (docs.overview) {
    sections.push({
      id: "overview",
      title: "📋 Tổng Quan",
      content: markdownToHTML(docs.overview.split("---")[0] + docs.overview.split("---")[1]),
    });
  }

  if (docs.architecture) {
    sections.push({
      id: "architecture",
      title: "🏗️ Kiến Trúc Hệ Thống",
      content: markdownToHTML(docs.architecture),
    });
  }

  if (docs.setup) {
    sections.push({
      id: "setup",
      title: "⚙️ Setup & Deployment",
      content: markdownToHTML(docs.setup),
    });
  }

  if (docs.scripts) {
    sections.push({
      id: "scripts",
      title: "🔧 Scripts Guide",
      content: markdownToHTML(docs.scripts),
    });
  }

  if (docs.python) {
    sections.push({
      id: "python",
      title: "🐍 Python Files",
      content: markdownToHTML(docs.python),
    });
  }

  if (docs.javascript) {
    sections.push({
      id: "javascript",
      title: "📦 JavaScript Files",
      content: markdownToHTML(docs.javascript),
    });
  }

  if (docs.reports) {
    sections.push({
      id: "reports",
      title: "📊 Reports & Backups",
      content: markdownToHTML(docs.reports),
    });
  }

  if (docs.googleSheets) {
    sections.push({
      id: "google-sheets",
      title: "📊 Google Sheets Setup",
      content: markdownToHTML(docs.googleSheets),
    });
  }

  if (docs.websocket) {
    sections.push({
      id: "websocket",
      title: "🔌 WebSocket Setup",
      content: markdownToHTML(docs.websocket),
    });
  }

  if (docs.ui) {
    sections.push({
      id: "ui",
      title: "🎨 UI Components",
      content: markdownToHTML(docs.ui),
    });
  }

  return generateHTMLTemplate(sections);
}

// Generate HTML template
function generateHTMLTemplate(sections) {
  const navLinks = sections
    .map((s) => `<li><a href="#${s.id}">${s.title}</a></li>`)
    .join("\n                ");

  const sectionContent = sections
    .map(
      (s) =>
        `<section id="${s.id}" class="section">
                ${s.content}
            </section>`
    )
    .join("\n\n            ");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React OAS Integration v4.0 - Complete Documentation</title>
    <style>
        :root {
            --primary-color: #3498db;
            --secondary-color: #2980b9;
            --text-color: #333;
            --bg-color: #fff;
            --card-bg: #f8f9fa;
            --border-color: #e1e4e8;
            --code-bg: #f6f8fa;
            --code-text: #24292e;
            --sidebar-bg: #f0f2f5;
            --sidebar-active: #e2e8f0;
            --sidebar-text: #333;
            --header-bg: #fff;
            --shadow-color: rgba(0, 0, 0, 0.1);
            --success-color: #27ae60;
            --warning-color: #f39c12;
            --error-color: #e74c3c;
        }

        [data-theme="dark"] {
            --primary-color: #61dafb;
            --secondary-color: #4fa3d1;
            --text-color: #e1e1e1;
            --bg-color: #121212;
            --card-bg: #1e1e1e;
            --border-color: #2d2d2d;
            --code-bg: #2d2d2d;
            --code-text: #e6e6e6;
            --sidebar-bg: #1a1a1a;
            --sidebar-active: #2d2d2d;
            --sidebar-text: #e1e1e1;
            --header-bg: #1a1a1a;
            --shadow-color: rgba(0, 0, 0, 0.3);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            line-height: 1.6;
        }

        .container {
            display: flex;
            min-height: 100vh;
        }

        .sidebar {
            width: 280px;
            background-color: var(--sidebar-bg);
            position: fixed;
            height: 100vh;
            overflow-y: auto;
            padding: 20px 0;
            box-shadow: 2px 0 5px var(--shadow-color);
            z-index: 10;
            transition: transform 0.3s ease;
        }

        .sidebar-header {
            padding: 0 20px 20px;
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 20px;
        }

        .sidebar-header h2 {
            color: var(--primary-color);
            font-size: 1.5rem;
        }

        .nav-links {
            list-style: none;
        }

        .nav-links li {
            margin-bottom: 5px;
        }

        .nav-links a {
            display: block;
            padding: 10px 20px;
            color: var(--sidebar-text);
            text-decoration: none;
            border-left: 3px solid transparent;
            transition: all 0.2s ease;
        }

        .nav-links a:hover, .nav-links a.active {
            background-color: var(--sidebar-active);
            border-left-color: var(--primary-color);
        }

        .main-content {
            flex: 1;
            margin-left: 280px;
            padding: 20px;
            max-width: 1200px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background-color: var(--header-bg);
            position: sticky;
            top: 0;
            z-index: 5;
            box-shadow: 0 2px 5px var(--shadow-color);
            margin-bottom: 20px;
        }

        .header h1 {
            font-size: 2rem;
            margin: 0;
        }

        .theme-toggle {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 30px;
        }

        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 34px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 22px;
            width: 22px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }

        input:checked + .slider {
            background-color: var(--primary-color);
        }

        input:checked + .slider:before {
            transform: translateX(30px);
        }

        .section {
            margin-bottom: 40px;
            padding: 20px;
            background-color: var(--card-bg);
            border-radius: 8px;
            box-shadow: 0 2px 4px var(--shadow-color);
        }

        h1, h2, h3, h4 {
            margin-bottom: 15px;
            color: var(--primary-color);
        }

        h1 {
            font-size: 2.5rem;
            margin-top: 20px;
        }

        h2 {
            font-size: 2rem;
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 10px;
            margin-top: 30px;
        }

        h3 {
            font-size: 1.5rem;
            margin-top: 25px;
        }

        h4 {
            font-size: 1.25rem;
            margin-top: 20px;
        }

        p {
            margin-bottom: 15px;
        }

        ul, ol {
            margin-left: 20px;
            margin-bottom: 15px;
        }

        li {
            margin-bottom: 8px;
        }

        code {
            background-color: var(--code-bg);
            color: var(--code-text);
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }

        pre {
            background-color: var(--code-bg);
            color: var(--code-text);
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin-bottom: 15px;
        }

        pre code {
            background: none;
            padding: 0;
        }

        a {
            color: var(--primary-color);
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        .card {
            background-color: var(--card-bg);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid var(--border-color);
        }

        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85em;
            font-weight: bold;
            margin-right: 8px;
        }

        .badge-success {
            background-color: var(--success-color);
            color: white;
        }

        .badge-warning {
            background-color: var(--warning-color);
            color: white;
        }

        .badge-error {
            background-color: var(--error-color);
            color: white;
        }

        .tip {
            background-color: #e8f4f8;
            border-left: 4px solid var(--primary-color);
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }

        .warning {
            background-color: #fff3cd;
            border-left: 4px solid var(--warning-color);
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }

        .mobile-header {
            display: none;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background-color: var(--header-bg);
            box-shadow: 0 2px 5px var(--shadow-color);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .menu-toggle {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--text-color);
            padding: 5px;
        }

        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
            }

            .sidebar.active {
                transform: translateX(0);
            }

            .main-content {
                margin-left: 0;
            }

            .mobile-header {
                display: flex;
            }

            .menu-toggle, .mobile-header {
                display: block;
            }
        }

        .last-updated {
            text-align: center;
            padding: 20px;
            color: var(--text-color);
            opacity: 0.7;
            font-size: 0.9em;
            border-top: 1px solid var(--border-color);
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <div class="mobile-header">
        <button class="menu-toggle" id="menuToggle">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        </button>
        <div class="theme-toggle">
            <span>🌞</span>
            <label class="toggle-switch">
                <input type="checkbox" id="mobileThemeToggle">
                <span class="slider"></span>
            </label>
            <span>🌙</span>
        </div>
    </div>

    <div class="container">
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h2>📚 Documentation</h2>
                <p style="font-size: 0.9em; margin-top: 10px; opacity: 0.8;">React OAS Integration v4.0</p>
            </div>
            <ul class="nav-links" id="navLinks">
                ${navLinks}
            </ul>
        </aside>

        <main class="main-content">
            <header class="header">
                <h1>🚀 React OAS Integration v4.0</h1>
                <div class="theme-toggle">
                    <span>🌞</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="themeToggle">
                        <span class="slider"></span>
                    </label>
                    <span>🌙</span>
                </div>
            </header>

            ${sectionContent}

            <div class="last-updated">
                <p>📅 Last Updated: ${new Date().toLocaleDateString("vi-VN")}</p>
                <p>🔄 Auto-generated from Markdown files</p>
            </div>
        </main>
    </div>

    <script>
        // Theme Toggle
        const themeToggle = document.getElementById('themeToggle');
        const mobileThemeToggle = document.getElementById('mobileThemeToggle');
        const body = document.documentElement;

        const getInitialTheme = () => {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme;
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        };

        const applyTheme = (theme) => {
            if (theme === 'dark') {
                body.setAttribute('data-theme', 'dark');
                themeToggle.checked = true;
                if (mobileThemeToggle) mobileThemeToggle.checked = true;
            } else {
                body.removeAttribute('data-theme');
                themeToggle.checked = false;
                if (mobileThemeToggle) mobileThemeToggle.checked = false;
            }
            localStorage.setItem('theme', theme);
        };

        applyTheme(getInitialTheme());

        themeToggle.addEventListener('change', () => {
            applyTheme(themeToggle.checked ? 'dark' : 'light');
        });

        if (mobileThemeToggle) {
            mobileThemeToggle.addEventListener('change', () => {
                applyTheme(mobileThemeToggle.checked ? 'dark' : 'light');
            });
        }

        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Active link highlighting
        const navLinks = document.querySelectorAll('.nav-links a');
        const sections = document.querySelectorAll('.section');

        const setActiveLink = () => {
            let currentSection = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= sectionTop - 100) {
                    currentSection = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === \`#\${currentSection}\`) {
                    link.classList.add('active');
                }
            });
        };

        window.addEventListener('scroll', setActiveLink);

        // Smooth scrolling
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 20,
                        behavior: 'smooth'
                    });

                    if (sidebar) {
                        sidebar.classList.remove('active');
                    }
                }
            });
        });

        setActiveLink();
    </script>
</body>
</html>`;
}

// Main
try {
  const html = generateHTML();
  const outputPath = path.join(PROJECT_ROOT, "docs.html");
  fs.writeFileSync(outputPath, html, "utf8");
  console.log("✅ Generated docs.html successfully!");
  console.log(`📄 Location: ${outputPath}`);
} catch (error) {
  console.error("❌ Error generating HTML:", error);
  process.exit(1);
}
