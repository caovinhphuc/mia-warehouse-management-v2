# 📖 **HƯỚNG DẪN SỬ DỤNG REACT OAS INTEGRATION v4.0**

## **AI-Powered Analytics Platform - Complete User Manual**

---

## 🎯 **TỔNG QUAN PLATFORM**

**React OAS Integration v4.0** là một nền tảng phân tích thông minh tích hợp AI/ML, cung cấp khả năng dự đoán hiệu suất, phát hiện bất thường và tối ưu hóa hệ thống real-time.

### **Tính năng chính:**

- 🏠 **Home Dashboard** - Trang chính với điều hướng
- 📊 **Live Dashboard** - Metrics real-time với WebSocket
- 🧠 **AI Analytics** - Phân tích thông minh và dự đoán
- 🔮 **Predictive Analytics** - Dự báo hiệu suất tương lai
- 🔍 **Anomaly Detection** - Phát hiện bất thường tự động
- ⚙️ **System Optimization** - Đề xuất tối ưu hóa AI

---

## 🚀 **KHỞI ĐỘNG PLATFORM**

### **1. Khởi động tự động (Khuyến nghị)**

```bash
./start_ai_platform.sh
```

### **2. Khởi động thủ công**

```bash
# Backend (Terminal 1)
cd backend && node server.js

# AI Service (Terminal 2)
cd ai-service && source venv/bin/activate && uvicorn main_simple:app --port 8000

# Frontend (Terminal 3)
serve build -l 8080
```

### **3. Kiểm tra trạng thái**

- Frontend: <http://localhost:8080>
- Backend: <http://localhost:3001/health>
- AI Service: <http://localhost:8000/health>

---

## 🏠 **HOME DASHBOARD - TRANG CHÍNH**

### **Truy cập:** <http://localhost:8080>

### **Tính năng:**

- **Overview Platform**: Giới thiệu các tính năng v4.0
- **Navigation Menu**: Điều hướng đến các module
- **Status Indicators**: Trạng thái real-time của hệ thống
- **Feature Cards**: Mô tả các chức năng chính

### **Cách sử dụng:**

1. **Xem tổng quan** các tính năng mới trong v4.0
2. **Click vào các button** để chuyển đến module tương ứng:
   - "📊 Live Dashboard" → Real-time metrics
   - "🧠 AI Analytics" → AI-powered insights
3. **Theo dõi status** của các service trong system status card

---

## 📊 **LIVE DASHBOARD - REAL-TIME METRICS**

### **Truy cập:** Click "📊 Live Dashboard" từ Home

### **Tính năng chính:**

#### **1. Real-time Metrics Display**

- **Response Time**: Thời gian phản hồi hệ thống
- **Active Users**: Số người dùng đang hoạt động
- **CPU Usage**: Mức sử dụng CPU
- **Memory Usage**: Mức sử dụng bộ nhớ
- **Error Rate**: Tỷ lệ lỗi hệ thống

#### **2. Interactive Charts**

- **Line Charts**: Hiển thị trends theo thời gian
- **Real-time Updates**: Cập nhật mỗi 2 giây
- **Hover Details**: Chi tiết khi hover chuột
- **Responsive Design**: Tự động điều chỉnh theo màn hình

#### **3. Performance Cards**

- **Health Score**: Điểm sức khỏe tổng thể (0-100)
- **System Status**: Trạng thái các component
- **Recent Activity**: Hoạt động gần đây
- **Alert Notifications**: Thông báo cảnh báo

### **Cách sử dụng:**

1. **Monitor real-time**: Theo dõi metrics liên tục
2. **Phân tích trends**: Xem xu hướng qua charts
3. **Identify issues**: Phát hiện vấn đề qua alerts
4. **Performance review**: Đánh giá hiệu suất tổng thể

---

## 🧠 **AI ANALYTICS - TRUNG TÂM THÔNG MINH**

### **Truy cập:** Click "🧠 AI Analytics" từ Home

### **Modules chính:**

#### **1. 🔮 Performance Score Widget**

- **AI Performance Score**: Điểm số AI tính toán (0-100)
- **Trend Direction**: Hướng xu hướng (improving/stable/declining)
- **Progress Visualization**: Thanh tiến trình với gradient
- **Confidence Level**: Mức độ tin cậy của đánh giá

**Cách đọc:**

- **85-100**: Excellent performance
- **70-84**: Good performance
- **50-69**: Average performance
- **Below 50**: Needs attention

#### **2. 📈 Prediction Panels**

Hiển thị dự đoán cho các metrics chính:

**Response Time Prediction:**

- Dự báo thời gian phản hồi 1 giờ tới
- Confidence score hiển thị độ chính xác
- Recommendations nếu có vấn đề tiềm ẩn

**Active Users Prediction:**

- Dự đoán số lượng user hoạt động
- Pattern analysis cho peak hours
- Capacity planning suggestions

**Resource Usage Prediction:**

- CPU/Memory utilization forecasts
- Resource optimization opportunities
- Scaling recommendations

#### **3. 💡 AI Insights Section**

**Intelligent Analysis:**

- System performance insights
- Usage pattern identification
- Business impact metrics
- Trend analysis và recommendations

**Business Impact Metrics:**

- User Satisfaction Score
- Revenue Impact Estimates
- Conversion Rate Effects
- Cost Efficiency Analysis

#### **4. 🎯 Smart Recommendations**

**AI-Generated Suggestions:**

- Performance optimization actions
- Implementation priority ranking
- Expected impact estimates
- Implementation effort assessment

**Action Items:**

- High Priority: Immediate attention needed
- Medium Priority: Plan for next sprint
- Low Priority: Future optimization

#### **5. 📊 System Status Monitor**

**AI Service Health:**

- Predictive Analytics: ✅ ACTIVE
- Anomaly Detection: 🔍 MONITORING
- Optimization Engine: ⚙️ OPTIMIZING
- Learning Models: 🧠 LEARNING

### **Cách sử dụng AI Analytics:**

#### **Workflow hàng ngày:**

1. **Check Performance Score** - Xem health tổng thể
2. **Review Predictions** - Dự báo cho 1-24h tới
3. **Read Insights** - Hiểu rõ tình trạng hệ thống
4. **Follow Recommendations** - Thực hiện đề xuất AI
5. **Monitor Status** - Đảm bảo AI services hoạt động

#### **Weekly Analysis:**

1. **Trend Review** - Phân tích xu hướng tuần
2. **Performance Patterns** - Xác định patterns
3. **Optimization Planning** - Lập kế hoạch tối ưu
4. **Business Impact** - Đánh giá impact kinh doanh

---

## 🔮 **PREDICTIVE ANALYTICS - DỰ ĐOÁN THÔNG MINH**

### **API Endpoints cho Advanced Users:**

#### **1. Generate Predictions**

```bash
curl -X POST http://localhost:8000/api/ml/predict \
  -H "Content-Type: application/json" \
  -d '{
    "timeframe": "1h",
    "metrics": ["response_time", "active_users", "cpu_usage"]
  }'
```

**Timeframe options:**

- `"5m"` - 5 minutes ahead
- `"1h"` - 1 hour ahead
- `"6h"` - 6 hours ahead
- `"24h"` - 24 hours ahead
- `"7d"` - 7 days ahead

**Response format:**

```json
{
  "predictions": {
    "response_time": [98, 102, 95, 110, ...],
    "active_users": [520, 535, 510, 580, ...]
  },
  "confidence_scores": {
    "response_time": 0.85,
    "active_users": 0.78
  },
  "insights": [
    "🔮 Performance predictions generated successfully",
    "📈 Response time expected to remain stable"
  ],
  "recommendations": [
    "Continue monitoring response time trends",
    "Consider caching optimization for peak hours"
  ]
}
```

#### **2. Get Intelligent Insights**

```bash
curl http://localhost:8000/api/ml/insights
```

**Response includes:**

- Performance trends analysis
- Usage patterns identification
- Optimization opportunities
- Risk assessment
- Business impact calculations

#### **3. Real-time Predictions**

```bash
curl http://localhost:8000/api/ml/realtime-predictions
```

**Use cases:**

- Dashboard widgets
- Alert thresholds
- Auto-scaling triggers
- Performance monitoring

---

## 🔍 **ANOMALY DETECTION - PHÁT HIỆN BẤT THƯỜNG**

### **Automatic Detection:**

AI tự động phát hiện các anomalies trong:

- Response time spikes
- Unusual user activity patterns
- Resource usage anomalies
- Error rate increases

### **Alert Levels:**

- **🟢 Low**: Minor deviations, monitor closely
- **🟡 Medium**: Investigate when possible
- **🟠 High**: Take action soon
- **🔴 Critical**: Immediate attention required

### **Manual Check:**

```bash
curl -X POST http://localhost:8000/api/ml/anomaly-detection \
  -H "Content-Type: application/json" \
  -d '[{
    "timestamp": "2025-06-27T12:00:00",
    "active_users": 1500,
    "response_time": 250.5,
    "error_rate": 0.05,
    "cpu_usage": 85.2,
    "memory_usage": 78.1
  }]'
```

### **Response handling:**

```json
{
  "anomalies_detected": 1,
  "anomalies": [...],
  "alerts": [...],
  "severity_levels": {"low": 0, "medium": 1, "high": 0, "critical": 0}
}
```

---

## ⚙️ **SYSTEM OPTIMIZATION - TỐI ƯU HÓA HỆ THỐNG**

### **Automatic Recommendations:**

AI phân tích và đề xuất:

#### **Performance Optimization:**

- Database query optimization
- Caching strategy improvements
- Resource allocation adjustments
- Load balancing configuration

#### **Cost Optimization:**

- Resource right-sizing
- Auto-scaling policies
- Efficiency improvements
- Unused resource identification

#### **User Experience:**

- Response time optimization
- Error rate reduction
- Availability improvements
- Performance consistency

### **Implementation Priority:**

1. **Critical (Red)**: Immediate action required
2. **High (Orange)**: Plan for this week
3. **Medium (Yellow)**: Next sprint planning
4. **Low (Green)**: Future optimization

### **Manual Optimization Check:**

```bash
curl -X POST http://localhost:8000/api/ml/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-06-27T12:00:00",
    "active_users": 500,
    "response_time": 120.5,
    "error_rate": 0.02,
    "cpu_usage": 65.2,
    "memory_usage": 58.1
  }'
```

---

## 📱 **MOBILE & RESPONSIVE USAGE**

### **Mobile Access:**

- Responsive design tự động điều chỉnh
- Touch-friendly interface
- Swipe gestures cho charts
- Mobile-optimized navigation

### **PWA Features:**

- Add to Home Screen
- Offline basic functionality
- Push notifications (future)
- Fast loading với service worker

### **Browser Support:**

- ✅ Chrome (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ IE11 (Limited support)

---

## 🔧 **TROUBLESHOOTING - XỬ LÝ SỰ CỐ**

### **Common Issues:**

#### **1. Services Not Starting**

```bash
# Check if ports are in use
lsof -i :8080 -i :3001 -i :8000

# Kill existing processes
killall -9 serve node python

# Restart platform
./start_ai_platform.sh
```

#### **2. AI Service Errors**

```bash
# Check AI service logs
tail -f logs/ai-service.log

# Restart AI service only
cd ai-service
source venv/bin/activate
uvicorn main_simple:app --port 8000
```

#### **3. Frontend Loading Issues**

```bash
# Clear browser cache
# Check manifest.json accessibility
curl http://localhost:8080/manifest.json

# Rebuild if needed
npm run build
```

#### **4. Data Not Updating**

- Check WebSocket connection in browser DevTools
- Verify backend health: <http://localhost:3001/health>
- Check network tab for failed requests

### **Health Check Commands:**

```bash
# Quick system check
curl http://localhost:8080/         # Frontend
curl http://localhost:3001/health   # Backend
curl http://localhost:8000/health   # AI Service

# Detailed AI check
curl http://localhost:8000/api/ml/insights
```

### **Log Monitoring:**

```bash
# Real-time log monitoring
tail -f logs/frontend.log
tail -f logs/backend.log
tail -f logs/ai-service.log

# Error filtering
grep -i error logs/*.log
```

---

## 📊 **PERFORMANCE MONITORING**

### **Key Metrics to Monitor:**

#### **System Performance:**

- Response time < 200ms (Good)
- CPU usage < 70% (Optimal)
- Memory usage < 80% (Safe)
- Error rate < 1% (Excellent)

#### **User Experience:**

- Page load time < 3 seconds
- Time to interactive < 5 seconds
- First contentful paint < 2 seconds
- Cumulative layout shift < 0.1

#### **AI Service Performance:**

- Prediction accuracy > 80%
- API response time < 500ms
- Model confidence > 70%
- Anomaly detection rate 95%+

### **Monitoring Tools:**

- Built-in Live Dashboard
- Browser DevTools Network tab
- AI Analytics insights
- Log file analysis

---

## 🎯 **BEST PRACTICES**

### **Daily Operations:**

1. **Morning Check**: Xem AI Performance Score
2. **Trend Review**: Kiểm tra predictions cho ngày
3. **Alert Monitoring**: Theo dõi anomaly notifications
4. **Performance Review**: Đánh giá metrics key

### **Weekly Analysis:**

1. **Pattern Analysis**: Xem trends tuần qua
2. **Optimization Review**: Đánh giá recommendations đã thực hiện
3. **Capacity Planning**: Dự đoán needs cho tuần tới
4. **Performance Tuning**: Apply optimizations mới

### **Monthly Review:**

1. **Business Impact**: Đánh giá ROI của optimizations
2. **Model Performance**: Review AI accuracy và improvements
3. **System Evolution**: Plan cho features mới
4. **Documentation Update**: Cập nhật processes

### **Security Best Practices:**

- Không expose AI service trực tiếp ra internet
- Use HTTPS trong production
- Regular security updates
- Monitor cho unusual access patterns

---

## 🚀 **ADVANCED FEATURES**

### **API Integration:**

Platform cung cấp RESTful APIs cho:

- External system integration
- Custom dashboard development
- Third-party tool connections
- Automated workflows

### **Custom Predictions:**

```javascript
// Frontend integration example
const fetchPredictions = async (metrics, timeframe) => {
  const response = await fetch('http://localhost:8000/api/ml/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metrics, timeframe })
  });
  return response.json();
};
```

### **Webhook Support** (Future)

- Real-time notifications
- External system alerts
- Automated responses
- Integration với ChatOps

---

## 📞 **SUPPORT & RESOURCES**

### **Documentation:**

- `COMPREHENSIVE_GUIDE.md` - Setup & deployment
- `PHASE_4_AI_COMPLETION_REPORT.md` - Technical details
- `ERROR_RESOLUTION_REPORT.md` - Troubleshooting
- `USER_GUIDE.md` - This document

### **Quick Reference:**

```bash
# Start platform
./start_ai_platform.sh

# View logs
tail -f logs/*.log

# Health checks
curl localhost:8080/health
curl localhost:3001/health
curl localhost:8000/health

# Stop all services
kill $(ps aux | grep -E "(serve|node|uvicorn)" | awk '{print $2}')
```

### **Useful URLs:**

- Main App: <http://localhost:8080>
- API Health: <http://localhost:3001/health>
- AI Health: <http://localhost:8000/health>
- AI Docs: <http://localhost:8000/docs> (FastAPI auto-docs)

---

## 🎉 **CONCLUSION**

**React OAS Integration v4.0** là một platform mạnh mẽ kết hợp:

- ✅ Real-time monitoring
- ✅ AI-powered predictions
- ✅ Intelligent optimization
- ✅ User-friendly interface
- ✅ Production-ready performance

### **Key Benefits:**

- **Proactive Monitoring**: Phát hiện issues trước khi ảnh hưởng users
- **Data-Driven Decisions**: AI insights cho optimization decisions
- **Improved Performance**: Automated tuning và recommendations
- **Cost Efficiency**: Resource optimization và waste reduction
- **Better UX**: Faster response times và higher reliability

### **Next Steps:**

1. Explore tất cả features trong platform
2. Set up monitoring workflows phù hợp với team
3. Integrate với existing tools và processes
4. Train team members về AI insights interpretation
5. Plan cho advanced features và customizations

**Chúc bạn sử dụng platform hiệu quả!** 🚀✨

---

*Hướng dẫn sử dụng - React OAS Integration v4.0*
*Version: 4.0.0 | Updated: June 27, 2025*
*Platform Status: ✅ Production Ready*
