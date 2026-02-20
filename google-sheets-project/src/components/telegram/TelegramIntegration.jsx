import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Loading from "../Common/Loading";
import { telegramService } from "../../services/telegramService";
import { message } from "antd";
import "./TelegramIntegration.css";

const TelegramIntegration = () => {
  const { loading, error } = useSelector((state) => state.auth);
  const { isAuthenticated, serviceAccount } = useSelector(
    (state) => state.auth,
  );

  const [botInfo, setBotInfo] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [messageType, setMessageType] = useState("text"); // text, photo, document
  const [isConnected, setIsConnected] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [showSendModal, setShowSendModal] = useState(false);

  // Sample data
  const sampleBotInfo = {
    id: "8434038911",
    username: "mia_logistics_bot",
    first_name: "MIA Logistics Bot",
    can_join_groups: true,
    can_read_all_group_messages: false,
    supports_inline_queries: false,
  };

  const sampleChats = [
    {
      id: "-4818209867",
      type: "group",
      title: "MIA Logistics Team",
      username: "mia_logistics_team",
      member_count: 15,
      last_activity: "2024-01-15T10:30:00Z",
    },
    {
      id: "123456789",
      type: "private",
      first_name: "Nguyễn Văn A",
      username: "nguyenvana",
      last_activity: "2024-01-14T15:45:00Z",
    },
    {
      id: "987654321",
      type: "private",
      first_name: "Trần Thị B",
      username: "tranthib",
      last_activity: "2024-01-13T09:20:00Z",
    },
  ];

  const sampleMessages = [
    {
      id: 1,
      chat_id: "-4818209867",
      text: "Báo cáo hàng ngày đã được tạo thành công!",
      date: "2024-01-15T10:30:00Z",
      from: "bot",
      message_type: "text",
    },
    {
      id: 2,
      chat_id: "-4818209867",
      text: "Có 5 đơn hàng mới cần xử lý",
      date: "2024-01-15T09:15:00Z",
      from: "bot",
      message_type: "text",
    },
    {
      id: 3,
      chat_id: "-4818209867",
      text: "Hệ thống backup đã hoàn thành",
      date: "2024-01-15T08:00:00Z",
      from: "bot",
      message_type: "text",
    },
  ];

  useEffect(() => {
    setBotInfo(sampleBotInfo);
    setChats(sampleChats);
    setMessages(sampleMessages);
    setIsConnected(true);
  }, []);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    const chatMessages = messages.filter((msg) => msg.chat_id === chat.id);
    setMessages(chatMessages);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageData = {
      id: Date.now(),
      chat_id: selectedChat.id,
      text: newMessage,
      date: new Date().toISOString(),
      from: "user",
      message_type: messageType,
    };

    setMessages((prev) => [messageData, ...prev]);
    setNewMessage("");
    setShowSendModal(false);

    try {
      // Send via backend API
      const result = await telegramService.sendMessage(
        newMessage,
        selectedChat.id,
        messageType === "text" ? "HTML" : "HTML",
      );

      if (result.success) {
        message.success("Tin nhắn đã được gửi thành công!");

        const botResponse = {
          id: Date.now() + 1,
          chat_id: selectedChat.id,
          text: "✅ Tin nhắn đã được gửi thành công!",
          date: new Date().toISOString(),
          from: "bot",
          message_type: "text",
        };
        setMessages((prev) => [botResponse, ...prev]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      message.error(`Lỗi gửi tin nhắn: ${error.message}`);

      const errorResponse = {
        id: Date.now() + 1,
        chat_id: selectedChat.id,
        text: `❌ Lỗi: ${error.message}`,
        date: new Date().toISOString(),
        from: "bot",
        message_type: "error",
      };
      setMessages((prev) => [errorResponse, ...prev]);
    }
  };

  const handleSetWebhook = () => {
    if (!webhookUrl.trim()) return;

    // Simulate webhook setup
    console.log("Setting webhook to:", webhookUrl);
    alert("Webhook đã được thiết lập thành công!");
  };

  const handleDeleteWebhook = () => {
    setWebhookUrl("");
    console.log("Webhook deleted");
    alert("Webhook đã được xóa!");
  };

  const handleSendBulkMessage = () => {
    if (!newMessage.trim()) return;

    const bulkMessages = chats.map((chat) => ({
      id: Date.now() + Math.random(),
      chat_id: chat.id,
      text: newMessage,
      date: new Date().toISOString(),
      from: "user",
      message_type: messageType,
    }));

    setMessages((prev) => [...bulkMessages, ...prev]);
    setNewMessage("");
    setShowSendModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getChatDisplayName = (chat) => {
    if (chat.type === "group") {
      return chat.title;
    }
    return `${chat.first_name} ${chat.last_name || ""}`.trim();
  };

  const getChatIcon = (chat) => {
    return chat.type === "group" ? "👥" : "👤";
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-state">Lỗi: {error}</div>;

  return (
    <div className="telegram-container">
      {/* Header */}
      <div className="telegram-header">
        <div className="header-left">
          <h1>💬 Telegram Bot</h1>
          <p>Quản lý và gửi thông báo qua Telegram</p>
        </div>

        <div className="header-right">
          <div className="connection-status">
            <div
              className={`status-dot ${
                isConnected ? "connected" : "disconnected"
              }`}
            ></div>
            <span>{isConnected ? "Đã kết nối" : "Chưa kết nối"}</span>
          </div>
        </div>
      </div>

      <div className="telegram-content">
        {/* Bot Info */}
        <div className="bot-info-card">
          <div className="card-header">
            <h3>🤖 Thông tin Bot</h3>
          </div>
          <div className="card-body">
            {botInfo && (
              <div className="bot-details">
                <div className="bot-avatar">🤖</div>
                <div className="bot-info">
                  <div className="bot-name">{botInfo.first_name}</div>
                  <div className="bot-username">@{botInfo.username}</div>
                  <div className="bot-id">ID: {botInfo.id}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Webhook Settings */}
        <div className="webhook-card">
          <div className="card-header">
            <h3>🔗 Cài đặt Webhook</h3>
          </div>
          <div className="card-body">
            <div className="webhook-form">
              <input
                type="url"
                placeholder="Nhập URL webhook..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="webhook-input"
              />
              <div className="webhook-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleSetWebhook}
                  disabled={!webhookUrl.trim()}
                >
                  Thiết lập Webhook
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteWebhook}
                  disabled={!webhookUrl.trim()}
                >
                  Xóa Webhook
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chats and Messages */}
        <div className="chats-messages-container">
          {/* Chats List */}
          <div className="chats-sidebar">
            <div className="sidebar-header">
              <h3>💬 Danh sách Chat</h3>
              <span className="chat-count">{chats.length} chats</span>
            </div>

            <div className="chats-list">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-item ${
                    selectedChat?.id === chat.id ? "active" : ""
                  }`}
                  onClick={() => handleChatSelect(chat)}
                >
                  <div className="chat-icon">{getChatIcon(chat)}</div>
                  <div className="chat-info">
                    <div className="chat-name">{getChatDisplayName(chat)}</div>
                    <div className="chat-meta">
                      {chat.type === "group"
                        ? `${chat.member_count} thành viên`
                        : "Tin nhắn riêng"}
                    </div>
                    <div className="chat-last-activity">
                      {formatDate(chat.last_activity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="messages-area">
            {selectedChat ? (
              <>
                <div className="messages-header">
                  <div className="chat-title">
                    <span className="chat-icon">
                      {getChatIcon(selectedChat)}
                    </span>
                    <span>{getChatDisplayName(selectedChat)}</span>
                  </div>
                  <div className="message-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowSendModal(true)}
                    >
                      ✉️ Gửi tin nhắn
                    </button>
                  </div>
                </div>

                <div className="messages-list">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message-item ${
                        message.from === "bot" ? "bot-message" : "user-message"
                      }`}
                    >
                      <div className="message-content">
                        <div className="message-text">{message.text}</div>
                        <div className="message-time">
                          {formatDate(message.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-chat-selected">
                <div className="empty-icon">💬</div>
                <h3>Chọn một chat để xem tin nhắn</h3>
                <p>Chọn từ danh sách bên trái để bắt đầu trò chuyện</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Message Modal */}
      {showSendModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Gửi tin nhắn</h3>
              <button
                className="close-btn"
                onClick={() => setShowSendModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Loại tin nhắn</label>
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                  className="select-field"
                >
                  <option value="text">Văn bản</option>
                  <option value="photo">Hình ảnh</option>
                  <option value="document">Tài liệu</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nội dung tin nhắn</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập nội dung tin nhắn..."
                  className="textarea-field"
                  rows="4"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowSendModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                Gửi tin nhắn
              </button>
              <button
                className="btn btn-warning"
                onClick={handleSendBulkMessage}
                disabled={!newMessage.trim()}
              >
                Gửi tất cả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelegramIntegration;
