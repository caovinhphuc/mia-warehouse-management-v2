#!/usr/bin/env node

/**
 * 🏥 React Google Integration - Health Check Script
 *
 * Script kiểm tra sức khỏe của ứng dụng và các services
 * Bao gồm: Google APIs, Email service, Telegram, Database connections
 */

const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

// Console logging functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}🔍 ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.magenta}${msg}${colors.reset}\n`),
}

// Health check results
const healthResults = {
  timestamp: new Date().toISOString(),
  overall: 'healthy',
  services: {},
  errors: [],
  warnings: [],
}

// Utility functions
const addResult = (service, status, message, details = null) => {
  healthResults.services[service] = {
    status,
    message,
    details,
    timestamp: new Date().toISOString(),
  }

  if (status === 'error') {
    healthResults.errors.push({ service, message, details })
    healthResults.overall = 'unhealthy'
  } else if (status === 'warning') {
    healthResults.warnings.push({ service, message, details })
    if (healthResults.overall === 'healthy') {
      healthResults.overall = 'degraded'
    }
  }
}

const checkEnvironmentVariables = () => {
  log.step('Kiểm tra Environment Variables...')

  const requiredVars = [
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID',
  ]

  const optionalVars = [
    'REACT_APP_GOOGLE_MAPS_API_KEY',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID',
    'SENDGRID_API_KEY',
    'EMAIL_FROM',
    'SMTP_USER',
    'SMTP_PASS',
    'REDIS_URL',
  ]

  const missingRequired = requiredVars.filter((varName) => !process.env[varName])
  const missingOptional = optionalVars.filter((varName) => !process.env[varName])

  if (missingRequired.length > 0) {
    addResult(
      'environment',
      'error',
      `Missing required environment variables: ${missingRequired.join(', ')}`,
    )
    return false
  }

  if (missingOptional.length > 0) {
    addResult(
      'environment',
      'warning',
      `Missing optional environment variables: ${missingOptional.join(', ')}`,
    )
  } else {
    addResult('environment', 'healthy', 'All environment variables configured')
  }

  return true
}

const checkGoogleSheetsAPI = async () => {
  log.step('Kiểm tra Google Sheets API...')

  try {
    const { GoogleAuth } = require('google-auth-library')
    const { google } = require('googleapis')

    // Create credentials object
    const credentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
    }

    // Initialize auth
    const auth = new GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const authClient = await auth.getClient()
    const sheets = google.sheets({ version: 'v4', auth: authClient })

    // Test connection
    const sheetId = process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID
    const response = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    })

    addResult(
      'google-sheets',
      'healthy',
      `Connected to Google Sheets: "${response.data.properties.title}"`,
      {
        sheetId,
        title: response.data.properties.title,
        sheetsCount: response.data.sheets.length,
      },
    )

    return true
  } catch (error) {
    addResult('google-sheets', 'error', `Google Sheets API connection failed: ${error.message}`, {
      error: error.message,
      code: error.code,
    })
    return false
  }
}

const checkGoogleDriveAPI = async () => {
  log.step('Kiểm tra Google Drive API...')

  try {
    const { GoogleAuth } = require('google-auth-library')
    const { google } = require('googleapis')

    // Create credentials object
    const credentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
    }

    // Initialize auth
    const auth = new GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    })

    const authClient = await auth.getClient()
    const drive = google.drive({ version: 'v3', auth: authClient })

    // Test connection
    const response = await drive.about.get({ fields: 'user' })

    addResult(
      'google-drive',
      'healthy',
      `Connected to Google Drive: ${response.data.user.displayName}`,
      {
        user: response.data.user.displayName,
        email: response.data.user.emailAddress,
      },
    )

    return true
  } catch (error) {
    addResult('google-drive', 'error', `Google Drive API connection failed: ${error.message}`, {
      error: error.message,
      code: error.code,
    })
    return false
  }
}

const checkEmailService = async () => {
  log.step('Kiểm tra Email Service...')

  // Check SendGrid first (preferred method)
  const sendgridApiKey = process.env.SENDGRID_API_KEY
  if (sendgridApiKey) {
    try {
      const axios = require('axios')

      const response = await axios.get('https://api.sendgrid.com/v3/user/profile', {
        headers: {
          Authorization: `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      })

      if (response.status === 200) {
        addResult('email-service', 'healthy', 'SendGrid API connection successful', {
          service: 'SendGrid',
          username: response.data.username,
          email: response.data.email,
        })
        return true
      }
    } catch (error) {
      // If SendGrid fails, try SMTP as fallback
      addResult(
        'email-service',
        'warning',
        `SendGrid API failed: ${error.message}, trying SMTP fallback`,
        { error: error.message },
      )
    }
  }

  // Fallback to SMTP if SendGrid not available or failed
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = require('nodemailer')

      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      // Test connection
      await transporter.verify()

      addResult('email-service', 'healthy', 'SMTP email service connection successful', {
        service: 'SMTP',
        host: process.env.SMTP_HOST,
        user: process.env.SMTP_USER,
      })
      return true
    } catch (error) {
      addResult('email-service', 'error', `SMTP connection failed: ${error.message}`, {
        error: error.message,
      })
      return false
    }
  }

  // No email service configured
  addResult('email-service', 'warning', 'No email service configured (neither SendGrid nor SMTP)', {
    sendgrid_configured: !!sendgridApiKey,
    smtp_configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
  })
  return false
}

const checkTelegramService = async () => {
  log.step('Kiểm tra Telegram Service...')

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    addResult('telegram-service', 'warning', 'Telegram service not configured')
    return false
  }

  try {
    const axios = require('axios')

    const response = await axios.get(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`,
    )

    if (response.data.ok) {
      addResult(
        'telegram-service',
        'healthy',
        `Telegram bot connected: ${response.data.result.first_name}`,
        {
          botName: response.data.result.first_name,
          username: response.data.result.username,
        },
      )
      return true
    } else {
      throw new Error('Invalid bot token')
    }
  } catch (error) {
    addResult('telegram-service', 'error', `Telegram service connection failed: ${error.message}`, {
      error: error.message,
    })
    return false
  }
}

const checkFileSystem = () => {
  log.step('Kiểm tra File System...')

  const requiredFiles = ['package.json', '.env', 'src/App.jsx']

  const requiredDirs = ['src', 'src/components', 'src/services', 'public']

  const missingFiles = requiredFiles.filter((file) => !fs.existsSync(file))
  const missingDirs = requiredDirs.filter((dir) => !fs.existsSync(dir))

  if (missingFiles.length > 0 || missingDirs.length > 0) {
    addResult(
      'file-system',
      'error',
      `Missing files/directories: ${[...missingFiles, ...missingDirs].join(', ')}`,
    )
    return false
  }

  addResult('file-system', 'healthy', 'All required files and directories present')
  return true
}

const checkDependencies = () => {
  log.step('Kiểm tra Dependencies...')

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const nodeModulesExists = fs.existsSync('node_modules')

    if (!nodeModulesExists) {
      addResult('dependencies', 'error', 'node_modules directory not found. Run npm install')
      return false
    }

    // Check for critical dependencies
    const criticalDeps = ['react', 'googleapis', 'google-auth-library']
    const missingDeps = criticalDeps.filter(
      (dep) => !packageJson.dependencies[dep] && !packageJson.devDependencies[dep],
    )

    if (missingDeps.length > 0) {
      addResult(
        'dependencies',
        'warning',
        `Missing critical dependencies: ${missingDeps.join(', ')}`,
      )
    } else {
      addResult('dependencies', 'healthy', 'All critical dependencies present')
    }

    return true
  } catch (error) {
    addResult('dependencies', 'error', `Error checking dependencies: ${error.message}`)
    return false
  }
}

const generateHealthReport = () => {
  log.header('🏥 HEALTH CHECK REPORT')

  const statusColor = {
    healthy: colors.green,
    degraded: colors.yellow,
    unhealthy: colors.red,
  }

  console.log(`
${
  statusColor[healthResults.overall]
}Overall Status: ${healthResults.overall.toUpperCase()}${colors.reset}
${colors.blue}Timestamp: ${healthResults.timestamp}${colors.reset}

${colors.cyan}📊 Service Status:${colors.reset}
`)

  Object.entries(healthResults.services).forEach(([service, result]) => {
    const statusIcon = {
      healthy: '✅',
      warning: '⚠️',
      error: '❌',
    }

    console.log(`${statusIcon[result.status]} ${service}: ${result.message}`)
    if (result.details) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`)
    }
  })

  if (healthResults.warnings.length > 0) {
    console.log(`\n${colors.yellow}⚠️  Warnings:${colors.reset}`)
    healthResults.warnings.forEach((warning) => {
      console.log(`   - ${warning.service}: ${warning.message}`)
    })
  }

  if (healthResults.errors.length > 0) {
    console.log(`\n${colors.red}❌ Errors:${colors.reset}`)
    healthResults.errors.forEach((error) => {
      console.log(`   - ${error.service}: ${error.message}`)
    })
  }

  // Recommendations
  console.log(`\n${colors.cyan}💡 Recommendations:${colors.reset}`)

  if (healthResults.overall === 'unhealthy') {
    console.log('   - Fix all errors before deploying to production')
    console.log('   - Check environment variables configuration')
    console.log('   - Verify Google Service Account permissions')
  } else if (healthResults.overall === 'degraded') {
    console.log('   - Address warnings for optimal performance')
    console.log('   - Consider configuring optional services')
  } else {
    console.log('   - All systems are healthy! Ready for production')
    console.log('   - Consider setting up monitoring and alerts')
  }

  // Save report to file
  const reportFile = `health-report-${new Date().toISOString().split('T')[0]}.json`
  fs.writeFileSync(reportFile, JSON.stringify(healthResults, null, 2))
  console.log(`\n${colors.blue}📄 Health report saved to: ${reportFile}${colors.reset}`)
}

const main = async () => {
  log.header('🏥 REACT GOOGLE INTEGRATION - HEALTH CHECK')

  try {
    // Run all health checks
    checkFileSystem()
    checkDependencies()
    checkEnvironmentVariables()

    // Only run API checks if environment is configured
    if (healthResults.services.environment?.status !== 'error') {
      await checkGoogleSheetsAPI()
      await checkGoogleDriveAPI()
      await checkEmailService()
      await checkTelegramService()
    }

    // Generate and display report
    generateHealthReport()

    // Exit with appropriate code
    process.exit(healthResults.overall === 'unhealthy' ? 1 : 0)
  } catch (error) {
    log.error(`Health check failed: ${error.message}`)
    process.exit(1)
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log.warning('\nHealth check interrupted')
  process.exit(0)
})

// Run main function
if (require.main === module) {
  main()
}

module.exports = {
  checkEnvironmentVariables,
  checkGoogleSheetsAPI,
  checkGoogleDriveAPI,
  checkEmailService,
  checkTelegramService,
  checkFileSystem,
  checkDependencies,
  generateHealthReport,
}
