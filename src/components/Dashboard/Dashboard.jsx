import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState('overview');
  const [scheduleData, setScheduleData] = useState({});
  const [automationData, setAutomationData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scraperStatus, setScraperStatus] = useState({}); // NEW: Track scraper status
  const [logs, setLogs] = useState([]); // NEW: Scraper logs
  const fileInputRef = useRef(null);

  // Colors
  const COLORS = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#4ade80',
    '#f59e0b',
    '#dc2626',
  ];

  // NEW: Trigger Python scraper via backend API
  const triggerScraper = async (scriptType) => {
    try {
      setScraperStatus((prev) => ({ ...prev, [scriptType]: 'running' }));
      addLog(`🚀 Starting ${scriptType} scraper...`);

      const response = await axios.post(
        'http://localhost:3001/api/scraper/trigger',
        {
          type: scriptType,
        }
      );

      if (response.data.success) {
        addLog(`✅ ${scriptType} scraper completed successfully`);
        setScraperStatus((prev) => ({ ...prev, [scriptType]: 'success' }));

        // Auto-load data after scraping
        fetchScraperData(scriptType);
      }
    } catch (error) {
      addLog(`❌ ${scriptType} scraper failed: ${error.message}`);
      setScraperStatus((prev) => ({ ...prev, [scriptType]: 'error' }));
    }
  };

  // NEW: Fetch data from backend after scraping
  const fetchScraperData = async (scriptType) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/data/${scriptType}`
      );
      setAutomationData((prev) => ({
        ...prev,
        [scriptType]: response.data,
      }));
      addLog(`📊 Loaded ${response.data.length} records for ${scriptType}`);
    } catch (error) {
      addLog(`⚠️ Failed to load ${scriptType} data`);
    }
  };

  // NEW: Add log entry
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    setLogs((prev) => [{ time: timestamp, message }, ...prev.slice(0, 49)]);
  };

  // NEW: Schedule config
  const [scheduleConfig, setScheduleConfig] = useState({
    so: { enabled: true, interval: 30, unit: 'minutes' },
    inventory: { enabled: true, interval: 1, unit: 'hours' },
    po: { enabled: true, interval: 1, unit: 'days', time: '08:00' },
    ck: { enabled: true, interval: 1, unit: 'days', time: '08:00' },
  });

  // NEW: Save schedule config
  const saveScheduleConfig = async () => {
    try {
      await axios.post(
        'http://localhost:3001/api/scraper/schedule',
        scheduleConfig
      );
      addLog('✅ Schedule configuration saved');
      alert('✅ Đã lưu cấu hình lịch tự động');
    } catch (error) {
      addLog('❌ Failed to save schedule config');
      alert('❌ Lỗi lưu cấu hình');
    }
  };

  // File upload handler (giữ nguyên logic cũ)
  const handleFileUpload = (event, dataType) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress((e.loaded / e.total) * 100);
      }
    };

    reader.onload = (e) => {
      try {
        const content = e.target.result;
        let parsedData;

        if (file.name.endsWith('.json')) {
          parsedData = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          parsedData = parseCSV(content);
        }

        setAutomationData((prev) => ({ ...prev, [dataType]: parsedData }));
        addLog(`✅ Imported ${parsedData.length} records from file`);
        setUploadProgress(0);
      } catch (error) {
        addLog(`❌ File import error: ${error.message}`);
        setUploadProgress(0);
      }
    };

    reader.readAsText(file);
  };

  // Parse CSV helper
  const parseCSV = (csv) => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const values = line.split(',');
      return headers.reduce((obj, header, i) => {
        obj[header] = values[i]?.trim() || '';
        return obj;
      }, {});
    });
  };

  // Modules
  const modules = [
    { id: 'overview', icon: '📊', name: 'Tổng quan', color: '#667eea' },
    { id: 'automation', icon: '🤖', name: 'Automation', color: '#9333ea' },
    { id: 'schedule', icon: '📅', name: 'Lịch làm việc', color: '#3b82f6' },
    { id: 'orders', icon: '🛒', name: 'Đơn hàng', color: '#10b981' },
    { id: 'inventory', icon: '📦', name: 'Tồn kho', color: '#f59e0b' },
    { id: 'po', icon: '📥', name: 'Nhập hàng (PO)', color: '#ef4444' },
    { id: 'ck', icon: '🔄', name: 'Chuyển kho (CK)', color: '#8b5cf6' },
  ];

  // NEW: Enhanced Automation Module with Trigger Buttons
  const AutomationModule = () => {
    const [activeTab, setActiveTab] = useState('orders');

    const automationScripts = [
      {
        id: 'orders',
        name: 'Đơn hàng (SO)',
        icon: '🛒',
        description:
          'automation_by_date.py - Lấy đơn hàng theo khoảng thời gian',
        scriptType: 'so',
        color: '#10b981',
        sampleData: automationData?.orders || [],
        realtime: true,
      },
      {
        id: 'inventory',
        name: 'Tồn kho',
        icon: '📦',
        description: 'automation_inventory.py - Lấy dữ liệu tồn kho',
        scriptType: 'inventory',
        color: '#f59e0b',
        sampleData: automationData?.inventory || [],
        realtime: false,
      },
      {
        id: 'po',
        name: 'Nhập hàng (PO)',
        icon: '📥',
        description: 'automation_po.py - Lấy đơn nhập hàng',
        scriptType: 'po',
        color: '#ef4444',
        sampleData: automationData?.po || [],
        realtime: false,
      },
      {
        id: 'ck',
        name: 'Chuyển kho (CK)',
        icon: '🔄',
        description: 'automation_ck.py - Lấy phiếu chuyển kho',
        scriptType: 'ck',
        color: '#8b5cf6',
        sampleData: automationData?.ck || [],
        realtime: false,
      },
    ];

    const activeScript = automationScripts.find((s) => s.id === activeTab);
    const status = scraperStatus[activeScript.scriptType];

    return (
      <div className="space-y-6">
        {/* Header with Status */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🤖 Automation Hub</h2>
              <p className="text-purple-100">
                Tự động lấy dữ liệu từ one.tga.com.vn
              </p>
            </div>
            <button
              onClick={() => setActiveModule('schedule-config')}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:shadow-lg transition-all"
            >
              ⚙️ Cấu hình
            </button>
          </div>
        </div>

        {/* Script tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {automationScripts.map((script) => (
              <button
                key={script.id}
                onClick={() => setActiveTab(script.id)}
                className={`p-4 border-b-4 transition-all relative ${
                  activeTab === script.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">{script.icon}</div>
                <div className="font-semibold text-sm">{script.name}</div>
                {script.realtime && (
                  <div className="absolute top-2 right-2">
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Active script panel */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold mb-2">
                {activeScript.icon} {activeScript.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {activeScript.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {status === 'running' && (
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm flex items-center gap-2">
                  <span className="animate-spin">⚙️</span> Running...
                </span>
              )}
              {status === 'success' && (
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-sm">
                  ✅ Success
                </span>
              )}
              {status === 'error' && (
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm">
                  ❌ Error
                </span>
              )}
              <span
                className={`px-3 py-1 rounded-full text-white text-sm`}
                style={{ backgroundColor: activeScript.color }}
              >
                {activeScript.sampleData.length || 0} records
              </span>
            </div>
          </div>

          {/* NEW: Trigger Buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => triggerScraper(activeScript.scriptType)}
              disabled={status === 'running'}
              className={`px-6 py-4 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-3 ${
                status === 'running'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-xl'
              }`}
            >
              {status === 'running' ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  <span>Đang chạy...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Lấy dữ liệu ngay</span>
                </>
              )}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-4 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 transition-all flex items-center justify-center gap-3"
            >
              <span>📁</span>
              <span>Hoặc import file</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={(e) => handleFileUpload(e, activeScript.id)}
              className="hidden"
            />
          </div>

          {/* Data preview (giữ nguyên logic cũ) */}
          {activeScript.sampleData.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">
                📊 Data Preview ({activeScript.sampleData.length} records)
              </h4>
              <div className="overflow-x-auto max-h-96 border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      {Object.keys(activeScript.sampleData[0] || {})
                        .slice(0, 8)
                        .map((key) => (
                          <th
                            key={key}
                            className="px-4 py-2 text-left font-semibold"
                          >
                            {key}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeScript.sampleData.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        {Object.values(row)
                          .slice(0, 8)
                          .map((val, j) => (
                            <td key={j} className="px-4 py-2">
                              {String(val).substring(0, 50)}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeScript.sampleData.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📭</div>
              <p>
                Chưa có dữ liệu. Click "Lấy dữ liệu ngay" để scrape tự động.
              </p>
            </div>
          )}
        </div>

        {/* Live Logs */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <span>📋</span>
            <span>Live Logs</span>
          </h4>
          <div className="bg-gray-900 text-green-400 rounded-xl p-4 font-mono text-sm max-h-64 overflow-y-auto">
            {logs.length === 0 && (
              <div className="text-gray-500">Waiting for activity...</div>
            )}
            {logs.map((log, i) => (
              <div key={i} className="mb-1">
                <span className="text-gray-500">[{log.time}]</span>{' '}
                {log.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // NEW: Schedule Configuration Module
  const ScheduleConfigModule = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-2">⚙️ Cấu hình lịch tự động</h2>
          <p className="text-blue-100">Thiết lập tần suất chạy automation</p>
        </div>

        <div className="grid gap-6">
          {Object.entries(scheduleConfig).map(([key, config]) => (
            <div key={key} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold capitalize">
                    {key.toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {key === 'so' && 'Đơn hàng - Real-time'}
                    {key === 'inventory' && 'Tồn kho'}
                    {key === 'po' && 'Nhập hàng'}
                    {key === 'ck' && 'Chuyển kho'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) =>
                      setScheduleConfig((prev) => ({
                        ...prev,
                        [key]: { ...prev[key], enabled: e.target.checked },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Interval
                  </label>
                  <input
                    type="number"
                    value={config.interval}
                    onChange={(e) =>
                      setScheduleConfig((prev) => ({
                        ...prev,
                        [key]: {
                          ...prev[key],
                          interval: parseInt(e.target.value),
                        },
                      }))
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Unit</label>
                  <select
                    value={config.unit}
                    onChange={(e) =>
                      setScheduleConfig((prev) => ({
                        ...prev,
                        [key]: { ...prev[key], unit: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
                {config.unit === 'days' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={config.time || '08:00'}
                      onChange={(e) =>
                        setScheduleConfig((prev) => ({
                          ...prev,
                          [key]: { ...prev[key], time: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="mt-3 text-sm text-gray-600">
                {config.enabled ? (
                  <>
                    ✅ Auto-run every {config.interval} {config.unit}
                    {config.time && ` at ${config.time}`}
                  </>
                ) : (
                  '❌ Disabled'
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={saveScheduleConfig}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
        >
          💾 Lưu cấu hình
        </button>
      </div>
    );
  };

  // Render active module
  const renderModule = () => {
    switch (activeModule) {
      case 'automation':
        return <AutomationModule />;
      case 'schedule-config':
        return <ScheduleConfigModule />;
      // ... other modules
      default:
        return (
          <div className="text-center py-12 text-gray-400">
            Module coming soon...
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Sidebar */}
      <div className="flex gap-6">
        <div className="w-64 bg-white rounded-xl shadow-lg p-4">
          <h1 className="text-xl font-bold mb-6 px-2">MIA Warehouse</h1>
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`w-full p-3 rounded-lg mb-2 text-left transition-all ${
                activeModule === module.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{module.icon}</span>
              <span className="font-medium">{module.name}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1">{renderModule()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
