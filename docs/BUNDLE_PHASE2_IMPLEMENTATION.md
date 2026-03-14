# Bundle Phase 2 - Implementation Status

## ✅ Đã triển khai

### 1. PurgeCSS

- **File**: `postcss.config.js`
- **Config**: Safelist ant-, rc-, css-, adm- (Ant Design, MUI)
- **Chạy**: Tự động khi `npm run build` (production)

### 2. CI/CD Bundle Check

- **File**: `.github/workflows/bundle-check.yml`
- **Trigger**: PR vào main/develop (thay đổi src/, package.json, vite.config)
- **Check**: `node scripts/performance-bundle.js`, Brotli < 800KB

### 3. Chart Library Audit

| Library    | Files | Chunk Size |
|------------|-------|------------|
| Chart.js   | 2     | 165 KB     |
| Recharts   | 4     | 327 KB     |

**Khuyến nghị**: Giữ Recharts (nhiều usage hơn). Migration Chart.js → Recharts cho YourMetricsWidget, MIARetailDashboard sẽ tiết kiệm ~165 KB.

### 4. Icon Optimization

- **Script**: `npm run optimize:images` (scripts/optimize-icons.sh)
- **Files**: 23 file import @ant-design/icons
- **Lưu ý**: Ant Design 5 tree-shake tốt với named imports; chuyển sang path import tiết kiệm thêm ~50KB

## 📋 Chưa triển khai (cần review)

### Dynamic imports cho charts

Pattern gợi ý:

```jsx
// Lazy load recharts khi component mount
const [Recharts, setRecharts] = useState(null);
useEffect(() => {
  import('recharts').then(m => setRecharts(m));
}, []);
if (!Recharts) return <Spin />;
const { AreaChart, Area, XAxis, YAxis } = Recharts;
return <AreaChart>...</AreaChart>;
```

### Chart consolidation (Chart.js → Recharts) ✅ DONE

- YourMetricsWidget.jsx – Line → Recharts LineChart
- MIARetailDashboard.jsx – Line, Bar, Pie → Recharts
- Đã gỡ: chart.js, react-chartjs-2, react-chartjs2
