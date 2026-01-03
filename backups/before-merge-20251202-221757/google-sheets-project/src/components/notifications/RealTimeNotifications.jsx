/* eslint-disable */
/**
 * Real-time Notifications Component
 * Receives and displays notifications via WebSocket
 */

import React, { useState, useEffect } from "react";
import { Card, List, Badge, Typography, Tag, Space, Button, Empty } from "antd";
import {
  BellOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useWebSocket } from "../../hooks/useWebSocket";
import "./RealTimeNotifications.css";

const { Title, Text } = Typography;

const RealTimeNotifications = ({ userId = null }) => {
  const { connected, subscribe, unsubscribe, websocket } = useWebSocket(
    userId,
    true,
  );
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to notifications on mount
  useEffect(() => {
    if (connected && userId) {
      websocket.subscribeNotifications(userId);

      // Listen for notifications
      const unsubscribeNotification = subscribe(
        "notification",
        (notification) => {
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        },
      );

      return () => {
        websocket.unsubscribeNotifications(userId);
        unsubscribeNotification();
      };
    }
  }, [connected, userId, subscribe, unsubscribe, websocket]);

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      return prev.filter((n) => n.id !== id);
    });
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "success":
        return "green";
      case "error":
        return "red";
      case "warning":
        return "orange";
      case "info":
        return "blue";
      default:
        return "default";
    }
  };

  return (
    <Card className="realtime-notifications">
      <div className="notifications-header">
        <Title level={4}>
          <BellOutlined /> Real-time Notifications
        </Title>
        <Space>
          <Tag color={connected ? "green" : "red"}>
            {connected ? "🟢 Connected" : "🔴 Disconnected"}
          </Tag>
          {unreadCount > 0 && (
            <Badge count={unreadCount} showZero={false}>
              <Text type="secondary">{unreadCount} unread</Text>
            </Badge>
          )}
          {notifications.length > 0 && (
            <Space>
              <Button size="small" onClick={markAllAsRead}>
                Mark all as read
              </Button>
              <Button size="small" danger onClick={clearAll}>
                Clear all
              </Button>
            </Space>
          )}
        </Space>
      </div>

      {notifications.length === 0 ? (
        <Empty
          description="No notifications yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          className="notifications-list"
          dataSource={notifications}
          renderItem={(notification, index) => (
            <List.Item
              className={`notification-item ${!notification.read ? "unread" : ""}`}
              actions={[
                !notification.read && (
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() => markAsRead(notification.id)}
                  >
                    Read
                  </Button>
                ),
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => deleteNotification(notification.id)}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <span style={{ fontSize: 24 }}>
                    {getNotificationIcon(notification.type || "info")}
                  </span>
                }
                title={
                  <Space>
                    <Tag
                      color={getNotificationColor(notification.type || "info")}
                    >
                      {notification.type || "info"}
                    </Tag>
                    <Text strong>{notification.title || "Notification"}</Text>
                    {!notification.read && <Badge dot color="red" />}
                  </Space>
                }
                description={
                  <div>
                    <Text>{notification.message || notification.content}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {notification.timestamp
                        ? new Date(notification.timestamp).toLocaleString(
                            "vi-VN",
                          )
                        : "Just now"}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default RealTimeNotifications;
