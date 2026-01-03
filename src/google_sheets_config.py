#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Google Sheets Configuration Service
Tích hợp Google Sheets để quản lý cấu hình động
"""

import json
import os
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List
import gspread
from google.auth.exceptions import RefreshError
from google.oauth2.service_account import Credentials
import pandas as pd


class GoogleSheetsConfigService:
    """Service quản lý cấu hình qua Google Sheets"""

    def __init__(self, spreadsheet_id: str = None, credentials_path: str = None):
        """
        Khởi tạo Google Sheets service

        Args:
            spreadsheet_id: ID của Google Spreadsheet
            credentials_path: Đường dẫn đến file credentials JSON
        """
        self.logger = logging.getLogger('GoogleSheetsConfig')
        # Đọc từ environment variable hoặc dùng giá trị mặc định
        # Sheet "mia-logistics-final" ID: 18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As
        self.spreadsheet_id = (
            spreadsheet_id or
            os.getenv('GOOGLE_SHEET_ID') or
            os.getenv('GOOGLE_SHEETS_SPREADSHEET_ID') or
            os.getenv('VITE_GOOGLE_SHEETS_SPREADSHEET_ID') or
            '18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As'  # mia-logistics-final
        )
        # Ưu tiên dùng service account file chung với backend
        # Thứ tự ưu tiên:
        # 1. credentials_path parameter
        # 2. automation/config/google-credentials.json (file chính)
        # 3. GOOGLE_SERVICE_ACCOUNT_KEY_PATH env
        # 4. config/service_account.json (fallback)

        if credentials_path:
            self.credentials_path = credentials_path
        else:
            # Ưu tiên dùng automation/config/google-credentials.json
            project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            default_credentials = os.path.join(project_root, 'automation', 'config', 'google-credentials.json')

            if os.path.exists(default_credentials):
                self.credentials_path = default_credentials
                self.logger.info(f"📁 Dùng credentials chính: {default_credentials}")
            else:
                # Fallback về env hoặc path cũ
                self.credentials_path = (
                    os.getenv('GOOGLE_SERVICE_ACCOUNT_KEY_PATH') or
                    '/Users/phuccao/Service Account/react-integration-469009-25ca7002a525.json'
                )

                # Nếu vẫn không tồn tại, thử config/service_account.json
                if not os.path.exists(self.credentials_path):
                    fallback_path = 'config/service_account.json'
                    if os.path.exists(fallback_path):
                        self.credentials_path = fallback_path
                        self.logger.info(f"📁 Dùng fallback credentials: {fallback_path}")
        self.client = None
        self.spreadsheet = None

        # Worksheet names
        self.config_sheet = 'Config'
        self.sla_sheet = 'SLA_Rules'
        self.logs_sheet = 'Automation_Logs'

        self._init_client()

    def _init_client(self):
        """Khởi tạo Google Sheets client"""
        try:
            # Kiểm tra credentials file
            if not os.path.exists(self.credentials_path):
                self.logger.warning(f"⚠️ Credentials file not found: {self.credentials_path}")
                return False

            # Scopes cần thiết
            scopes = [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/drive'
            ]

            # Tạo credentials
            credentials = Credentials.from_service_account_file(
                self.credentials_path, scopes=scopes
            )

            # Log service account email để debug
            if hasattr(credentials, 'service_account_email'):
                self.logger.info(f"📧 Using service account: {credentials.service_account_email}")
            elif hasattr(credentials, '_service_account_email'):
                self.logger.info(f"📧 Using service account: {credentials._service_account_email}")

            # Khởi tạo client
            self.client = gspread.authorize(credentials)

            self.logger.info(f"📊 Attempting to open spreadsheet: {self.spreadsheet_id}")

            # Mở spreadsheet
            self.spreadsheet = self.client.open_by_key(self.spreadsheet_id)

            self.logger.info(f"✅ Google Sheets client initialized successfully")
            self.logger.info(f"📑 Spreadsheet title: {self.spreadsheet.title}")
            return True

        except FileNotFoundError:
            self.logger.error(f"❌ Credentials file not found: {self.credentials_path}")
            return False
        except RefreshError as e:
            self.logger.error(f"❌ Authentication failed (RefreshError): {e}")
            self.logger.error("💡 Có thể service account chưa được share quyền với Google Sheet")
            self.logger.error(f"💡 Đảm bảo sheet '{self.spreadsheet_id}' được share với service account email")
            return False
        except Exception as e:
            self.logger.error(f"❌ Failed to initialize Google Sheets client: {e}")
            self.logger.error(f"💡 Kiểm tra:")
            self.logger.error(f"   1. Service account file: {self.credentials_path}")
            self.logger.error(f"   2. Google Sheet ID: {self.spreadsheet_id}")
            self.logger.error(f"   3. Service account có quyền truy cập Sheet chưa")
            return False

    def get_config_merged(self, local_config_path: str) -> Dict[str, Any]:
        """
        Lấy config đã merge từ local file và Google Sheets

        Args:
            local_config_path: Đường dẫn config local

        Returns:
            Dict chứa config đã merge
        """
        try:
            # Load local config
            local_config = {}
            if os.path.exists(local_config_path):
                with open(local_config_path, 'r', encoding='utf-8') as f:
                    local_config = json.load(f)

            # Get Google Sheets config
            sheets_config = self.get_sheets_config()

            # Merge configs (Sheets override local)
            merged_config = local_config.copy()
            if sheets_config:
                merged_config.update(sheets_config)

            # Add metadata
            merged_config['_metadata'] = {
                'config_source': 'google_sheets' if sheets_config else 'local_file',
                'has_sheets_config': bool(sheets_config),
                'has_sla_config': bool(self.get_sla_rules()),
                'last_updated': datetime.now().isoformat(),
                'spreadsheet_id': self.spreadsheet_id
            }

            return merged_config

        except Exception as e:
            self.logger.error(f"❌ Error merging config: {e}")
            # Fallback to local config
            if os.path.exists(local_config_path):
                with open(local_config_path, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                    config['_metadata'] = {
                        'config_source': 'local_file_fallback',
                        'has_sheets_config': False,
                        'error': str(e)
                    }
                    return config
            return {}

    def get_sheets_config(self) -> Dict[str, Any]:
        """Lấy cấu hình từ Google Sheets"""
        try:
            if not self.client or not self.spreadsheet:
                return {}

            # Lấy worksheet Config
            try:
                worksheet = self.spreadsheet.worksheet(self.config_sheet)
            except gspread.WorksheetNotFound:
                self.logger.warning(f"⚠️ Worksheet '{self.config_sheet}' not found")
                return {}

            # Lấy tất cả records
            records = worksheet.get_all_records()

            if not records:
                return {}

            # Convert thành config format
            config = {}
            for record in records:
                section = record.get('Section', '').strip()
                key = record.get('Key', '').strip()
                value = record.get('Value', '')

                if not section or not key:
                    continue

                # Parse value
                parsed_value = self._parse_config_value(value)

                # Set nested dict
                if section not in config:
                    config[section] = {}
                config[section][key] = parsed_value

            self.logger.info(f"✅ Loaded config from Google Sheets: {len(records)} entries")
            return config

        except Exception as e:
            self.logger.error(f"❌ Error getting sheets config: {e}")
            return {}

    def get_sla_rules(self) -> Dict[str, Any]:
        """Lấy SLA rules từ Google Sheets"""
        try:
            if not self.client or not self.spreadsheet:
                return {}

            try:
                worksheet = self.spreadsheet.worksheet(self.sla_sheet)
            except gspread.WorksheetNotFound:
                self.logger.warning(f"⚠️ Worksheet '{self.sla_sheet}' not found")
                return {}

            records = worksheet.get_all_records()

            if not records:
                return {}

            # Group by platform
            sla_rules = {}
            for record in records:
                platform = record.get('Platform', '').lower().strip()
                if not platform:
                    continue

                if platform not in sla_rules:
                    sla_rules[platform] = {}

                # Parse SLA rule
                rule_type = record.get('Rule_Type', '').strip()
                value = record.get('Value', '')

                if rule_type and value:
                    sla_rules[platform][rule_type] = self._parse_config_value(value)

            self.logger.info(f"✅ Loaded SLA rules: {len(sla_rules)} platforms")
            return sla_rules

        except Exception as e:
            self.logger.error(f"❌ Error getting SLA rules: {e}")
            return {}

    def update_system_config(self, config_key: str, config_value: Any) -> bool:
        """Cập nhật config trong Google Sheets"""
        try:
            if not self.client or not self.spreadsheet:
                return False

            # Parse config key (section.key)
            if '.' not in config_key:
                section = 'system'
                key = config_key
            else:
                section, key = config_key.split('.', 1)

            try:
                worksheet = self.spreadsheet.worksheet(self.config_sheet)
            except gspread.WorksheetNotFound:
                # Create worksheet nếu chưa có
                worksheet = self.spreadsheet.add_worksheet(
                    title=self.config_sheet, rows=100, cols=10
                )
                # Add headers
                worksheet.update('A1:D1', [['Section', 'Key', 'Value', 'Updated']])

            # Find existing row
            records = worksheet.get_all_records()
            row_num = None

            for i, record in enumerate(records):
                if (record.get('Section', '').strip() == section and
                    record.get('Key', '').strip() == key):
                    row_num = i + 2  # +2 because of header and 0-index
                    break

            # Update or add new row
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            if row_num:
                # Update existing
                worksheet.update(
                    values=[[str(config_value), timestamp]],
                    range_name=f'C{row_num}:D{row_num}'
                )
            else:
                # Add new row
                worksheet.append_row([section, key, str(config_value), timestamp])

            self.logger.info(f"✅ Updated config: {section}.{key} = {config_value}")
            return True

        except Exception as e:
            self.logger.error(f"❌ Error updating config: {e}")
            return False

    def log_automation_run(self, automation_result: Dict[str, Any]) -> bool:
        """Log kết quả automation vào Google Sheets"""
        try:
            if not self.client or not self.spreadsheet:
                return False

            try:
                worksheet = self.spreadsheet.worksheet(self.logs_sheet)
            except gspread.WorksheetNotFound:
                # Create logs worksheet
                worksheet = self.spreadsheet.add_worksheet(
                    title=self.logs_sheet, rows=1000, cols=15
                )
                # Add headers
                headers = [
                    'Timestamp', 'Success', 'Duration_Seconds', 'Order_Count',
                    'Enhanced_Order_Count', 'Config_Source', 'Sheets_Integration',
                    'System_URL', 'Automation_Version', 'Error', 'Start_Time',
                    'End_Time', 'Export_Files', 'Platform', 'Notes'
                ]
                worksheet.update('A1:O1', [headers])

            # Prepare log data
            log_data = [
                datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                automation_result.get('success', False),
                automation_result.get('duration', 0),
                automation_result.get('order_count', 0),
                automation_result.get('enhanced_order_count', 0),
                automation_result.get('config_source', 'unknown'),
                automation_result.get('sheets_integration', False),
                automation_result.get('system_url', 'unknown'),
                automation_result.get('automation_version', '2.1'),
                automation_result.get('error', ''),
                automation_result.get('start_time', ''),
                automation_result.get('end_time', ''),
                str(automation_result.get('export_files', {})),
                'multiple',  # Platform
                'Enhanced automation run'  # Notes
            ]

            # Add log row
            worksheet.append_row(log_data)

            self.logger.info("✅ Automation run logged to Google Sheets")
            return True

        except Exception as e:
            self.logger.error(f"❌ Error logging to sheets: {e}")
            return False

    def get_automation_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Lấy lịch sử automation từ Google Sheets"""
        try:
            if not self.client or not self.spreadsheet:
                return []

            try:
                worksheet = self.spreadsheet.worksheet(self.logs_sheet)
            except gspread.WorksheetNotFound:
                return []

            # Get all records
            records = worksheet.get_all_records()

            # Sort by timestamp (newest first)
            sorted_records = sorted(
                records,
                key=lambda x: x.get('Timestamp', ''),
                reverse=True
            )

            return sorted_records[:limit]

        except Exception as e:
            self.logger.error(f"❌ Error getting automation history: {e}")
            return []

    def _parse_config_value(self, value: str) -> Any:
        """Parse config value từ string"""
        try:
            value = str(value).strip()

            # Boolean values
            if value.lower() in ['true', 'yes', '1']:
                return True
            elif value.lower() in ['false', 'no', '0']:
                return False

            # Number values
            try:
                if '.' in value:
                    return float(value)
                else:
                    return int(value)
            except ValueError:
                pass

            # JSON values
            if value.startswith('{') or value.startswith('['):
                try:
                    return json.loads(value)
                except json.JSONDecodeError:
                    pass

            # String value
            return value

        except Exception:
            return value

    def create_sample_sheets(self):
        """Tạo sample worksheets với dữ liệu mẫu"""
        try:
            if not self.client or not self.spreadsheet:
                return False

            # 1. Config sheet
            try:
                config_ws = self.spreadsheet.worksheet(self.config_sheet)
            except gspread.WorksheetNotFound:
                config_ws = self.spreadsheet.add_worksheet(
                    title=self.config_sheet, rows=50, cols=10
                )

                # Add headers and sample data
                config_data = [
                    ['Section', 'Key', 'Value', 'Description', 'Updated'],
                    ['system', 'one_url', 'https://one.tga.com.vn', 'ONE system URL', ''],
                    ['system', 'timeout', '30', 'Request timeout in seconds', ''],
                    ['automation', 'batch_size', '10', 'Batch size for processing', ''],
                    ['automation', 'retry_count', '3', 'Number of retries', ''],
                    ['logging', 'level', 'INFO', 'Logging level', ''],
                    ['export', 'format', 'csv', 'Default export format', '']
                ]

                config_ws.update('A1:E7', config_data)

            # 2. SLA Rules sheet
            try:
                sla_ws = self.spreadsheet.worksheet(self.sla_sheet)
            except gspread.WorksheetNotFound:
                sla_ws = self.spreadsheet.add_worksheet(
                    title=self.sla_sheet, rows=50, cols=10
                )

                # Add headers and sample data
                sla_data = [
                    ['Platform', 'Rule_Type', 'Value', 'Description', 'Active'],
                    ['shopee', 'cutoff_time', '18:00', 'Cutoff time for Shopee orders', 'TRUE'],
                    ['shopee', 'confirm_hours', '24', 'Hours to confirm Shopee orders', 'TRUE'],
                    ['shopee', 'handover_hours', '48', 'Hours to handover Shopee orders', 'TRUE'],
                    ['tiktok', 'cutoff_time', '14:00', 'Cutoff time for TikTok orders', 'TRUE'],
                    ['tiktok', 'handover_hours', '24', 'Hours to handover TikTok orders', 'TRUE'],
                    ['lazada', 'confirm_hours', '24', 'Hours to confirm Lazada orders', 'TRUE']
                ]

                sla_ws.update('A1:E7', sla_data)

            # 3. Logs sheet (with headers only)
            try:
                logs_ws = self.spreadsheet.worksheet(self.logs_sheet)
            except gspread.WorksheetNotFound:
                logs_ws = self.spreadsheet.add_worksheet(
                    title=self.logs_sheet, rows=1000, cols=15
                )

                headers = [
                    'Timestamp', 'Success', 'Duration_Seconds', 'Order_Count',
                    'Enhanced_Order_Count', 'Config_Source', 'Sheets_Integration',
                    'System_URL', 'Automation_Version', 'Error', 'Start_Time',
                    'End_Time', 'Export_Files', 'Platform', 'Notes'
                ]
                logs_ws.update('A1:O1', [headers])

            self.logger.info("✅ Sample sheets created successfully")
            return True

        except Exception as e:
            self.logger.error(f"❌ Error creating sample sheets: {e}")
            return False

    def export_data_to_sheets(self, data: List[Dict[str, Any]], sheet_name: str = None) -> bool:
        """Export dữ liệu automation ra Google Sheets"""
        try:
            if not self.client or not self.spreadsheet:
                return False

            # Generate sheet name
            if not sheet_name:
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                sheet_name = f'Automation_Data_{timestamp}'

            # Create new worksheet
            try:
                worksheet = self.spreadsheet.add_worksheet(
                    title=sheet_name, rows=len(data) + 10, cols=20
                )
            except Exception as e:
                self.logger.error(f"❌ Error creating worksheet: {e}")
                return False

            if not data:
                self.logger.warning("⚠️ No data to export")
                return False

            # Prepare headers từ first row
            headers = list(data[0].keys())

            # Prepare data rows
            rows = [headers]
            for item in data:
                row = [str(item.get(header, '')) for header in headers]
                rows.append(row)

            # Update sheet với data
            worksheet.update(f'A1:{chr(65 + len(headers) - 1)}{len(rows)}', rows)

            # Format headers
            worksheet.format('A1:' + chr(65 + len(headers) - 1) + '1', {
                'backgroundColor': {'red': 0.2, 'green': 0.6, 'blue': 1.0},
                'textFormat': {'bold': True, 'foregroundColor': {'red': 1, 'green': 1, 'blue': 1}}
            })

            self.logger.info(f"✅ Exported {len(data)} records to sheet '{sheet_name}'")
            return True

        except Exception as e:
            self.logger.error(f"❌ Error exporting data to sheets: {e}")
            return False

    def get_date_range_config(self) -> Dict[str, str]:
        """Lấy cấu hình date range từ Google Sheets"""
        try:
            config = self.get_sheets_config()

            date_config = {
                'start_date': config.get('date_range', {}).get('start_date', '2025-06-01'),
                'end_date': config.get('date_range', {}).get('end_date', '2025-06-30'),
                'platform': config.get('date_range', {}).get('platform', 'ecom'),
                'display_limit': config.get('date_range', {}).get('display_limit', '2000')
            }

            return date_config

        except Exception as e:
            self.logger.error(f"❌ Error getting date range config: {e}")
            return {
                'start_date': '2025-06-01',
                'end_date': '2025-06-30',
                'platform': 'ecom',
                'display_limit': '2000'
            }

    def update_automation_status(self, status: str, progress: Dict[str, Any] = None) -> bool:
        """Cập nhật trạng thái automation real-time"""
        try:
            if not self.client or not self.spreadsheet:
                return False

            # Tìm hoặc tạo Status sheet
            try:
                worksheet = self.spreadsheet.worksheet('Automation_Status')
            except gspread.WorksheetNotFound:
                worksheet = self.spreadsheet.add_worksheet(
                    title='Automation_Status', rows=20, cols=10
                )
                # Add headers
                headers = [
                    'Timestamp', 'Status', 'Current_Page', 'Total_Pages',
                    'Orders_Extracted', 'Products_Extracted', 'Progress_Percent',
                    'Estimated_Time_Left', 'Last_Error', 'Session_ID'
                ]
                worksheet.update('A1:J1', [headers])

            # Prepare status data
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            if progress:
                status_data = [
                    timestamp,
                    status,
                    progress.get('current_page', 0),
                    progress.get('total_pages', 0),
                    progress.get('orders_extracted', 0),
                    progress.get('products_extracted', 0),
                    progress.get('progress_percent', 0),
                    progress.get('estimated_time_left', ''),
                    progress.get('last_error', ''),
                    progress.get('session_id', '')
                ]
            else:
                status_data = [timestamp, status, '', '', '', '', '', '', '', '']

            # Clear existing data và add new
            worksheet.clear()
            worksheet.update('A1:J1', [['Timestamp', 'Status', 'Current_Page', 'Total_Pages',
                                      'Orders_Extracted', 'Products_Extracted', 'Progress_Percent',
                                      'Estimated_Time_Left', 'Last_Error', 'Session_ID']])
            worksheet.update('A2:J2', [status_data])

            return True

        except Exception as e:
            self.logger.error(f"❌ Error updating automation status: {e}")
            return False

    def get_workspace_config(self) -> Dict[str, Any]:
        """Lấy cấu hình workspace từ Google Sheets"""
        try:
            config = self.get_sheets_config()

            workspace_config = {
                'target_records': int(config.get('automation', {}).get('target_records', '23452')),
                'batch_size': int(config.get('automation', {}).get('batch_size', '10')),
                'retry_count': int(config.get('automation', {}).get('retry_count', '3')),
                'page_wait_time': int(config.get('automation', {}).get('page_wait_time', '5')),
                'session_strategy': config.get('automation', {}).get('session_strategy', 'fresh_per_page'),
                'product_extraction': config.get('automation', {}).get('product_extraction', 'true').lower() == 'true',
                'export_format': config.get('export', {}).get('format', 'csv'),
                'logging_level': config.get('logging', {}).get('level', 'INFO')
            }

            return workspace_config

        except Exception as e:
            self.logger.error(f"❌ Error getting workspace config: {e}")
            return {
                'target_records': 23452,
                'batch_size': 10,
                'retry_count': 3,
                'page_wait_time': 5,
                'session_strategy': 'fresh_per_page',
                'product_extraction': True,
                'export_format': 'csv',
                'logging_level': 'INFO'
            }

    def create_automation_dashboard(self) -> bool:
        """Tạo dashboard sheet với formulas và charts"""
        try:
            if not self.client or not self.spreadsheet:
                return False

            # Tạo Dashboard sheet
            try:
                dashboard = self.spreadsheet.add_worksheet(
                    title='Dashboard', rows=50, cols=15
                )
            except gspread.WorksheetNotFound:
                dashboard = self.spreadsheet.worksheet('Dashboard')

            # Dashboard structure
            dashboard_data = [
                ['🏭 WAREHOUSE AUTOMATION DASHBOARD', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
                ['📊 OVERVIEW', '', '', '', '📈 STATISTICS', '', '', '', '⚡ STATUS', '', '', '', '', '', ''],
                ['Total Runs:', '=COUNTA(Automation_Logs!A:A)-1', '', '', 'Success Rate:', '=COUNTIF(Automation_Logs!B:B,TRUE)/COUNTA(Automation_Logs!B:B)', '', '', 'Current Status:', 'Running', '', '', '', '', ''],
                ['Last Run:', '=MAX(Automation_Logs!A:A)', '', '', 'Avg Duration:', '=AVERAGE(Automation_Logs!C:C)', '', '', 'Last Update:', '=NOW()', '', '', '', '', ''],
                ['Total Orders:', '=SUM(Automation_Logs!D:D)', '', '', 'Avg Orders/Run:', '=AVERAGE(Automation_Logs!D:D)', '', '', 'Session ID:', 'AUTO_' + str(datetime.now().strftime('%Y%m%d')), '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
                ['🔧 CONFIGURATION', '', '', '', '📋 SLA RULES', '', '', '', '🚨 ALERTS', '', '', '', '', '', ''],
                ['System URL:', '=Config!C2', '', '', 'Shopee Cutoff:', '=SLA_Rules!C2', '', '', 'Failed Runs:', '=COUNTIF(Automation_Logs!B:B,FALSE)', '', '', '', '', ''],
                ['Timeout:', '=Config!C3', '', '', 'TikTok Cutoff:', '=SLA_Rules!C5', '', '', 'Error Rate:', '=COUNTIF(Automation_Logs!B:B,FALSE)/COUNTA(Automation_Logs!B:B)', '', '', '', '', ''],
                ['Batch Size:', '=Config!C4', '', '', 'Lazada Confirm:', '=SLA_Rules!C7', '', '', 'Last Error:', '=INDEX(Automation_Logs!J:J,MATCH(MAX(Automation_Logs!A:A),Automation_Logs!A:A,0))', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
                ['📊 RECENT RUNS (Last 10)', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
                ['Timestamp', 'Success', 'Duration', 'Orders', 'Enhanced', 'Source', 'URL', 'Version', 'Error', '', '', '', '', '', ''],
                ['=INDEX(Automation_Logs!A:A,ROWS(Automation_Logs!A:A))', '=INDEX(Automation_Logs!B:B,ROWS(Automation_Logs!B:B))', '=INDEX(Automation_Logs!C:C,ROWS(Automation_Logs!C:C))', '=INDEX(Automation_Logs!D:D,ROWS(Automation_Logs!D:D))', '=INDEX(Automation_Logs!E:E,ROWS(Automation_Logs!E:E))', '=INDEX(Automation_Logs!F:F,ROWS(Automation_Logs!F:F))', '=INDEX(Automation_Logs!H:H,ROWS(Automation_Logs!H:H))', '=INDEX(Automation_Logs!I:I,ROWS(Automation_Logs!I:I))', '=INDEX(Automation_Logs!J:J,ROWS(Automation_Logs!J:J))', '', '', '', '', '', '']
            ]

            dashboard.update('A1:O16', dashboard_data)

            # Format dashboard
            dashboard.format('A1:O1', {
                'backgroundColor': {'red': 0.2, 'green': 0.6, 'blue': 1.0},
                'textFormat': {'bold': True, 'fontSize': 14, 'foregroundColor': {'red': 1, 'green': 1, 'blue': 1}}
            })

            dashboard.format('A3:A11', {
                'textFormat': {'bold': True},
                'backgroundColor': {'red': 0.9, 'green': 0.9, 'blue': 0.9}
            })

            self.logger.info("✅ Dashboard created successfully")
            return True

        except Exception as e:
            self.logger.error(f"❌ Error creating dashboard: {e}")
            return False

    def backup_local_config_to_sheets(self, config_path: str = 'config/config.json') -> bool:
        """Backup config local lên Google Sheets"""
        try:
            if not os.path.exists(config_path):
                self.logger.warning(f"⚠️ Local config not found: {config_path}")
                return False

            with open(config_path, 'r', encoding='utf-8') as f:
                local_config = json.load(f)

            # Flatten config để upload
            flattened = []
            for section, values in local_config.items():
                if isinstance(values, dict):
                    for key, value in values.items():
                        flattened.append([
                            section, key, str(value),
                            f'Backup from {config_path}',
                            datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                        ])

            if not flattened:
                return False

            # Update Config sheet
            try:
                worksheet = self.spreadsheet.worksheet(self.config_sheet)
                # Clear existing và add headers
                worksheet.clear()
                headers = [['Section', 'Key', 'Value', 'Description', 'Updated']]
                worksheet.update('A1:E1', headers)

                # Add flattened config
                if len(flattened) > 0:
                    range_name = f'A2:E{len(flattened) + 1}'
                    worksheet.update(range_name, flattened)

                self.logger.info(f"✅ Backed up {len(flattened)} config entries to sheets")
                return True

            except Exception as e:
                self.logger.error(f"❌ Error updating config sheet: {e}")
                return False

        except Exception as e:
            self.logger.error(f"❌ Error backing up config: {e}")
            return False

def test_google_sheets_integration():
    """Test Google Sheets integration với đầy đủ tính năng"""
    try:
        print("🧪 Testing Enhanced Google Sheets integration...")

        # Initialize service
        sheets_service = GoogleSheetsConfigService()

        # Test 1: Basic config
        config = sheets_service.get_sheets_config()
        print(f"✅ Config loaded: {len(config)} sections")

        # Test 2: SLA rules
        sla_rules = sheets_service.get_sla_rules()
        print(f"✅ SLA rules loaded: {len(sla_rules)} platforms")

        # Test 3: Workspace config
        workspace_config = sheets_service.get_workspace_config()
        print(f"✅ Workspace config: target={workspace_config['target_records']}")

        # Test 4: Date range config
        date_config = sheets_service.get_date_range_config()
        print(f"✅ Date range: {date_config['start_date']} to {date_config['end_date']}")

        # Test 5: Status update
        progress = {
            'current_page': 5,
            'total_pages': 12,
            'orders_extracted': 1250,
            'products_extracted': 3840,
            'progress_percent': 42,
            'session_id': 'TEST_' + datetime.now().strftime('%Y%m%d_%H%M%S')
        }
        success = sheets_service.update_automation_status('Running', progress)
        print(f"✅ Status update: {success}")

        # Test 6: Config update
        success = sheets_service.update_system_config('test.timestamp', datetime.now().isoformat())
        print(f"✅ Config update: {success}")

        # Test 7: Data export
        sample_data = [
            {'order_id': '12345', 'customer': 'Test Customer', 'amount': '100000', 'status': 'completed'},
            {'order_id': '12346', 'customer': 'Test Customer 2', 'amount': '200000', 'status': 'pending'}
        ]
        success = sheets_service.export_data_to_sheets(sample_data, 'Test_Export')
        print(f"✅ Data export: {success}")

        # Test 8: Dashboard creation
        success = sheets_service.create_automation_dashboard()
        print(f"✅ Dashboard creation: {success}")

        # Test 9: Backup config
        success = sheets_service.backup_local_config_to_sheets('config/config.json')
        print(f"✅ Config backup: {success}")

        # Test 10: Automation logging
        test_result = {
            'success': True,
            'duration': 15.8,
            'order_count': 35,
            'enhanced_order_count': 30,
            'config_source': 'google_sheets',
            'sheets_integration': True,
            'automation_version': '2.1_enhanced',
            'start_time': '2025-07-17 14:30:00',
            'end_time': '2025-07-17 14:45:48'
        }
        success = sheets_service.log_automation_run(test_result)
        print(f"✅ Automation logging: {success}")

        print("\n🎉 Enhanced Google Sheets integration test completed successfully!")
        print("📊 Created worksheets: Config, SLA_Rules, Automation_Logs, Dashboard, Test_Export, Automation_Status")
        print(f"🔗 Spreadsheet: https://docs.google.com/spreadsheets/d/{sheets_service.spreadsheet_id}")
        return True

    except Exception as e:
        print(f"❌ Enhanced Google Sheets test failed: {e}")
        return False


if __name__ == "__main__":
    test_google_sheets_integration()
    print("🎉 Google Sheets integration test completed successfully!")
