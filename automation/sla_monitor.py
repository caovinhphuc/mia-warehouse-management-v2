#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SLA Monitor - Hệ thống giám sát SLA theo chính sách sàn TMĐT
Đảm bảo không vi phạm thời gian xác nhận và bàn giao
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
import json
import os


class SLAMonitor:
    """Hệ thống giám sát SLA cho các sàn TMĐT"""

    def __init__(self, config_path="config/sla_config.json"):
        self.setup_logging()
        self.load_sla_config(config_path)
        self.current_time = datetime.now()

    def setup_logging(self):
        """Setup logging cho SLA monitor"""
        self.logger = logging.getLogger('SLAMonitor')
        self.logger.setLevel(logging.INFO)

        # Console handler
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)

    def load_sla_config(self, config_path):
        """Load SLA configuration"""
        try:
            if os.path.exists(config_path):
                with open(config_path, 'r', encoding='utf-8') as f:
                    self.sla_config = json.load(f)
            else:
                # Default SLA configuration
                self.sla_config = {
                    "shopee": {
                        "cutoff_time": "18:00",
                        "confirm_deadline": "09:00",  # Next day
                        "handover_deadline": "12:00"  # Next day
                    },
                    "tiktok": {
                        "cutoff_time": "14:00",
                        "handover_deadline": "21:00"  # Next day
                    },
                    "other_platforms": {
                        "default_deadline": "17:00"  # Same day
                    },
                    "warning_hours": [2, 1, 0.5]  # Hours before deadline
                }
                self.create_default_config(config_path)

            self.logger.info("✅ SLA config loaded successfully")

        except Exception as e:
            self.logger.error(f"❌ Error loading SLA config: {e}")
            raise

    def create_default_config(self, config_path):
        """Create default SLA configuration file"""
        try:
            os.makedirs(os.path.dirname(config_path), exist_ok=True)
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(self.sla_config, f, indent=2, ensure_ascii=False)
            self.logger.info(f"✅ Created default SLA config: {config_path}")
        except Exception as e:
            self.logger.error(f"❌ Error creating config: {e}")

    def analyze_orders_sla(self, orders_df):
        """Phân tích SLA cho tất cả đơn hàng"""
        try:
            self.logger.info("📊 Bắt đầu phân tích SLA...")

            # Prepare data
            df = self.prepare_order_data(orders_df)

            # Analyze by platform
            shopee_analysis = self.analyze_shopee_sla(df)
            tiktok_analysis = self.analyze_tiktok_sla(df)
            other_analysis = self.analyze_other_platforms_sla(df)

            # Combine results
            sla_report = {
                'analysis_time': self.current_time.isoformat(),
                'total_orders': len(df),
                'shopee': shopee_analysis,
                'tiktok': tiktok_analysis,
                'other_platforms': other_analysis,
                'alerts': self.generate_alerts(shopee_analysis, tiktok_analysis, other_analysis)
            }

            self.logger.info("✅ SLA analysis completed")
            return sla_report

        except Exception as e:
            self.logger.error(f"❌ Error in SLA analysis: {e}")
            return {}

    def prepare_order_data(self, orders_df):
        """Chuẩn bị dữ liệu đơn hàng cho phân tích SLA"""
        try:
            df = orders_df.copy()

            # Debug: Log available columns
            self.logger.info(f"📋 Available columns: {list(df.columns)}")

            # Identify platform column (có thể là col_18 hoặc platform)
            platform_col = None
            for col in ['platform', 'col_18', 'customer']:
                if col in df.columns:
                    platform_col = col
                    break

            if not platform_col:
                # If no platform column found, create one based on data patterns
                self.logger.warning("⚠️ Không tìm thấy cột platform, sử dụng cột đầu tiên")
                platform_col = df.columns[0] if len(df.columns) > 0 else 'platform'
                if platform_col not in df.columns:
                    df[platform_col] = 'unknown'

            # Identify created time column
            time_col = None
            for col in ['created_datetime', 'created_time', 'date_order', 'scraped_at', 'col_6', 'col_7']:
                if col in df.columns:
                    time_col = col
                    break

            if not time_col:
                # If no time column found, create one with current time
                self.logger.warning("⚠️ Không tìm thấy cột thời gian, sử dụng thời gian hiện tại")
                time_col = 'created_datetime'
                df[time_col] = datetime.now()

            # Standardize platform names
            df['platform_clean'] = df[platform_col].astype(str).str.lower()
            df.loc[df['platform_clean'].str.contains('shopee', na=False), 'platform_clean'] = 'shopee'
            df.loc[df['platform_clean'].str.contains('tiktok', na=False), 'platform_clean'] = 'tiktok'
            df.loc[~df['platform_clean'].isin(['shopee', 'tiktok']), 'platform_clean'] = 'other'

            # Parse created time
            if time_col == 'created_datetime' and df[time_col].dtype == 'datetime64[ns]':
                # Already datetime
                pass
            else:
                df['created_datetime'] = pd.to_datetime(df[time_col], errors='coerce')

            # Fill NaT values with current time
            df['created_datetime'].fillna(datetime.now(), inplace=True)

            self.logger.info(f"✅ Prepared {len(df)} orders for SLA analysis")
            self.logger.info(f"📊 Platform distribution: {df['platform_clean'].value_counts().to_dict()}")
            return df

        except Exception as e:
            self.logger.error(f"❌ Error preparing data: {e}")
            return pd.DataFrame()

    def analyze_shopee_sla(self, df):
        """Phân tích SLA cho Shopee"""
        try:
            shopee_df = df[df['platform_clean'] == 'shopee'].copy()

            if shopee_df.empty:
                return {'total_orders': 0, 'after_cutoff': 0, 'sla_status': []}

            # Get yesterday and today
            today = self.current_time.date()
            yesterday = today - timedelta(days=1)

            # Filter orders after 18:00 yesterday
            cutoff_time = datetime.combine(yesterday, datetime.strptime("18:00", "%H:%M").time())
            after_cutoff = shopee_df[shopee_df['created_datetime'] > cutoff_time]

            # Calculate SLA deadlines
            confirm_deadline = datetime.combine(today, datetime.strptime("09:00", "%H:%M").time())
            handover_deadline = datetime.combine(today, datetime.strptime("12:00", "%H:%M").time())

            # Analyze each order
            sla_status = []
            for _, order in after_cutoff.iterrows():
                status = self.calculate_order_sla_status(
                    order, confirm_deadline, handover_deadline, 'shopee'
                )
                sla_status.append(status)

            # Summary statistics
            total_after_cutoff = len(after_cutoff)
            need_confirm = len([s for s in sla_status if s['needs_confirm']])
            need_handover = len([s for s in sla_status if s['needs_handover']])
            overdue_confirm = len([s for s in sla_status if s['confirm_overdue']])
            overdue_handover = len([s for s in sla_status if s['handover_overdue']])

            return {
                'total_orders': len(shopee_df),
                'after_cutoff': total_after_cutoff,
                'need_confirm': need_confirm,
                'need_handover': need_handover,
                'overdue_confirm': overdue_confirm,
                'overdue_handover': overdue_handover,
                'sla_status': sla_status,
                'cutoff_time': cutoff_time.isoformat(),
                'confirm_deadline': confirm_deadline.isoformat(),
                'handover_deadline': handover_deadline.isoformat()
            }

        except Exception as e:
            self.logger.error(f"❌ Error analyzing Shopee SLA: {e}")
            return {}

    def analyze_tiktok_sla(self, df):
        """Phân tích SLA cho TikTok"""
        try:
            tiktok_df = df[df['platform_clean'] == 'tiktok'].copy()

            if tiktok_df.empty:
                return {'total_orders': 0, 'after_cutoff': 0, 'sla_status': []}

            # Get yesterday and tomorrow
            today = self.current_time.date()
            yesterday = today - timedelta(days=1)
            tomorrow = today + timedelta(days=1)

            # Filter orders after 14:00 yesterday
            cutoff_time = datetime.combine(yesterday, datetime.strptime("14:00", "%H:%M").time())
            after_cutoff = tiktok_df[tiktok_df['created_datetime'] > cutoff_time]

            # Calculate handover deadline (21:00 tomorrow)
            handover_deadline = datetime.combine(tomorrow, datetime.strptime("21:00", "%H:%M").time())

            # Analyze each order
            sla_status = []
            for _, order in after_cutoff.iterrows():
                status = self.calculate_order_sla_status(
                    order, None, handover_deadline, 'tiktok'
                )
                sla_status.append(status)

            # Summary statistics
            total_after_cutoff = len(after_cutoff)
            need_handover = len([s for s in sla_status if s['needs_handover']])
            overdue_handover = len([s for s in sla_status if s['handover_overdue']])

            return {
                'total_orders': len(tiktok_df),
                'after_cutoff': total_after_cutoff,
                'need_handover': need_handover,
                'overdue_handover': overdue_handover,
                'sla_status': sla_status,
                'cutoff_time': cutoff_time.isoformat(),
                'handover_deadline': handover_deadline.isoformat()
            }

        except Exception as e:
            self.logger.error(f"❌ Error analyzing TikTok SLA: {e}")
            return {}

    def analyze_other_platforms_sla(self, df):
        """Phân tích SLA cho các sàn khác"""
        try:
            other_df = df[df['platform_clean'] == 'other'].copy()

            if other_df.empty:
                return {'total_orders': 0, 'platforms': {}}

            # Get today
            today = self.current_time.date()

            # Filter orders from today
            today_orders = other_df[other_df['created_datetime'].dt.date == today]

            # Group by platform
            platforms = {}
            for platform in today_orders['platform_clean'].unique():
                platform_orders = today_orders[today_orders['platform_clean'] == platform]
                platforms[platform] = {
                    'total_orders': len(platform_orders),
                    'orders': platform_orders.to_dict('records')
                }

            return {
                'total_orders': len(other_df),
                'today_orders': len(today_orders),
                'platforms': platforms
            }

        except Exception as e:
            self.logger.error(f"❌ Error analyzing other platforms SLA: {e}")
            return {}

    def calculate_order_sla_status(self, order, confirm_deadline, handover_deadline, platform):
        """Tính toán trạng thái SLA cho một đơn hàng"""
        try:
            order_id = order.get('id', 'Unknown')
            created_time = order['created_datetime']

            status = {
                'order_id': order_id,
                'platform': platform,
                'created_time': created_time.isoformat(),
                'needs_confirm': False,
                'needs_handover': False,
                'confirm_overdue': False,
                'handover_overdue': False,
                'time_to_confirm': None,
                'time_to_handover': None
            }

            # Check confirm deadline (Shopee only)
            if confirm_deadline:
                status['needs_confirm'] = True
                status['confirm_overdue'] = self.current_time > confirm_deadline

                if not status['confirm_overdue']:
                    time_diff = confirm_deadline - self.current_time
                    status['time_to_confirm'] = time_diff.total_seconds() / 3600  # hours

            # Check handover deadline
            if handover_deadline:
                status['needs_handover'] = True
                status['handover_overdue'] = self.current_time > handover_deadline

                if not status['handover_overdue']:
                    time_diff = handover_deadline - self.current_time
                    status['time_to_handover'] = time_diff.total_seconds() / 3600  # hours

            return status

        except Exception as e:
            self.logger.error(f"❌ Error calculating SLA status: {e}")
            return {}

    def generate_alerts(self, shopee_analysis, tiktok_analysis, other_analysis):
        """Tạo cảnh báo SLA"""
        alerts = []

        try:
            # Shopee alerts
            if shopee_analysis.get('overdue_confirm', 0) > 0:
                alerts.append({
                    'type': 'CRITICAL',
                    'platform': 'Shopee',
                    'message': f"🚨 {shopee_analysis['overdue_confirm']} đơn hàng QUÁ HẠN xác nhận (9h sáng)",
                    'count': shopee_analysis['overdue_confirm']
                })

            if shopee_analysis.get('overdue_handover', 0) > 0:
                alerts.append({
                    'type': 'CRITICAL',
                    'platform': 'Shopee',
                    'message': f"🚨 {shopee_analysis['overdue_handover']} đơn hàng QUÁ HẠN bàn giao (12h trước)",
                    'count': shopee_analysis['overdue_handover']
                })

            # TikTok alerts
            if tiktok_analysis.get('overdue_handover', 0) > 0:
                alerts.append({
                    'type': 'CRITICAL',
                    'platform': 'TikTok',
                    'message': f"🚨 {tiktok_analysis['overdue_handover']} đơn hàng QUÁ HẠN bàn giao (21h)",
                    'count': tiktok_analysis['overdue_handover']
                })

            # Warning alerts (upcoming deadlines)
            warning_hours = self.sla_config.get('warning_hours', [2, 1])

            for analysis, platform in [(shopee_analysis, 'Shopee'), (tiktok_analysis, 'TikTok')]:
                if 'sla_status' in analysis:
                    for status in analysis['sla_status']:
                        # Check confirm deadline warnings
                        if status.get('time_to_confirm') and status['time_to_confirm'] <= max(warning_hours):
                            alerts.append({
                                'type': 'WARNING',
                                'platform': platform,
                                'message': f"⚠️ Đơn {status['order_id']} sắp hết hạn xác nhận ({status['time_to_confirm']:.1f}h)",
                                'hours_left': status['time_to_confirm']
                            })

                        # Check handover deadline warnings
                        if status.get('time_to_handover') and status['time_to_handover'] <= max(warning_hours):
                            alerts.append({
                                'type': 'WARNING',
                                'platform': platform,
                                'message': f"⚠️ Đơn {status['order_id']} sắp hết hạn bàn giao ({status['time_to_handover']:.1f}h)",
                                'hours_left': status['time_to_handover']
                            })

            return alerts

        except Exception as e:
            self.logger.error(f"❌ Error generating alerts: {e}")
            return []

    def export_sla_report(self, sla_report, export_dir="data"):
        """Xuất báo cáo SLA"""
        try:
            os.makedirs(export_dir, exist_ok=True)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

            # 1. JSON report
            json_file = f"{export_dir}/sla_report_{timestamp}.json"
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(sla_report, f, indent=2, ensure_ascii=False, default=str)

            # 2. Summary text report
            txt_file = f"{export_dir}/sla_summary_{timestamp}.txt"
            self.create_text_summary(sla_report, txt_file)

            # 3. CSV alerts
            csv_file = f"{export_dir}/sla_alerts_{timestamp}.csv"
            self.create_alerts_csv(sla_report.get('alerts', []), csv_file)

            self.logger.info(f"✅ SLA reports exported: {json_file}, {txt_file}, {csv_file}")

            return {
                'json': json_file,
                'summary': txt_file,
                'alerts': csv_file
            }

        except Exception as e:
            self.logger.error(f"❌ Error exporting SLA report: {e}")
            return {}

    def create_text_summary(self, sla_report, filename):
        """Tạo báo cáo text summary"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write("📊 BÁO CÁO SLA - GIÁM SÁT THỜI HẠN BÀN GIAO\n")
                f.write("=" * 60 + "\n\n")
                f.write(f"🕐 Thời gian phân tích: {sla_report['analysis_time']}\n")
                f.write(f"📦 Tổng số đơn hàng: {sla_report['total_orders']}\n\n")

                # Shopee summary
                shopee = sla_report.get('shopee', {})
                f.write("🛒 SHOPEE - SLA Analysis\n")
                f.write("-" * 30 + "\n")
                f.write(f"📦 Tổng đơn Shopee: {shopee.get('total_orders', 0)}\n")
                f.write(f"🕐 Đơn sau 18h hôm qua: {shopee.get('after_cutoff', 0)}\n")
                f.write(f"✅ Cần xác nhận (trước 9h): {shopee.get('need_confirm', 0)}\n")
                f.write(f"🚚 Cần bàn giao (trước 12h): {shopee.get('need_handover', 0)}\n")
                f.write(f"🚨 Quá hạn xác nhận: {shopee.get('overdue_confirm', 0)}\n")
                f.write(f"🚨 Quá hạn bàn giao: {shopee.get('overdue_handover', 0)}\n\n")

                # TikTok summary
                tiktok = sla_report.get('tiktok', {})
                f.write("📱 TIKTOK - SLA Analysis\n")
                f.write("-" * 30 + "\n")
                f.write(f"📦 Tổng đơn TikTok: {tiktok.get('total_orders', 0)}\n")
                f.write(f"🕐 Đơn sau 14h hôm qua: {tiktok.get('after_cutoff', 0)}\n")
                f.write(f"🚚 Cần bàn giao (trước 21h mai): {tiktok.get('need_handover', 0)}\n")
                f.write(f"🚨 Quá hạn bàn giao: {tiktok.get('overdue_handover', 0)}\n\n")

                # Other platforms
                other = sla_report.get('other_platforms', {})
                f.write("🏪 CÁC SÀN KHÁC\n")
                f.write("-" * 30 + "\n")
                f.write(f"📦 Tổng đơn khác: {other.get('total_orders', 0)}\n")
                f.write(f"📅 Đơn hôm nay: {other.get('today_orders', 0)}\n\n")

                # Alerts
                alerts = sla_report.get('alerts', [])
                if alerts:
                    f.write("🚨 CẢNH BÁO SLA\n")
                    f.write("-" * 30 + "\n")
                    for alert in alerts:
                        f.write(f"{alert['type']}: {alert['message']}\n")

        except Exception as e:
            self.logger.error(f"❌ Error creating text summary: {e}")

    def create_alerts_csv(self, alerts, filename):
        """Tạo CSV file cho alerts"""
        try:
            if not alerts:
                return

            alerts_df = pd.DataFrame(alerts)
            alerts_df.to_csv(filename, index=False, encoding='utf-8-sig')

        except Exception as e:
            self.logger.error(f"❌ Error creating alerts CSV: {e}")


def main():
    """Test SLA Monitor"""
    try:
        print("🧪 Testing SLA Monitor...")

        # Initialize SLA Monitor
        sla_monitor = SLAMonitor()

        # Load sample data (replace with actual data)
        # orders_df = pd.read_csv('data/orders_latest.csv')

        # For testing, create sample data
        sample_data = pd.DataFrame({
            'id': ['503313', '503314', '503315'],
            'platform': ['Shopee', 'TikTok', 'Other'],
            'created_datetime': [
                datetime.now() - timedelta(hours=10),  # Yesterday 18:30
                datetime.now() - timedelta(hours=8),   # Yesterday 16:00
                datetime.now() - timedelta(hours=2)    # Today
            ]
        })

        # Analyze SLA
        sla_report = sla_monitor.analyze_orders_sla(sample_data)

        # Export reports
        export_files = sla_monitor.export_sla_report(sla_report)

        print("✅ SLA Monitor test completed")
        print(f"📁 Reports: {export_files}")

    except Exception as e:
        print(f"❌ Test failed: {e}")


if __name__ == "__main__":
    main()
