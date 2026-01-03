#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Dashboard Integration Module
Tích hợp dữ liệu automation với dashboard
"""

import json
import pandas as pd
from datetime import datetime
import os

class DashboardIntegration:
    def __init__(self):
        self.data_dir = "data"
        self.ensure_data_directory()

    def ensure_data_directory(self):
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)

    def export_for_dashboard(self, orders_df, products_df=None, sla_data=None):
        """Export data specifically for dashboard consumption"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        files_created = {}

        # 1. Export orders với latest symlink
        orders_file = f"{self.data_dir}/orders_dashboard_{timestamp}.csv"
        latest_orders = f"{self.data_dir}/orders_latest.csv"

        orders_df.to_csv(orders_file, index=False, encoding='utf-8-sig')
        orders_df.to_csv(latest_orders, index=False, encoding='utf-8-sig')
        files_created['orders'] = orders_file

        print(f"✅ Exported orders: {orders_file}")

        # 2. Export products nếu có
        if products_df is not None and not products_df.empty:
            products_file = f"{self.data_dir}/products_detail_{timestamp}.csv"
            latest_products = f"{self.data_dir}/products_latest.csv"

            products_df.to_csv(products_file, index=False, encoding='utf-8-sig')
            products_df.to_csv(latest_products, index=False, encoding='utf-8-sig')
            files_created['products'] = products_file

            print(f"✅ Exported products: {products_file}")

        # 3. Export SLA data
        if sla_data:
            sla_file = f"{self.data_dir}/sla_summary_{timestamp}.txt"
            latest_sla = f"{self.data_dir}/sla_latest.txt"

            sla_content = self.format_sla_for_dashboard(sla_data)

            with open(sla_file, 'w', encoding='utf-8') as f:
                f.write(sla_content)

            with open(latest_sla, 'w', encoding='utf-8') as f:
                f.write(sla_content)

            files_created['sla'] = sla_file
            print(f"✅ Exported SLA: {sla_file}")

        # 4. Export dashboard config
        config_file = f"{self.data_dir}/dashboard_config.json"
        config = {
            'last_update': datetime.now().isoformat(),
            'files': files_created,
            'stats': {
                'total_orders': len(orders_df),
                'total_products': len(products_df) if products_df is not None else 0,
                'has_sla_data': sla_data is not None,
                'automation_version': '2.1_enhanced'
            }
        }

        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)

        files_created['config'] = config_file
        print(f"✅ Exported config: {config_file}")

        return files_created

    def format_sla_for_dashboard(self, sla_data):
        """Format SLA data for dashboard consumption"""
        output = []
        output.append("📊 BÁO CÁO SLA - GIÁM SÁT THỜI HẠN BÀN GIAO")
        output.append("=" * 60)
        output.append(f"🕐 Thời gian phân tích: {datetime.now().isoformat()}")

        # Parse SLA data structure
        if isinstance(sla_data, dict):
            if 'shopee' in sla_data:
                shopee = sla_data['shopee']
                output.append(f"📦 Tổng đơn Shopee: {shopee.get('total_orders', 0)}")
                output.append(f"🚨 Quá hạn xác nhận: {shopee.get('overdue_confirm', 0)}")
                output.append(f"🚨 Quá hạn bàn giao: {shopee.get('overdue_handover', 0)}")

            if 'tiktok' in sla_data:
                tiktok = sla_data['tiktok']
                output.append(f"📦 Tổng đơn TikTok: {tiktok.get('total_orders', 0)}")
                output.append(f"🚨 Quá hạn bàn giao: {tiktok.get('overdue_handover', 0)}")

            # Format alerts
            if 'alerts' in sla_data:
                output.append("\n🚨 CẢNH BÁO SLA")
                output.append("-" * 30)
                for alert in sla_data['alerts']:
                    alert_type = alert.get('type', 'INFO')
                    message = alert.get('message', '')
                    output.append(f"{alert_type}: {message}")

        return '\n'.join(output)

def integrate_with_automation(automation_result):
    """Hàm để gọi từ automation system"""
    dashboard = DashboardIntegration()

    if automation_result.get('success') and 'dataframe' in automation_result:
        df = automation_result['dataframe']
        products_df = automation_result.get('products_dataframe')
        sla_data = automation_result.get('sla_data')

        files_created = dashboard.export_for_dashboard(df, products_df, sla_data)

        print("🎉 Dashboard integration completed:")
        for file_type, file_path in files_created.items():
            print(f"  📁 {file_type}: {file_path}")

        return files_created

    else:
        print("⚠️ Dashboard integration skipped - no valid automation result")
        return {}

if __name__ == "__main__":
    # Test the integration
    print("🧪 Testing dashboard integration...")

    # Create sample data
    import pandas as pd

    sample_orders = pd.DataFrame({
        'id': [1, 2, 3],
        'order_code': ['SO001', 'SO002', 'SO003'],
        'platform': ['Shopee', 'TikTok', 'MIA.vn'],
        'order_value': [1000000, 1500000, 2000000]
    })

    test_result = {
        'success': True,
        'dataframe': sample_orders,
        'sla_data': {
            'shopee': {'total_orders': 2, 'overdue_confirm': 1},
            'tiktok': {'total_orders': 1, 'overdue_handover': 0}
        }
    }

    integrate_with_automation(test_result)
    print("✅ Test completed!")
