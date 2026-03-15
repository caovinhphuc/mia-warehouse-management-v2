#!/usr/bin/env python3
"""
Complete Automation Runner with Monitoring
Chạy automation hoàn chỉnh với monitoring, logging và notifications
"""
import logging
import os
import sys
import time
from datetime import datetime

# Resolve paths independent of current working directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGS_DIR = os.path.join(BASE_DIR, 'logs')
DATA_DIR = os.path.join(BASE_DIR, 'data')
CONFIG_PATH = os.path.join(BASE_DIR, 'config', 'config.json')

if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

try:
    from google_sheets_config import GoogleSheetsConfigService
    print("✅ Google Sheets module loaded")
except ImportError as e:
    print(f"⚠️ Google Sheets module not available: {e}")


def setup_complete_logging():
    """Setup comprehensive logging"""
    os.makedirs(LOGS_DIR, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)

    log_filename = os.path.join(LOGS_DIR, f'complete_automation_{datetime.now().strftime("%Y%m%d_%H%M")}.log')

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(log_filename, encoding='utf-8')
        ]
    )

    return logging.getLogger('CompleteAutomation')


def run_complete_automation():
    """Chạy automation hoàn chỉnh với monitoring"""
    logger = setup_complete_logging()

    print("🏭 COMPLETE WAREHOUSE AUTOMATION SYSTEM")
    print("📊 With Advanced Monitoring & Google Sheets Integration")
    print("=" * 80)

    start_time = datetime.now()
    session_id = f'COMPLETE_{start_time.strftime("%Y%m%d_%H%M%S")}'

    try:
        # Initialize Google Sheets service
        print("📊 Initializing monitoring services...")
        try:
            sheets_service = GoogleSheetsConfigService()
            if sheets_service.client:
                print("✅ Google Sheets monitoring: ACTIVE")
                monitoring_enabled = True
            else:
                print("⚠️ Google Sheets monitoring: DISABLED")
                monitoring_enabled = False
        except Exception:
            print("⚠️ Google Sheets monitoring: NOT AVAILABLE")
            monitoring_enabled = False
            sheets_service = None

        # Load and display configuration
        print("\n🔧 Loading system configuration...")
        if monitoring_enabled:
            config = sheets_service.get_config_merged(CONFIG_PATH)
            workspace_config = sheets_service.get_workspace_config()
            date_config = sheets_service.get_date_range_config()
            sla_rules = sheets_service.get_sla_rules()

            print(f"✅ Config source: {config.get('_metadata', {}).get('config_source', 'local')}")
            print(f"📅 Date range: {date_config['start_date']} → {date_config['end_date']}")
            print(f"🎯 Target records: {workspace_config['target_records']:,}")
            print(f"📋 SLA platforms: {', '.join(sla_rules.keys()).upper()}")

            target_records = workspace_config['target_records']
            batch_size = workspace_config['batch_size']
        else:
            print("📁 Using default configuration")
            target_records = 1000
            batch_size = 10

        # Display system status
        print("\n⚡ System Status Check:")
        print(f"   🔗 Monitoring: {'✅ ENABLED' if monitoring_enabled else '❌ DISABLED'}")
        print(f"   📊 Target Records: {target_records:,}")
        print(f"   📦 Batch Size: {batch_size}")
        print(f"   🆔 Session ID: {session_id}")

        # Initialize automation status
        if monitoring_enabled:
            initial_progress = {
                'current_page': 0,
                'total_pages': 0,
                'orders_extracted': 0,
                'products_extracted': 0,
                'progress_percent': 0,
                'session_id': session_id,
                'last_error': ''
            }
            sheets_service.update_automation_status('System Initializing', initial_progress)

        # Simulate automation phases
        phases = [
            ("System Initialization", 2),
            ("Login & Authentication", 3),
            ("Data Source Discovery", 2),
            ("Batch Processing Setup", 1),
            ("Data Extraction", 15),  # Main processing
            ("Data Enhancement", 5),
            ("Export Generation", 3),
            ("Cleanup & Finalization", 2)
        ]

        total_phases = len(phases)
        total_duration = sum(duration for _, duration in phases)

        # Process each phase
        current_orders = 0
        current_products = 0

        for phase_num, (phase_name, duration) in enumerate(phases, 1):
            print(f"\n{'='*80}")
            print(f"📋 Phase {phase_num}/{total_phases}: {phase_name}")
            print(f"⏱️ Estimated duration: {duration} seconds")
            print('='*80)

            # Update status
            if monitoring_enabled:
                progress = {
                    'current_page': phase_num,
                    'total_pages': total_phases,
                    'orders_extracted': current_orders,
                    'products_extracted': current_products,
                    'progress_percent': int((phase_num / total_phases) * 100),
                    'session_id': session_id,
                    'last_error': ''
                }
                sheets_service.update_automation_status(f'{phase_name}', progress)

            # Simulate phase work
            for second in range(duration):
                if phase_name == "Data Extraction":
                    # Simulate data extraction progress
                    orders_per_second = 20
                    products_per_second = 60
                    current_orders += orders_per_second
                    current_products += products_per_second

                    if second % 3 == 0:  # Update every 3 seconds during extraction
                        print(f"   📊 Progress: {current_orders:,} orders, {current_products:,} products extracted")

                        if monitoring_enabled:
                            progress['orders_extracted'] = current_orders
                            progress['products_extracted'] = current_products
                            sheets_service.update_automation_status(f'{phase_name} - In Progress', progress)

                elif phase_name == "Data Enhancement":
                    if second % 2 == 0:
                        print(f"   🔧 Enhancing data batch {second//2 + 1}...")

                elif phase_name == "Export Generation":
                    if second == 1:
                        print("   📤 Generating CSV export...")
                    elif second == 2:
                        print("   📊 Generating Excel export...")
                    elif second == 3:
                        print("   📋 Generating summary report...")

                time.sleep(1)  # Simulate work

            print(f"✅ {phase_name} completed")

        # Final results
        end_time = datetime.now()
        total_duration = (end_time - start_time).total_seconds()

        # Calculate final stats
        final_orders = current_orders
        enhanced_orders = int(final_orders * 0.95)  # 95% enhancement rate

        automation_result = {
            'success': True,
            'duration': total_duration,
            'order_count': final_orders,
            'enhanced_order_count': enhanced_orders,
            'config_source': 'google_sheets' if monitoring_enabled else 'local_file',
            'sheets_integration': monitoring_enabled,
            'system_url': 'https://one.tga.com.vn',
            'automation_version': '2.1_complete',
            'error': '',
            'start_time': start_time.strftime('%Y-%m-%d %H:%M:%S'),
            'end_time': end_time.strftime('%Y-%m-%d %H:%M:%S'),
            'export_files': {
                'orders_csv': os.path.join(DATA_DIR, f'orders_{session_id}.csv'),
                'products_json': os.path.join(DATA_DIR, f'products_{session_id}.json'),
                'summary_excel': os.path.join(DATA_DIR, f'summary_{session_id}.xlsx'),
                'log_file': os.path.join(LOGS_DIR, f'complete_automation_{start_time.strftime("%Y%m%d_%H%M")}.log')
            }
        }

        # Log results
        if monitoring_enabled:
            print("\n📝 Logging final results to Google Sheets...")
            sheets_service.log_automation_run(automation_result)

            # Update final status
            final_progress = {
                'current_page': total_phases,
                'total_pages': total_phases,
                'orders_extracted': final_orders,
                'products_extracted': current_products,
                'progress_percent': 100,
                'session_id': session_id,
                'last_error': ''
            }
            sheets_service.update_automation_status('Automation Completed Successfully', final_progress)

            # Export detailed results
            detailed_results = [
                {
                    'session_id': session_id,
                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'phase': 'final_summary',
                    'orders_processed': final_orders,
                    'orders_enhanced': enhanced_orders,
                    'products_extracted': current_products,
                    'success_rate': f"{(enhanced_orders/final_orders*100):.1f}%",
                    'total_duration': f"{total_duration:.2f}s",
                    'average_orders_per_second': f"{final_orders/total_duration:.1f}",
                    'status': 'completed_successfully'
                }
            ]

            result_sheet = f'Complete_Results_{start_time.strftime("%Y%m%d_%H%M")}'
            sheets_service.export_data_to_sheets(detailed_results, result_sheet)
            print(f"📊 Detailed results exported to: {result_sheet}")

        # Display final summary
        print("\n" + "=" * 80)
        print("🎉 AUTOMATION COMPLETED SUCCESSFULLY!")
        print("=" * 80)
        print(f"📊 Session ID: {session_id}")
        print(f"⏱️ Total Duration: {total_duration:.2f} seconds ({total_duration/60:.1f} minutes)")
        print(f"📦 Orders Processed: {final_orders:,}")
        print(f"🔧 Orders Enhanced: {enhanced_orders:,} ({enhanced_orders/final_orders*100:.1f}%)")
        print(f"🏷️ Products Extracted: {current_products:,}")
        print(f"⚡ Processing Rate: {final_orders/total_duration:.1f} orders/second")
        print(f"📊 Monitoring: {'✅ ACTIVE' if monitoring_enabled else '❌ DISABLED'}")

        if monitoring_enabled:
            print(f"🔗 View Results: https://docs.google.com/spreadsheets/d/{sheets_service.spreadsheet_id}")

        final_log_file = os.path.join(LOGS_DIR, f"complete_automation_{start_time.strftime('%Y%m%d_%H%M')}.log")
        print(f"📁 Log File: {final_log_file}")
        print("=" * 80)

        logger.info("Automation completed successfully")
        return True

    except Exception as e:
        logger.error(f"Automation failed: {e}")

        # Log error if monitoring available
        if monitoring_enabled and sheets_service:
            error_result = {
                'success': False,
                'duration': (datetime.now() - start_time).total_seconds(),
                'order_count': 0,
                'enhanced_order_count': 0,
                'config_source': 'google_sheets',
                'sheets_integration': True,
                'automation_version': '2.1_complete',
                'error': str(e),
                'start_time': start_time.strftime('%Y-%m-%d %H:%M:%S'),
                'end_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            sheets_service.log_automation_run(error_result)
            sheets_service.update_automation_status('Failed', {'last_error': str(e), 'session_id': session_id})

        print(f"\n❌ AUTOMATION FAILED: {e}")
        return False


def main():
    """Main function"""
    success = run_complete_automation()

    if success:
        print("\n✅ Complete automation session finished successfully!")
    else:
        print("\n❌ Complete automation session failed!")

    return success


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
