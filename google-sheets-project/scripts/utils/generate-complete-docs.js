#!/usr/bin/env node
/**
 * Generate Complete HTML Documentation
 * Tạo file HTML documentation đầy đủ từ tất cả markdown files
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.join(__dirname, "../..");

// Enhanced markdown to HTML converter
function markdownToHTML(markdown, maxLength = 5000) {
  if (!markdown) return "<p>No content available</p>";

  // Truncate if too long
  let content = markdown;
  if (content.length > maxLength) {
    content =
      content.substring(0, maxLength) + "\n\n... (truncated, see full file for complete content)";
  }

  let html = content
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || "text"}">${escapeHtml(code.trim())}</code></pre>`;
    })
    // Headers
    .replace(/^#### (.*$)/gim, "<h4>$1</h4>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Links
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Horizontal rules
    .replace(/^---$/gim, "<hr>")
    // Lists
    .replace(/^\- (.*$)/gim, "<li>$1</li>")
    .replace(/^(\d+)\. (.*$)/gim, "<li>$2</li>")
    // Tables (basic)
    .replace(/\|(.+)\|/g, (match, row) => {
      const cells = row
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c);
      return "<tr>" + cells.map((c) => `<td>${c}</td>`).join("") + "</tr>";
    });

  // Wrap lists
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

  // Wrap tables
  html = html.replace(/(<tr>.*<\/tr>)/s, "<table>$1</table>");

  // Paragraphs
  const paragraphs = html.split("\n\n").filter((p) => p.trim());
  html = paragraphs
    .map((p) => {
      if (
        p.startsWith("<h") ||
        p.startsWith("<pre") ||
        p.startsWith("<ul") ||
        p.startsWith("<table") ||
        p.startsWith("<hr") ||
        p.startsWith("<li")
      ) {
        return p;
      }
      return `<p>${p}</p>`;
    })
    .join("\n");

  return html;
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function readMarkdown(filename) {
  const filepath = path.join(PROJECT_ROOT, filename);
  try {
    if (fs.existsSync(filepath)) {
      return fs.readFileSync(filepath, "utf8");
    }
  } catch (error) {
    console.warn(`Warning: Could not read ${filename}`);
  }
  return "";
}

// Get project info
function getProjectInfo() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, "package.json"), "utf8"));
    return {
      name: pkg.name || "React OAS Integration",
      version: pkg.version || "4.0.0",
      description: pkg.description || "",
    };
  } catch {
    return {
      name: "React OAS Integration",
      version: "4.0.0",
      description: "AI-Powered Automation Platform",
    };
  }
}

// Main sections with their markdown files
const SECTIONS = [
  {
    id: "overview",
    title: "📋 Tổng Quan",
    icon: "📋",
    file: "README.md",
    description: "Tổng quan về dự án, tính năng chính và kiến trúc hệ thống",
  },
  {
    id: "architecture",
    title: "🏗️ Kiến Trúc",
    icon: "🏗️",
    file: "ARCHITECTURE.md",
    description: "Kiến trúc hệ thống, service inventory và data flows",
  },
  {
    id: "setup",
    title: "⚙️ Setup & Deployment",
    icon: "⚙️",
    file: "DEPLOYMENT_GUIDE.md",
    description: "Hướng dẫn setup, cài đặt và deployment",
  },
  {
    id: "scripts",
    title: "🔧 Scripts Guide",
    icon: "🔧",
    file: "SCRIPTS_GUIDE.md",
    description: "Hướng dẫn sử dụng các scripts trong project",
  },
  {
    id: "python",
    title: "🐍 Python Files",
    icon: "🐍",
    file: "PYTHON_FILES_GUIDE.md",
    description: "Tổ chức và quản lý các file Python",
  },
  {
    id: "javascript",
    title: "📦 JavaScript Files",
    icon: "📦",
    file: "JAVASCRIPT_FILES_GUIDE.md",
    description: "Tổ chức và quản lý các file JavaScript",
  },
  {
    id: "reports",
    title: "📊 Reports & Backups",
    icon: "📊",
    file: "REPORTS_BACKUPS_GUIDE.md",
    description: "Quản lý reports và backups",
  },
  {
    id: "google-sheets",
    title: "📊 Google Sheets",
    icon: "📊",
    file: "GOOGLE_SHEETS_SETUP_GUIDE.md",
    description: "Setup và cấu hình Google Sheets integration",
  },
  {
    id: "websocket",
    title: "🔌 WebSocket",
    icon: "🔌",
    file: "WEBSOCKET_SETUP_GUIDE.md",
    description: "WebSocket setup và real-time communication",
  },
  {
    id: "ui-components",
    title: "🎨 UI Components",
    icon: "🎨",
    file: "UI_COMPONENTS_GUIDE.md",
    description: "UI Components library và hướng dẫn sử dụng",
  },
];

// Generate complete HTML
function generateCompleteHTML() {
  const projectInfo = getProjectInfo();

  // Read all sections
  const sectionsData = SECTIONS.map((section) => {
    const content = readMarkdown(section.file);
    return {
      ...section,
      content: markdownToHTML(content, 10000), // Limit to 10KB per section
    };
  });

  // Generate navigation
  const navLinks = sectionsData
    .map(
      (s) =>
        `                <li><a href="#${s.id}" title="${s.description}">${s.icon} ${s.title}</a></li>`
    )
    .join("\n");

  // Generate sections HTML
  const sectionsHTML = sectionsData
    .map(
      (s) =>
        `            <section id="${s.id}" class="section">
                <div class="section-header">
                    <h2>${s.icon} ${s.title}</h2>
                    <p class="section-description">${s.description}</p>
                </div>
                <div class="section-content">
                    ${s.content || "<p>Content đang được cập nhật...</p>"}
                </div>
                <div class="section-footer">
                    <small>📄 Source: <code>${s.file}</code></small>
                </div>
            </section>`
    )
    .join("\n\n            ");

  return generateHTMLTemplate(projectInfo, navLinks, sectionsHTML);
}

// HTML Template
function generateHTMLTemplate(projectInfo, navLinks, sectionsHTML) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${projectInfo.description}">
    <title>${projectInfo.name} v${projectInfo.version} - Complete Documentation</title>
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
            --info-color: #3498db;
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
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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
            width: 300px;
            background-color: var(--sidebar-bg);
            position: fixed;
            height: 100vh;
            overflow-y: auto;
            padding: 20px 0;
            box-shadow: 2px 0 8px var(--shadow-color);
            z-index: 1000;
            transition: transform 0.3s ease;
        }

        .sidebar::-webkit-scrollbar {
            width: 6px;
        }

        .sidebar::-webkit-scrollbar-track {
            background: var(--sidebar-bg);
        }

        .sidebar::-webkit-scrollbar-thumb {
            background: var(--border-color);
            border-radius: 3px;
        }

        .sidebar-header {
            padding: 0 20px 20px;
            border-bottom: 2px solid var(--border-color);
            margin-bottom: 20px;
        }

        .sidebar-header h2 {
            color: var(--primary-color);
            font-size: 1.5rem;
            margin-bottom: 5px;
        }

        .sidebar-header .version {
            font-size: 0.85em;
            opacity: 0.7;
            color: var(--sidebar-text);
        }

        .nav-links {
            list-style: none;
            padding: 0;
        }

        .nav-links li {
            margin-bottom: 2px;
        }

        .nav-links a {
            display: block;
            padding: 12px 20px;
            color: var(--sidebar-text);
            text-decoration: none;
            border-left: 3px solid transparent;
            transition: all 0.2s ease;
            font-size: 0.95em;
        }

        .nav-links a:hover {
            background-color: var(--sidebar-active);
            border-left-color: var(--primary-color);
            padding-left: 25px;
        }

        .nav-links a.active {
            background-color: var(--sidebar-active);
            border-left-color: var(--primary-color);
            font-weight: 600;
            color: var(--primary-color);
        }

        .main-content {
            flex: 1;
            margin-left: 300px;
            padding: 0;
            max-width: 1400px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 25px 40px;
            background-color: var(--header-bg);
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 2px 8px var(--shadow-color);
            border-bottom: 1px solid var(--border-color);
        }

        .header h1 {
            font-size: 2rem;
            margin: 0;
            color: var(--primary-color);
        }

        .header .subtitle {
            font-size: 0.9em;
            opacity: 0.7;
            margin-top: 5px;
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

        .content-wrapper {
            padding: 30px 40px;
        }

        .section {
            margin-bottom: 50px;
            padding: 30px;
            background-color: var(--card-bg);
            border-radius: 12px;
            box-shadow: 0 4px 6px var(--shadow-color);
            border: 1px solid var(--border-color);
        }

        .section-header {
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid var(--primary-color);
        }

        .section-header h2 {
            font-size: 2rem;
            margin-bottom: 10px;
            color: var(--primary-color);
        }

        .section-description {
            font-size: 1em;
            opacity: 0.8;
            color: var(--text-color);
        }

        .section-content {
            margin-top: 25px;
        }

        .section-footer {
            margin-top: 25px;
            padding-top: 15px;
            border-top: 1px solid var(--border-color);
            font-size: 0.85em;
            opacity: 0.6;
        }

        h1, h2, h3, h4, h5, h6 {
            margin-bottom: 15px;
            color: var(--primary-color);
        }

        h1 {
            font-size: 2.5rem;
        }

        h2 {
            font-size: 2rem;
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
            margin-left: 25px;
            margin-bottom: 15px;
        }

        li {
            margin-bottom: 8px;
        }

        code {
            background-color: var(--code-bg);
            color: var(--code-text);
            padding: 3px 8px;
            border-radius: 4px;
            font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
            font-size: 0.9em;
        }

        pre {
            background-color: var(--code-bg);
            color: var(--code-text);
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 20px 0;
            border: 1px solid var(--border-color);
        }

        pre code {
            background: none;
            padding: 0;
            font-size: 0.9em;
            line-height: 1.5;
        }

        a {
            color: var(--primary-color);
            text-decoration: none;
            border-bottom: 1px solid transparent;
            transition: border-color 0.2s;
        }

        a:hover {
            border-bottom-color: var(--primary-color);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        table th,
        table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }

        table th {
            background-color: var(--code-bg);
            font-weight: 600;
            color: var(--primary-color);
        }

        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: 600;
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

        .badge-info {
            background-color: var(--info-color);
            color: white;
        }

        .tip, .warning, .info {
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid;
        }

        .tip {
            background-color: rgba(52, 152, 219, 0.1);
            border-left-color: var(--info-color);
        }

        .warning {
            background-color: rgba(243, 156, 18, 0.1);
            border-left-color: var(--warning-color);
        }

        .info {
            background-color: rgba(39, 174, 96, 0.1);
            border-left-color: var(--success-color);
        }

        .mobile-header {
            display: none;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background-color: var(--header-bg);
            box-shadow: 0 2px 5px var(--shadow-color);
            position: sticky;
            top: 0;
            z-index: 1001;
        }

        .menu-toggle {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--text-color);
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .last-updated {
            text-align: center;
            padding: 30px;
            color: var(--text-color);
            opacity: 0.7;
            font-size: 0.9em;
            border-top: 2px solid var(--border-color);
            margin-top: 50px;
            background-color: var(--card-bg);
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

            .header {
                padding: 20px;
            }

            .content-wrapper {
                padding: 20px;
            }

            .section {
                padding: 20px;
            }
        }

        /* Print styles */
        @media print {
            .sidebar, .mobile-header, .theme-toggle {
                display: none;
            }

            .main-content {
                margin-left: 0;
            }
        }
    </style>
</head>
<body>
    <div class="mobile-header">
        <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        </button>
        <div class="theme-toggle">
            <span>🌞</span>
            <label class="toggle-switch">
                <input type="checkbox" id="mobileThemeToggle" aria-label="Toggle theme">
                <span class="slider"></span>
            </label>
            <span>🌙</span>
        </div>
    </div>

    <div class="container">
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h2>📚 Documentation</h2>
                <div class="version">${projectInfo.name} v${projectInfo.version}</div>
            </div>
            <ul class="nav-links" id="navLinks">
${navLinks}
            </ul>
        </aside>

        <main class="main-content">
            <header class="header">
                <div>
                    <h1>${projectInfo.name}</h1>
                    <div class="subtitle">${projectInfo.description}</div>
                </div>
                <div class="theme-toggle">
                    <span>🌞</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="themeToggle" aria-label="Toggle theme">
                        <span class="slider"></span>
                    </label>
                    <span>🌙</span>
                </div>
            </header>

            <div class="content-wrapper">
${sectionsHTML}
            </div>

            <div class="last-updated">
                <p><strong>📅 Last Updated:</strong> ${new Date().toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</p>
                <p>🔄 <strong>Auto-generated</strong> from Markdown documentation files</p>
                <p>📝 <strong>Regenerate:</strong> <code>node scripts/utils/generate-complete-docs.js</code></p>
            </div>
        </main>
    </div>

    <script>
        // Theme Toggle
        const themeToggle = document.getElementById('themeToggle');
        const mobileThemeToggle = document.getElementById('mobileThemeToggle');
        const body = document.documentElement;

        const getInitialTheme = () => {
            const savedTheme = localStorage.getItem('docs-theme');
            if (savedTheme) {
                return savedTheme;
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        };

        const applyTheme = (theme) => {
            if (theme === 'dark') {
                body.setAttribute('data-theme', 'dark');
                if (themeToggle) themeToggle.checked = true;
                if (mobileThemeToggle) mobileThemeToggle.checked = true;
            } else {
                body.removeAttribute('data-theme');
                if (themeToggle) themeToggle.checked = false;
                if (mobileThemeToggle) mobileThemeToggle.checked = false;
            }
            localStorage.setItem('docs-theme', theme);
        };

        // Set initial theme
        applyTheme(getInitialTheme());

        // Theme toggle handlers
        if (themeToggle) {
            themeToggle.addEventListener('change', () => {
                applyTheme(themeToggle.checked ? 'dark' : 'light');
            });
        }

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
            const scrollPosition = window.scrollY + 150;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
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
        window.addEventListener('load', setActiveLink);

        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });

                    // Close mobile menu after clicking
                    if (sidebar) {
                        sidebar.classList.remove('active');
                    }
                }
            });
        });

        // Close sidebar when clicking outside (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
    </script>
</body>
</html>`;
}

// Main execution
try {
  console.log("📚 Generating Complete Documentation HTML...");
  const html = generateCompleteHTML();
  const outputPath = path.join(PROJECT_ROOT, "docs.html");
  fs.writeFileSync(outputPath, html, "utf8");
  console.log("✅ Generated docs.html successfully!");
  console.log(`📄 Location: ${outputPath}`);
  console.log(`📊 Sections: ${SECTIONS.length}`);
  console.log("\n💡 Tip: Open docs.html in your browser to view the documentation");
} catch (error) {
  console.error("❌ Error generating HTML:", error);
  process.exit(1);
}
