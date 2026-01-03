const axios = require('axios')
const fs = require('fs')
require('dotenv').config()

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}🔄${colors.reset} ${msg}`),
}

class TelegramTester {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN
    this.chatId = process.env.TELEGRAM_CHAT_ID
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`
    this.results = []
  }

  addResult(test, status, message, details = null) {
    this.results.push({
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString(),
    })

    const statusIcon = status === 'success' ? '✅' : status === 'error' ? '❌' : '⚠️'
    const color =
      status === 'success' ? colors.green : status === 'error' ? colors.red : colors.yellow

    console.log(`${color}${statusIcon}${colors.reset} ${test}: ${message}`)

    if (details) {
      console.log(`   ${colors.dim}Details: ${JSON.stringify(details, null, 2)}${colors.reset}`)
    }
  }

  async checkEnvironmentVariables() {
    log.step('Kiểm tra Environment Variables...')

    const required = [
      { key: 'TELEGRAM_BOT_TOKEN', description: 'Telegram Bot Token' },
      { key: 'TELEGRAM_CHAT_ID', description: 'Chat ID để test' },
    ]

    let allPresent = true
    const missing = []

    for (const { key, description } of required) {
      if (!process.env[key]) {
        missing.push({ key, description })
        allPresent = false
      }
    }

    if (allPresent) {
      this.addResult(
        'environment-check',
        'success',
        'Tất cả environment variables cần thiết đã có',
        { required_count: required.length },
      )
      return true
    } else {
      this.addResult(
        'environment-check',
        'error',
        `Thiếu ${missing.length} environment variables`,
        { missing },
      )
      return false
    }
  }

  async getBotInfo() {
    log.step('Lấy thông tin Bot...')

    try {
      const response = await axios.get(`${this.apiUrl}/getMe`)

      if (response.data.ok) {
        const botInfo = response.data.result
        this.addResult('bot-info', 'success', `Bot kết nối thành công: ${botInfo.first_name}`, {
          id: botInfo.id,
          username: botInfo.username,
          first_name: botInfo.first_name,
          can_join_groups: botInfo.can_join_groups,
          can_read_all_group_messages: botInfo.can_read_all_group_messages,
          supports_inline_queries: botInfo.supports_inline_queries,
        })
        return botInfo
      } else {
        throw new Error(`Telegram API error: ${response.data.description}`)
      }
    } catch (error) {
      this.addResult('bot-info', 'error', `Không thể lấy thông tin bot: ${error.message}`, {
        error: error.message,
      })
      return null
    }
  }

  async checkWebhookInfo() {
    log.step('Kiểm tra Webhook...')

    try {
      const response = await axios.get(`${this.apiUrl}/getWebhookInfo`)

      if (response.data.ok) {
        const webhookInfo = response.data.result
        const hasWebhook = webhookInfo.url && webhookInfo.url.length > 0

        this.addResult(
          'webhook-info',
          hasWebhook ? 'success' : 'warning',
          hasWebhook ? 'Webhook đã được cấu hình' : 'Chưa cấu hình webhook',
          {
            url: webhookInfo.url,
            has_custom_certificate: webhookInfo.has_custom_certificate,
            pending_update_count: webhookInfo.pending_update_count,
            last_error_date: webhookInfo.last_error_date,
            last_error_message: webhookInfo.last_error_message,
          },
        )
        return webhookInfo
      }
    } catch (error) {
      this.addResult('webhook-info', 'error', `Không thể kiểm tra webhook: ${error.message}`, {
        error: error.message,
      })
      return null
    }
  }

  async sendTestMessage() {
    log.step('Gửi tin nhắn test...')

    if (!this.chatId) {
      this.addResult('send-message', 'error', 'Không có TELEGRAM_CHAT_ID để test')
      return false
    }

    const testMessage = `🧪 Test message từ MIA Logistics Bot
⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}
🚀 Hệ thống: MIA.vn Google Integration
✅ Status: Testing Telegram functionality`

    try {
      const response = await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: this.chatId,
        text: testMessage,
        parse_mode: 'Markdown',
      })

      if (response.data.ok) {
        const messageInfo = response.data.result
        this.addResult('send-message', 'success', `Tin nhắn test đã được gửi thành công`, {
          message_id: messageInfo.message_id,
          chat_id: messageInfo.chat.id,
          chat_type: messageInfo.chat.type,
          chat_title:
            messageInfo.chat.title ||
            `${messageInfo.chat.first_name} ${messageInfo.chat.last_name || ''}`.trim(),
          date: new Date(messageInfo.date * 1000).toISOString(),
        })
        return true
      } else {
        throw new Error(`Telegram API error: ${response.data.description}`)
      }
    } catch (error) {
      this.addResult('send-message', 'error', `Không thể gửi tin nhắn test: ${error.message}`, {
        error: error.message,
      })
      return false
    }
  }

  async getChatInfo() {
    log.step('Lấy thông tin Chat...')

    if (!this.chatId) {
      this.addResult('chat-info', 'warning', 'Không có TELEGRAM_CHAT_ID để lấy thông tin')
      return null
    }

    try {
      const response = await axios.get(`${this.apiUrl}/getChat`, {
        params: { chat_id: this.chatId },
      })

      if (response.data.ok) {
        const chatInfo = response.data.result
        this.addResult(
          'chat-info',
          'success',
          `Thông tin chat lấy thành công: ${chatInfo.title || chatInfo.first_name}`,
          {
            id: chatInfo.id,
            type: chatInfo.type,
            title: chatInfo.title,
            first_name: chatInfo.first_name,
            last_name: chatInfo.last_name,
            username: chatInfo.username,
            description: chatInfo.description,
            member_count: chatInfo.member_count,
          },
        )
        return chatInfo
      } else {
        throw new Error(`Telegram API error: ${response.data.description}`)
      }
    } catch (error) {
      this.addResult('chat-info', 'error', `Không thể lấy thông tin chat: ${error.message}`, {
        error: error.message,
      })
      return null
    }
  }

  async testFileUpload() {
    log.step('Test upload file...')

    if (!this.chatId) {
      this.addResult('file-upload', 'warning', 'Không có TELEGRAM_CHAT_ID để test upload')
      return false
    }

    // Tạo file test tạm thời
    const testReportData = {
      title: 'MIA Logistics - Test Report',
      generated_at: new Date().toISOString(),
      bot_status: 'operational',
      integration_status: 'active',
      test_results: this.results,
      environment: {
        bot_token: this.botToken ? 'configured' : 'missing',
        chat_id: this.chatId ? 'configured' : 'missing',
      },
    }

    const reportPath = './telegram-test-report.json'

    try {
      // Tạo file report
      fs.writeFileSync(reportPath, JSON.stringify(testReportData, null, 2))

      // Upload file
      const FormData = require('form-data')
      const form = new FormData()
      form.append('chat_id', this.chatId)
      form.append('document', fs.createReadStream(reportPath))
      form.append('caption', '📄 Test Report từ MIA Logistics Bot')

      const response = await axios.post(`${this.apiUrl}/sendDocument`, form, {
        headers: form.getHeaders(),
      })

      if (response.data.ok) {
        const fileInfo = response.data.result.document
        this.addResult('file-upload', 'success', `File test đã được upload thành công`, {
          file_id: fileInfo.file_id,
          file_name: fileInfo.file_name,
          file_size: fileInfo.file_size,
          mime_type: fileInfo.mime_type,
        })

        // Xóa file tạm
        fs.unlinkSync(reportPath)
        return true
      } else {
        throw new Error(`Telegram API error: ${response.data.description}`)
      }
    } catch (error) {
      // Xóa file tạm nếu có lỗi
      if (fs.existsSync(reportPath)) {
        fs.unlinkSync(reportPath)
      }

      this.addResult('file-upload', 'error', `Không thể upload file test: ${error.message}`, {
        error: error.message,
      })
      return false
    }
  }

  async runAllTests() {
    console.log(`${colors.bright}🚀 TELEGRAM INTEGRATION TEST${colors.reset}`)
    console.log('='.repeat(50))

    // Kiểm tra environment variables
    const envCheck = await this.checkEnvironmentVariables()
    if (!envCheck) {
      console.log(`\n${colors.red}❌ Test dừng lại do thiếu environment variables${colors.reset}`)
      return this.generateReport()
    }

    // Các test khác
    await this.getBotInfo()
    await this.checkWebhookInfo()
    await this.getChatInfo()
    await this.sendTestMessage()
    await this.testFileUpload()

    return this.generateReport()
  }

  generateReport() {
    const report = {
      title: 'Telegram Integration Test Report',
      timestamp: new Date().toISOString(),
      summary: {
        total_tests: this.results.length,
        passed: this.results.filter((r) => r.status === 'success').length,
        failed: this.results.filter((r) => r.status === 'error').length,
        warnings: this.results.filter((r) => r.status === 'warning').length,
      },
      configuration: {
        bot_token: this.botToken ? 'configured' : 'missing',
        chat_id: this.chatId ? 'configured' : 'missing',
        api_url: this.apiUrl,
      },
      results: this.results,
    }

    console.log('\n' + '='.repeat(50))
    console.log(`${colors.bright}📊 KẾT QUA TEST${colors.reset}`)
    console.log('='.repeat(50))

    console.log(`${colors.green}✅ Passed: ${report.summary.passed}${colors.reset}`)
    console.log(`${colors.red}❌ Failed: ${report.summary.failed}${colors.reset}`)
    console.log(`${colors.yellow}⚠️ Warnings: ${report.summary.warnings}${colors.reset}`)
    console.log(`📊 Total: ${report.summary.total_tests}`)

    // Lưu report
    const reportPath = `telegram-test-report-${new Date().toISOString().split('T')[0]}.json`
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Report đã được lưu: ${reportPath}`)

    if (report.summary.failed > 0) {
      console.log(
        `\n${colors.red}❌ Có lỗi trong quá trình test Telegram integration${colors.reset}`,
      )
      process.exit(1)
    } else {
      console.log(`\n${colors.green}🎉 Telegram integration test thành công!${colors.reset}`)
      process.exit(0)
    }
  }
}

// Main execution
async function main() {
  try {
    const tester = new TelegramTester()
    await tester.runAllTests()
  } catch (error) {
    console.error(`${colors.red}❌ Lỗi không mong muốn: ${error.message}${colors.reset}`)
    console.error(error.stack)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = TelegramTester
