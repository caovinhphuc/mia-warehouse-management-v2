#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ONE Automation System - Utilities và Monitoring
"""

import os
import json
import pandas as pd
from datetime import datetime, timedelta
import glob

class AutomationUtils:
    """Tiện ích hỗ trợ cho hệ thống tự động hóa"""

    def __init__(self):
        self.data_dir = "data"
        self.logs_dir = "logs" 
        self.reports_dir = "reports"

    def analyze_performance(self, days=7):
        """Phân tích hiệu suất trong N ngày qua"""
        try:
            # Đọc log files
            log_files = glob.glob(f"{self.logs_dir}/automation_*.log")

            performance_data = []

            for log_file in log_files:
                with open(log_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                    # Extract thông tin từ log
                    if "Hoàn thành tự động hóa" in content:
                        # Parse log để lấy metrics
                        lines = content.split('\n')
                        for line in lines:
                            if "Hoàn thành tự động hóa" in line:
                                # Extract số đơn hàng
                                import re
                                match = re.search(r'(\d+) đơn hàng', line)
                                if match:
                                    order_count = int(match.group(1))

                                    # Extract timestamp từ tên file
                                    date_str = os.path.basename(log_file).replace('automation_', '').replace('.log', '')

                                    performance_data.append({
                                        'date': datetime.strptime(date_str, '%Y%m%d'),
                                        'order_count': order_count,
                                        'status': 'success'
                                    })

            if performance_data:
                df = pd.DataFrame(performance_data)
                df = df[df['date'] >= datetime.now() - timedelta(days=days)]

                # Tạo báo cáo
                report = {
                    'total_runs': len(df),
                    'success_rate': len(df[df['status'] == 'success']) / len(df) * 100 if len(df) > 0 else 0,
                    'avg_orders_per_run': df['order_count'].mean() if len(df) > 0 else 0,
                    'total_orders': df['order_count'].sum(),
                    'date_range': f"{df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}" if len(df) > 0 else "No data"
                }

                return report
            else:
                return {'error': 'Không có dữ liệu performance'}

        except Exception as e:
            return {'error': f'Lỗi phân tích performance: {e}'}

    def generate_dashboard(self):
        """Tạo dashboard HTML"""
        try:
            performance = self.analyze_performance(30)  # 30 ngày

            # Đọc dữ liệu đơn hàng mới nhất
            data_files = glob.glob(f"{self.data_dir}/orders_*.csv")
            latest_data = None

            if data_files:
                latest_file = max(data_files, key=os.path.getctime)
                latest_data = pd.read_csv(latest_file)

            # Tạo HTML dashboard
            html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>ONE Automation Dashboard</title>
    <meta charset="utf-8">
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
        .card {{ background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; color: #333; }}
        .metric {{ display: inline-block; margin: 10px; padding: 20px; background: #007bff; color: white; border-radius: 8px; text-align: center; }}
        .metric h3 {{ margin: 0; font-size: 2em; }}
        .metric p {{ margin: 5px 0 0 0; }}
        .status-ok {{ background: #28a745; }}
        .status-warning {{ background: #ffc107; }}
        .status-error {{ background: #dc3545; }}
        table {{ width: 100%; border-collapse: collapse; }}
        th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }}
        th {{ background-color: #f8f9fa; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 ONE Automation System Dashboard</h1>
            <p>Cập nhật lần cuối: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>

        <div class="card">
            <h2>📊 Thống kê hiệu suất (30 ngày)</h2>
            <div class="metrics">
                <div class="metric status-ok">
                    <h3>{performance.get('total_runs', 0)}</h3>
                    <p>Lần chạy</p>
                </div>
                <div class="metric status-ok">
                    <h3>{performance.get('success_rate', 0):.1f}%</h3>
                    <p>Tỷ lệ thành công</p>
                </div>
                <div class="metric">
                    <h3>{performance.get('total_orders', 0)}</h3>
                    <p>Tổng đơn hàng</p>
                </div>
                <div class="metric">
                    <h3>{performance.get('avg_orders_per_run', 0):.1f}</h3>
                    <p>Đơn hàng/lần</p>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>📋 Dữ liệu mới nhất</h2>
            {self._generate_data_table(latest_data) if latest_data is not None else "<p>Chưa có dữ liệu</p>"}
        </div>

        <div class="card">
            <h2>📁 Files dữ liệu</h2>
            {self._generate_file_list()}
        </div>
    </div>
</body>
</html>"""

            # Lưu dashboard
            dashboard_file = f"{self.reports_dir}/dashboard_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
            with open(dashboard_file, 'w', encoding='utf-8') as f:
                f.write(html_content)

            return dashboard_file

        except Exception as e:
            return f'Lỗi tạo dashboard: {e}'

    def _generate_data_table(self, df):
        """Tạo bảng HTML từ DataFrame"""
        if df is None or df.empty:
            return "<p>Không có dữ liệu</p>"

        # Lấy 10 dòng đầu
        df_sample = df.head(10)

        html = "<table><thead><tr>"
        for col in df_sample.columns:
            html += f"<th>{col}</th>"
        html += "</tr></thead><tbody>"

        for _, row in df_sample.iterrows():
            html += "<tr>"
            for val in row:
                html += f"<td>{val}</td>"
            html += "</tr>"

        html += "</tbody></table>"
        html += f"<p><i>Hiển thị 10/{len(df)} dòng</i></p>"

        return html

    def _generate_file_list(self):
        """Tạo danh sách files"""
        files = []

        # Data files
        for ext in ['*.csv', '*.xlsx', '*.json']:
            files.extend(glob.glob(f"{self.data_dir}/{ext}"))

        if not files:
            return "<p>Chưa có file dữ liệu</p>"

        html = "<ul>"
        for file_path in sorted(files, key=os.path.getctime, reverse=True):
            file_name = os.path.basename(file_path)
            file_size = os.path.getsize(file_path)
            file_time = datetime.fromtimestamp(os.path.getctime(file_path))

            html += f"<li><strong>{file_name}</strong> - {file_size} bytes - {file_time.strftime('%Y-%m-%d %H:%M')}</li>"

        html += "</ul>"
        return html

    def cleanup_old_files(self, days=30):
        """Dọn dẹp file cũ"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            removed_files = []

            # Dọn dẹp data files
            for pattern in ['data/*.csv', 'data/*.xlsx', 'data/*.json', 'logs/*.log']:
                files = glob.glob(pattern)
                for file_path in files:
                    file_time = datetime.fromtimestamp(os.path.getctime(file_path))
                    if file_time < cutoff_date:
                        os.remove(file_path)
                        removed_files.append(file_path)

            return {'removed_count': len(removed_files), 'files': removed_files}

        except Exception as e:
            return {'error': f'Lỗi dọn dẹp: {e}'}


def main():
    """Hàm chính cho utilities"""
    import sys

    utils = AutomationUtils()

    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == '--performance':
            days = int(sys.argv[2]) if len(sys.argv) > 2 else 7
            result = utils.analyze_performance(days)
            print(json.dumps(result, indent=2, default=str))

        elif command == '--dashboard':
            dashboard_file = utils.generate_dashboard()
            print(f"Dashboard tạo tại: {dashboard_file}")

        elif command == '--cleanup':
            days = int(sys.argv[2]) if len(sys.argv) > 2 else 30
            result = utils.cleanup_old_files(days)
            print(json.dumps(result, indent=2))

        else:
            print("Lệnh không hợp lệ. Sử dụng: --performance [days] | --dashboard | --cleanup [days]")
    else:
        print("Sử dụng: python utils.py [--performance|--dashboard|--cleanup] [options]")


if __name__ == "__main__":
    main()
