/* eslint-disable */
/**
 * Google Sheets Collaborative Editing Component
 * Real-time collaboration on Google Sheets data
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, Typography, Tag, Space, Input, Button, message } from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";
import { useWebSocket } from "../../hooks/useWebSocket";
import "./GoogleSheetsCollaborative.css";

const { Title, Text } = Typography;
const { TextArea } = Input;

const GoogleSheetsCollaborative = ({ spreadsheetId, userId = null }) => {
  const { connected, subscribe, unsubscribe, websocket } = useWebSocket(
    userId,
    true,
  );
  const [activeUsers, setActiveUsers] = useState([]);
  const [cellEdits, setCellEdits] = useState({});
  const [currentCell, setCurrentCell] = useState(null);
  const [cellValue, setCellValue] = useState("");
  const [cursors, setCursors] = useState({});

  // Join sheets room on mount
  useEffect(() => {
    if (connected && spreadsheetId) {
      websocket.joinSheetsRoom(spreadsheetId, userId);

      // Listen for user joins/leaves
      const unsubscribeJoin = subscribe(
        "user-joined",
        ({ userId: uid, room }) => {
          if (room === `sheets:${spreadsheetId}`) {
            setActiveUsers((prev) => [...prev.filter((u) => u !== uid), uid]);
            message.info(`User ${uid} joined the sheet`);
          }
        },
      );

      const unsubscribeLeave = subscribe(
        "user-left",
        ({ userId: uid, room }) => {
          if (room === `sheets:${spreadsheetId}`) {
            setActiveUsers((prev) => prev.filter((u) => u !== uid));
            setCursors((prev) => {
              const newCursors = { ...prev };
              delete newCursors[uid];
              return newCursors;
            });
          }
        },
      );

      // Listen for room users list
      const unsubscribeUsers = subscribe("room-users", ({ room, users }) => {
        if (room === `sheets:${spreadsheetId}`) {
          setActiveUsers(users || []);
        }
      });

      // Listen for sheet edits from other users
      const unsubscribeEdit = subscribe(
        "sheets-edit-received",
        ({
          spreadsheetId: sheetId,
          range,
          value,
          userId: editorId,
          timestamp,
        }) => {
          if (sheetId === spreadsheetId && editorId !== userId) {
            setCellEdits((prev) => ({
              ...prev,
              [range]: { value, userId: editorId, timestamp },
            }));
            message.info(`Cell ${range} updated by another user`);
          }
        },
      );

      // Listen for cursor positions
      const unsubscribeCursor = subscribe(
        "sheets-cursor-received",
        ({ spreadsheetId: sheetId, cell, userId: cursorUserId }) => {
          if (sheetId === spreadsheetId && cursorUserId !== userId) {
            setCursors((prev) => ({
              ...prev,
              [cursorUserId]: cell,
            }));
          }
        },
      );

      return () => {
        websocket.leaveSheetsRoom(spreadsheetId, userId);
        unsubscribeJoin();
        unsubscribeLeave();
        unsubscribeUsers();
        unsubscribeEdit();
        unsubscribeCursor();
      };
    }
  }, [connected, spreadsheetId, userId, subscribe, unsubscribe, websocket]);

  // Handle cell selection
  const handleCellSelect = useCallback(
    (cell) => {
      setCurrentCell(cell);
      // Send cursor position to others
      if (connected && spreadsheetId) {
        websocket.sendCursorPosition(spreadsheetId, cell, userId);
      }
    },
    [connected, spreadsheetId, userId, websocket],
  );

  // Handle cell edit
  const handleCellEdit = useCallback(() => {
    if (!currentCell || !cellValue.trim()) return;

    // Send edit to server
    if (connected && spreadsheetId) {
      websocket.sendSheetsEdit(spreadsheetId, currentCell, cellValue, userId);

      // Update local state
      setCellEdits((prev) => ({
        ...prev,
        [currentCell]: {
          value: cellValue,
          userId,
          timestamp: new Date().toISOString(),
        },
      }));

      message.success(`Cell ${currentCell} updated`);
      setCurrentCell(null);
      setCellValue("");
    }
  }, [currentCell, cellValue, connected, spreadsheetId, userId, websocket]);

  // Sample grid cells for demo
  const sampleCells = ["A1", "A2", "B1", "B2", "C1", "C2"];

  return (
    <Card className="sheets-collaborative">
      <div className="collaborative-header">
        <Title level={4}>
          <EditOutlined /> Collaborative Editing
        </Title>
        <Space>
          <Tag color={connected ? "green" : "red"}>
            {connected ? "🟢 Connected" : "🔴 Disconnected"}
          </Tag>
          <Text type="secondary">Spreadsheet: {spreadsheetId || "N/A"}</Text>
        </Space>
      </div>

      {/* Active Users */}
      <div className="active-users">
        <Text strong>Active Users: </Text>
        <Space>
          {activeUsers.length > 0 ? (
            activeUsers.map((uid, index) => (
              <Tag key={index} icon={<UserOutlined />}>
                {uid || "User " + (index + 1)}
              </Tag>
            ))
          ) : (
            <Text type="secondary">No other users</Text>
          )}
        </Space>
      </div>

      {/* Sample Grid */}
      <div className="sheets-grid">
        {sampleCells.map((cell) => {
          const edit = cellEdits[cell];
          const cursorUsers = Object.keys(cursors).filter(
            (uid) => cursors[uid] === cell,
          );

          return (
            <div
              key={cell}
              className={`grid-cell ${currentCell === cell ? "selected" : ""} ${
                cursorUsers.length > 0 ? "cursor-active" : ""
              }`}
              onClick={() => handleCellSelect(cell)}
            >
              <div className="cell-label">{cell}</div>
              <div className="cell-value">{edit ? edit.value : "-"}</div>
              {cursorUsers.length > 0 && (
                <div className="cell-cursors">
                  {cursorUsers.map((uid) => (
                    <Tag key={uid} size="small">
                      {uid}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Form */}
      {currentCell && (
        <Card className="edit-form" title={`Edit Cell ${currentCell}`}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Input
              placeholder="Enter value"
              value={cellValue}
              onChange={(e) => setCellValue(e.target.value)}
              onPressEnter={handleCellEdit}
            />
            <Space>
              <Button type="primary" onClick={handleCellEdit}>
                Update Cell
              </Button>
              <Button
                onClick={() => {
                  setCurrentCell(null);
                  setCellValue("");
                }}
              >
                Cancel
              </Button>
            </Space>
          </Space>
        </Card>
      )}

      {/* Edit History */}
      {Object.keys(cellEdits).length > 0 && (
        <Card className="edit-history" title="Recent Edits" size="small">
          <div className="history-list">
            {Object.entries(cellEdits)
              .slice(-5)
              .map(([range, edit]) => (
                <div key={range} className="history-item">
                  <Text strong>{range}:</Text>
                  <Text>{edit.value}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    by {edit.userId} at{" "}
                    {new Date(edit.timestamp).toLocaleTimeString("vi-VN")}
                  </Text>
                </div>
              ))}
          </div>
        </Card>
      )}
    </Card>
  );
};

export default GoogleSheetsCollaborative;
