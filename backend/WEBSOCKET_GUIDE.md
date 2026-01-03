# WebSocket Guide - MIA.vn Integration Platform

## 📡 Tổng quan

Hệ thống hỗ trợ 2 loại WebSocket:

1. **Socket.io** - Framework WebSocket với nhiều tính năng (rooms, namespaces)
2. **Native WebSocket (WS)** - WebSocket thuần sử dụng thư viện `ws`

## 🔌 Native WebSocket (WS)

### Endpoint

```
ws://localhost:3001/ws
```

### Tính năng

- ✅ Heartbeat/Ping tự động mỗi 30 giây để giữ kết nối
- ✅ Tự động phát hiện kết nối chết
- ✅ Logging chi tiết với disconnect codes
- ✅ Quản lý rooms và clients
- ✅ Ping/Pong, Echo, Broadcast

### Message Types

#### 1. Welcome Message (từ server)

```json
{
  "type": "welcome",
  "clientId": "1764551888942-abc123",
  "message": "Connected to WebSocket server",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 2. Ping (từ client)

```json
{
  "type": "ping"
}
```

**Response:**

```json
{
  "type": "pong",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 3. Echo

```json
{
  "type": "echo",
  "message": "Hello World!"
}
```

**Response:**

```json
{
  "type": "echo",
  "original": "Hello World!",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 4. Broadcast

```json
{
  "type": "broadcast",
  "message": "Message to all clients"
}
```

#### 5. Join Room

```json
{
  "type": "join-room",
  "room": "dashboard"
}
```

**Response:**

```json
{
  "type": "room-joined",
  "room": "dashboard",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 6. Leave Room

```json
{
  "type": "leave-room",
  "room": "dashboard"
}
```

## 🔍 WebSocket Close Codes

### Code 1000 - Normal Closure

Client đóng kết nối bình thường.

### Code 1001 - Going Away

Client đang rời đi (ví dụ: server restart, browser navigation).

### Code 1005 - No Status Received ⚠️

**Phổ biến nhất!** Không có close frame được nhận.

- Client đóng tab/browser mà không gửi close frame
- Mất kết nối mạng đột ngột
- Process bị kill
- **Đây là bình thường** - không phải lỗi

### Code 1006 - Abnormal Closure

Kết nối bị đóng bất thường (không có close frame).

### Code 1011 - Internal Server Error

Lỗi từ phía server.

## 🛠️ Test WebSocket

### 1. Health Check

```bash
cd backend
npm run test:ws:health
```

### 2. Full Test

```bash
cd backend
npm run test:ws
```

### 3. Test từ Browser Console

```javascript
const ws = new WebSocket("ws://localhost:3001/ws");

ws.onopen = () => {
  console.log("✅ Connected!");
  ws.send(JSON.stringify({ type: "ping" }));
};

ws.onmessage = (event) => {
  console.log("📨 Received:", JSON.parse(event.data));
};

ws.onerror = (error) => {
  console.error("❌ Error:", error);
};

ws.onclose = (event) => {
  console.log("❌ Closed:", event.code, event.reason);
};
```

## 🔧 Cấu hình

### Backend Port

Mặc định: `3001`

```bash
PORT=3001 npm start
```

### WebSocket URL

```
ws://localhost:${PORT}/ws
```

### Heartbeat Interval

Mặc định: 30 giây (có thể thay đổi trong `wsService.js`)

## 📊 Monitoring

### Xem số clients đã kết nối

```javascript
const wsService = require("./services/wsService");
console.log("Connected clients:", wsService.getConnectedCount());
```

### Xem thông tin clients

```javascript
const wsService = require("./services/wsService");
console.log("Clients:", wsService.getClientsInfo());
```

## 🐛 Troubleshooting

### Code 1005 xuất hiện thường xuyên

**Đây là bình thường!** Code 1005 xuất hiện khi:

- User đóng tab/browser
- Mất kết nối mạng
- Client không gửi close frame đúng cách

**Không cần lo lắng** - server tự động cleanup.

### Kết nối bị ngắt thường xuyên

1. Kiểm tra network connection
2. Kiểm tra firewall settings
3. Tăng heartbeat interval nếu cần
4. Kiểm tra server logs

### Không thể kết nối

1. Kiểm tra backend server có đang chạy không
2. Kiểm tra port có đúng không
3. Kiểm tra firewall/proxy settings
4. Chạy health check: `npm run test:ws:health`

## 📝 Best Practices

1. **Luôn handle onclose event** - để cleanup và reconnect
2. **Sử dụng heartbeat** - để phát hiện dead connections
3. **Log disconnect codes** - để debug dễ hơn
4. **Handle errors** - luôn có error handler
5. **Reconnect logic** - tự động reconnect khi disconnect

## 🔗 Tài liệu thêm

- [WebSocket RFC 6455](https://tools.ietf.org/html/rfc6455)
- [ws library docs](https://github.com/websockets/ws)
- [WebSocket Close Codes](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent)
