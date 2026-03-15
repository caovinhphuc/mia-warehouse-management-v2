# 🔬 Optimization Module

## 📦 Module này chứa gì?

- **COBYQA** (Constrained Optimization BY Quadratic Approximations) - Thuật toán tối ưu hóa có ràng buộc
- Wrapper để tích hợp vào AI Service

## 🚀 Sử Dụng

### **API Endpoints**

#### 1. **Check Status**

```bash
GET /ai/optimization/status
```

Response:

```json
{
  "cobyqa_available": true/false,
  "engine": "COBYQA" or "scipy.optimize (fallback)",
  "status": "ready" or "limited"
}
```

#### 2. **Solve Optimization Problem**

```bash
POST /ai/optimization/solve
```

Request body:

```json
{
  "objective_type": "minimize",
  "initial_guess": [1.0, 1.0],
  "bounds": [[0, 10], [0, 10]],
  "constraints": [],
  "options": {}
}
```

Response:

```json
{
  "status": "success",
  "result": {
    "optimal_point": [0.0, 0.0],
    "optimal_value": 0.0,
    "success": true,
    "message": "Optimization completed",
    "iterations": 5,
    "function_evaluations": 10
  },
  "method": "COBYQA",
  "timestamp": 1234567890.123
}
```

## ⚠️ Lưu Ý

- COBYQA cần các dependencies: `.framework`, `.problem`, `.utils`, `.settings`
- Nếu không có, sẽ fallback về `scipy.optimize`
- Hiện tại file `cobyqa_minimize.py` chưa hoàn chỉnh (thiếu dependencies)

## 🔧 Development

Để sử dụng COBYQA đầy đủ, cần:

1. Cài đặt đầy đủ COBYQA library
2. Hoặc implement các missing modules
3. Hoặc sử dụng scipy.optimize làm fallback
