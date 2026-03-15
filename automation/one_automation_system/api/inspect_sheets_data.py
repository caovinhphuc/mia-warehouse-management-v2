#!/usr/bin/env python3
"""
Google Sheets Data Inspector
Kiểm tra và hiển thị dữ liệu logging từ Google Sheets
"""
import os
import sys
from datetime import datetime

# Add current path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from google_sheets_config import GoogleSheetsConfigService
    print("✅ Import GoogleSheetsConfigService successful")
except ImportError as e:
    print(f"❌ Import failed: {e}")
    sys.exit(1)


def inspect_sheets_data():
    """Kiểm tra và hiển thị dữ liệu từ Google Sheets"""
    print("🔍 Google Sheets Data Inspector")
    print("=" * 60)

    try:
        # Initialize service
        sheets_service = GoogleSheetsConfigService()

        if not sheets_service.client:
            print("❌ Cannot connect to Google Sheets")
            return False

        print(f"📊 Connected to spreadsheet: {sheets_service.spreadsheet_id}")

        # List all worksheets
        print("\n📋 Available Worksheets:")
        worksheets = sheets_service.spreadsheet.worksheets()
        for i, ws in enumerate(worksheets, 1):
            print(f"   {i}. {ws.title} ({ws.row_count}x{ws.col_count})")

        # Show current config
        print("\n🔧 Current Configuration:")
        config = sheets_service.get_sheets_config()
        for section, values in config.items():
            if isinstance(values, dict):
                print(f"   📁 [{section}]:")
                for key, value in values.items():
                    print(f"      {key}: {value}")
            else:
                print(f"   📁 {section}: {values}")

        # Show SLA rules
        print("\n📋 SLA Rules:")
        sla_rules = sheets_service.get_sla_rules()
        for platform, rules in sla_rules.items():
            print(f"   🏪 {platform.upper()}:")
            for rule_type, value in rules.items():
                print(f"      {rule_type}: {value}")

        # Show automation history (last 5 runs)
        print("\n📈 Recent Automation History:")
        history = sheets_service.get_automation_history(limit=5)
        if history:
            print("   Timestamp               | Success | Duration | Orders | Version")
            print("   " + "-" * 65)
            for run in history:
                timestamp = run.get('Timestamp', 'N/A')[:19]
                success = '✅' if run.get('Success') else '❌'
                duration = f"{run.get('Duration_Seconds', 0):.1f}s"
                orders = run.get('Order_Count', 'N/A')
                version = run.get('Automation_Version', 'N/A')
                print(f"   {timestamp} | {success:>7} | {duration:>8} | {orders:>6} | {version}")
        else:
            print("   No automation history found")

        # Show current status
        print("\n⚡ Current Automation Status:")
        try:
            status_ws = sheets_service.spreadsheet.worksheet('Automation_Status')
            status_data = status_ws.get_all_records()
            if status_data:
                latest_status = status_data[0]  # Most recent status
                print(f"   Status: {latest_status.get('Status', 'N/A')}")
                print(f"   Progress: {latest_status.get('Progress_Percent', 'N/A')}%")
                print(f"   Orders Extracted: {latest_status.get('Orders_Extracted', 'N/A')}")
                print(f"   Products Extracted: {latest_status.get('Products_Extracted', 'N/A')}")
                print(f"   Last Update: {latest_status.get('Timestamp', 'N/A')}")
            else:
                print("   No status data available")
        except Exception as e:
            print(f"   Status not available: {e}")

        # Show workspace configuration
        print("\n⚙️ Workspace Configuration:")
        workspace_config = sheets_service.get_workspace_config()
        print(f"   Target Records: {workspace_config['target_records']:,}")
        print(f"   Batch Size: {workspace_config['batch_size']}")
        print(f"   Retry Count: {workspace_config['retry_count']}")
        print(f"   Page Wait Time: {workspace_config['page_wait_time']}s")
        print(f"   Product Extraction: {'✅' if workspace_config['product_extraction'] else '❌'}")
        print(f"   Export Format: {workspace_config['export_format']}")

        # Show date range configuration
        print("\n📅 Date Range Configuration:")
        date_config = sheets_service.get_date_range_config()
        print(f"   Start Date: {date_config['start_date']}")
        print(f"   End Date: {date_config['end_date']}")
        print(f"   Platform: {date_config['platform']}")
        print(f"   Display Limit: {date_config['display_limit']}")

        # Calculate statistics
        print("\n📊 Statistics:")
        if history:
            successful_runs = sum(1 for run in history if run.get('Success'))
            total_runs = len(history)
            total_orders = sum(int(run.get('Order_Count', 0)) for run in history if run.get('Order_Count'))
            avg_duration = sum(float(run.get('Duration_Seconds', 0)) for run in history) / len(history)

            print(f"   Success Rate: {successful_runs}/{total_runs} ({(successful_runs/total_runs*100):.1f}%)")
            print(f"   Total Orders Processed: {total_orders:,}")
            print(f"   Average Duration: {avg_duration:.1f} seconds")
        else:
            print("   No statistics available")

        print("\n" + "=" * 60)
        print("✅ Google Sheets data inspection completed")
        print(f"🔗 View online: https://docs.google.com/spreadsheets/d/{sheets_service.spreadsheet_id}")
        print("=" * 60)

        return True

    except Exception as e:
        print(f"❌ Inspection failed: {e}")
        return False


def export_sheets_summary():
    """Export summary dữ liệu Google Sheets ra file local"""
    print("\n💾 Exporting Google Sheets Summary...")

    try:
        sheets_service = GoogleSheetsConfigService()

        if not sheets_service.client:
            print("❌ Cannot connect to Google Sheets")
            return False

        # Create data directory
        os.makedirs('data', exist_ok=True)

        # Export history to CSV
        history = sheets_service.get_automation_history(limit=100)
        if history:
            import csv

            filename = f'data/automation_history_{datetime.now().strftime("%Y%m%d_%H%M")}.csv'
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                if history:
                    fieldnames = history[0].keys()
                    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                    writer.writeheader()
                    writer.writerows(history)

            print(f"✅ History exported: {filename} ({len(history)} records)")

        # Export config to JSON
        config = sheets_service.get_sheets_config()
        if config:
            import json

            filename = f'data/sheets_config_{datetime.now().strftime("%Y%m%d_%H%M")}.json'
            with open(filename, 'w', encoding='utf-8') as jsonfile:
                json.dump(config, jsonfile, indent=2, ensure_ascii=False)

            print(f"✅ Config exported: {filename}")

        # Export SLA rules
        sla_rules = sheets_service.get_sla_rules()
        if sla_rules:
            import json

            filename = f'data/sla_rules_{datetime.now().strftime("%Y%m%d_%H%M")}.json'
            with open(filename, 'w', encoding='utf-8') as jsonfile:
                json.dump(sla_rules, jsonfile, indent=2, ensure_ascii=False)

            print(f"✅ SLA rules exported: {filename}")

        return True

    except Exception as e:
        print(f"❌ Export failed: {e}")
        return False


def main():
    """Main function"""
    print("🏭 Google Sheets Data Inspector & Exporter")
    print("=" * 60)

    # Inspect data
    inspect_success = inspect_sheets_data()

    # Export summary
    export_success = export_sheets_summary()

    if inspect_success and export_success:
        print("\n✅ All operations completed successfully!")
    else:
        print("\n⚠️ Some operations failed!")

    return inspect_success and export_success


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
