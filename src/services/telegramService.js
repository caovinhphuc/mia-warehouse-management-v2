import importMetaEnv from "../utils/importMetaEnv";
/**
 * Telegram Service - Kết nối với Backend Telegram API
 */

const API_BASE_URL =
  importMetaEnv.VITE_API_URL ||
  importMetaEnv.REACT_APP_API_URL ||
  "http://localhost:3001";

class TelegramService {
  /**
   * Gửi tin nhắn Telegram qua alerts API
   */
  async sendMessage(message, chatId = null, parseMode = "HTML") {
    try {
      const response = await fetch(`${API_BASE_URL}/api/alerts/telegram`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          chatId:
            chatId ||
            importMetaEnv.VITE_TELEGRAM_CHAT_ID ||
            importMetaEnv.REACT_APP_TELEGRAM_CHAT_ID,
          parseMode,
          disableNotification: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Telegram send failed: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error sending Telegram message:", error);
      throw error;
    }
  }

  /**
   * Gửi tin nhắn đơn giản
   */
  async sendSimpleMessage(text) {
    return this.sendMessage(text);
  }

  /**
   * Gửi tin nhắn với format HTML
   */
  async sendHTMLMessage(htmlContent) {
    return this.sendMessage(htmlContent, null, "HTML");
  }

  /**
   * Gửi tin nhắn với format Markdown
   */
  async sendMarkdownMessage(markdownContent) {
    return this.sendMessage(markdownContent, null, "Markdown");
  }

  /**
   * Test Telegram connection
   */
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/alerts/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: "telegram",
        }),
      });

      if (!response.ok) {
        throw new Error(`Test failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error testing Telegram connection:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const telegramService = new TelegramService();
export default telegramService;
