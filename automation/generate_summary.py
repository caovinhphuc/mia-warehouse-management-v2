#!/usr/bin/env python3
"""
Final Summary Report Generator
Tạo báo cáo tổng kết cho automation system
"""
import os
from dotenv import load_dotenv
import sys
from datetime import datetime

# Add current path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from google_sheets_config import GoogleSheetsConfigService
    print("✅ Google Sheets module ready")
except ImportError as e:
    print(f"⚠️ Google Sheets not available: {e}")


def generate_final_summary():
    """Tạo báo cáo tổng kết"""
    # Load .env for email credentials
    try:
        load_dotenv()
    except Exception:
        pass

    print("📋 FINAL AUTOMATION SUMMARY REPORT")
    print("=" * 70)

    try:
        # Initialize Google Sheets
        sheets_service = GoogleSheetsConfigService()

        if not sheets_service.client:
            print("❌ Cannot generate comprehensive report without Google Sheets")
            return False

        print("📊 Collecting data from Google Sheets...")

        # Get data
        config = sheets_service.get_sheets_config()
        sla_rules = sheets_service.get_sla_rules()
        history = sheets_service.get_automation_history(limit=20)
        workspace_config = sheets_service.get_workspace_config()

        # System Information
        print("\n🏭 SYSTEM INFORMATION")
        print("-" * 40)
        print(f"System URL: {config.get('system', {}).get('one_url', 'N/A')}")
        print(f"Target Records: {workspace_config['target_records']:,}")
        print(f"Batch Size: {workspace_config['batch_size']}")
        print(f"Google Sheets Integration: ✅ ACTIVE")
        print(f"Product Extraction: {'✅' if workspace_config['product_extraction'] else '❌'}")

        # Performance Statistics
        if history:
            print("\n📊 PERFORMANCE STATISTICS")
            print("-" * 40)

            successful_runs = [run for run in history if run.get('Success')]
            total_runs = len(history)

            if successful_runs:
                total_orders = sum(int(run.get('Order_Count', 0)) for run in successful_runs)
                total_enhanced = sum(int(run.get('Enhanced_Order_Count', 0)) for run in successful_runs)
                total_duration = sum(float(run.get('Duration_Seconds', 0)) for run in successful_runs)
                avg_duration = total_duration / len(successful_runs)

                print(f"Total Runs: {total_runs}")
                print(f"Successful Runs: {len(successful_runs)} ({len(successful_runs)/total_runs*100:.1f}%)")
                print(f"Total Orders Processed: {total_orders:,}")
                print(f"Total Orders Enhanced: {total_enhanced:,}")
                print(f"Enhancement Rate: {total_enhanced/total_orders*100:.1f}%" if total_orders > 0 else "N/A")
                print(f"Average Duration: {avg_duration:.1f} seconds")
                print(f"Average Processing Rate: {total_orders/total_duration:.1f} orders/second" if total_duration > 0 else "N/A")

        # SLA Configuration
        print("\n📋 SLA CONFIGURATION")
        print("-" * 40)
        for platform, rules in sla_rules.items():
            print(f"🏪 {platform.upper()}:")
            for rule_type, value in rules.items():
                print(f"   {rule_type}: {value}")

        # Recent Activity
        print("\n📈 RECENT AUTOMATION ACTIVITY")
        print("-" * 40)
        if history[:5]:  # Last 5 runs
            for run in history[:5]:
                timestamp = run.get('Timestamp', 'N/A')[:16]
                success = '✅' if run.get('Success') else '❌'
                orders = run.get('Order_Count', 'N/A')
                duration = f"{run.get('Duration_Seconds', 0):.1f}s"
                version = run.get('Automation_Version', 'N/A')
                print(f"{timestamp} | {success} | {orders:>4} orders | {duration:>6} | {version}")
        else:
            print("No recent activity found")

        # Export Files Information
        print("\n📁 EXPORT FILES")
        print("-" * 40)
        os.makedirs('data', exist_ok=True)

        data_files = [f for f in os.listdir('data') if f.endswith(('.csv', '.json', '.xlsx'))]
        if data_files:
            print(f"Found {len(data_files)} export files in data/ directory:")
            for file in sorted(data_files)[-10:]:  # Last 10 files
                try:
                    file_path = os.path.join('data', file)
                    file_size = os.path.getsize(file_path)
                    file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                    print(f"   📄 {file} ({file_size:,} bytes, {file_time.strftime('%Y-%m-%d %H:%M')})")
                except Exception:
                    print(f"   📄 {file}")
        else:
            print("No export files found")

        # Log Files Information
        print("\n📋 LOG FILES")
        print("-" * 40)
        os.makedirs('logs', exist_ok=True)

        log_files = [f for f in os.listdir('logs') if f.endswith('.log')]
        if log_files:
            print(f"Found {len(log_files)} log files in logs/ directory:")
            for file in sorted(log_files)[-5:]:  # Last 5 log files
                try:
                    file_path = os.path.join('logs', file)
                    file_size = os.path.getsize(file_path)
                    file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                    print(f"   📋 {file} ({file_size:,} bytes, {file_time.strftime('%Y-%m-%d %H:%M')})")
                except Exception:
                    print(f"   📋 {file}")
        else:
            print("No log files found")

        # System Health
        print("\n⚡ SYSTEM HEALTH STATUS")
        print("-" * 40)

        # Check recent errors
        recent_failures = [run for run in history[:10] if not run.get('Success')]
        if recent_failures:
            print(f"⚠️ Recent Failures: {len(recent_failures)} in last 10 runs")
            for failure in recent_failures[:3]:
                error = failure.get('Error', 'Unknown error')[:50]
                timestamp = failure.get('Timestamp', 'N/A')[:16]
                print(f"   ❌ {timestamp}: {error}...")
        else:
            print("✅ No recent failures detected")

        # Check system configuration
        critical_config = {
            'Google Sheets': config.get('google_sheets', {}).get('enabled', False),
            'Auto Sync': config.get('google_sheets', {}).get('auto_sync', False),
            'Product Extraction': workspace_config['product_extraction']
        }

        print("\n🔧 System Configuration Status:")
        for feature, enabled in critical_config.items():
            status = "✅ ENABLED" if enabled else "❌ DISABLED"
            print(f"   {feature}: {status}")

        # Recommendations
        print("\n💡 RECOMMENDATIONS")
        print("-" * 40)

        recommendations = []

        if history:
            # Check success rate
            success_rate = len([r for r in history if r.get('Success')]) / len(history) * 100
            if success_rate < 90:
                recommendations.append("⚠️ Success rate below 90% - investigate error patterns")

            # Check processing speed
            if successful_runs:
                avg_orders_per_run = sum(int(r.get('Order_Count', 0)) for r in successful_runs) / len(successful_runs)
                if avg_orders_per_run < 100:
                    recommendations.append("📈 Consider increasing batch size for better throughput")

        # Check data retention
        if len(data_files) > 50:
            recommendations.append("🗂️ Consider archiving old export files to save storage space")

        if len(log_files) > 20:
            recommendations.append("📋 Consider rotating log files to manage disk usage")

        if not recommendations:
            recommendations.append("✅ System is operating optimally")

        for rec in recommendations:
            print(f"   {rec}")

        # Generate summary report file
        print("\n💾 Generating summary report file...")

        report_filename = f'data/automation_summary_{datetime.now().strftime("%Y%m%d_%H%M")}.txt'
        with open(report_filename, 'w', encoding='utf-8') as f:
            f.write("WAREHOUSE AUTOMATION SYSTEM - SUMMARY REPORT\n")
            f.write("=" * 60 + "\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")

            f.write("PERFORMANCE SUMMARY:\n")
            if history and successful_runs:
                f.write(f"- Total Automation Runs: {total_runs}\n")
                f.write(f"- Success Rate: {len(successful_runs)/total_runs*100:.1f}%\n")
                f.write(f"- Total Orders Processed: {total_orders:,}\n")
                f.write(f"- Average Processing Time: {avg_duration:.1f} seconds\n")

            f.write(f"\nSYSTEM STATUS: {'✅ HEALTHY' if not recent_failures else '⚠️ ISSUES DETECTED'}\n")
            f.write(f"Google Sheets Integration: ✅ ACTIVE\n")
            f.write(f"Target Records: {workspace_config['target_records']:,}\n")

            f.write(f"\nSpreadsheet URL: https://docs.google.com/spreadsheets/d/{sheets_service.spreadsheet_id}\n")

        print(f"✅ Summary report saved: {report_filename}")

        # Optional notifications (email/telegram)
        try:
            from notifier import send_email, send_telegram
            import json
            with open('config/config.json', 'r', encoding='utf-8') as f:
                cfg = json.load(f)
            notif = cfg.get('notifications', {})

            # Email
            if notif.get('email', {}).get('enabled', False):
                recipients = notif['email'].get('recipients', [])
                subject = f"Automation Summary - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
                html = f"""
                <h3>Automation Summary</h3>
                <p>Report file: {report_filename}</p>
                <p>Spreadsheet: https://docs.google.com/spreadsheets/d/{sheets_service.spreadsheet_id}</p>
                """
                send_email(subject, html, recipients)

            # Telegram
            if notif.get('telegram', {}).get('enabled', False):
                send_telegram(f"[Automation] Summary: {report_filename}")
        except Exception:
            pass

        # Final output
        print("\n" + "=" * 70)
        print("🎉 FINAL SUMMARY COMPLETED")
        print("=" * 70)
        print(f"📊 Spreadsheet: https://docs.google.com/spreadsheets/d/{sheets_service.spreadsheet_id}")
        print(f"📄 Summary Report: {report_filename}")
        print(f"📁 Data Directory: data/ ({len(data_files)} files)")
        print(f"📋 Logs Directory: logs/ ({len(log_files)} files)")
        print("=" * 70)

        return True

    except Exception as e:
        print(f"❌ Failed to generate summary: {e}")
        return False


def main():
    """Main function"""
    success = generate_final_summary()

    if success:
        print("\n✅ Summary report generation completed!")
    else:
        print("\n❌ Summary report generation failed!")

    return success


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
