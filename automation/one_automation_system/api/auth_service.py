#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Authentication Service for MIA.vn Clone
Xử lý xác thực người dùng qua Google Sheets
"""

import json
import os
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Tuple
import hashlib
import secrets
from google_sheets_config import GoogleSheetsConfigService


class AuthenticationService:
    """Service xác thực người dùng qua Google Sheets"""

    def __init__(self, spreadsheet_id: str = None, credentials_path: str = None):
        """
        Khởi tạo Authentication service

        Args:
            spreadsheet_id: ID của Google Spreadsheet
            credentials_path: Đường dẫn đến file credentials JSON
        """
        self.logger = logging.getLogger('AuthService')
        self.sheets_service = GoogleSheetsConfigService(spreadsheet_id, credentials_path)
        self.users_sheet = 'Users'
        self.sessions_sheet = 'User_Sessions'
        self.login_logs_sheet = 'Login_Logs'

        # Initialize worksheets if not exist
        self._init_auth_worksheets()

    def _init_auth_worksheets(self):
        """Khởi tạo các worksheet cần thiết cho authentication"""
        try:
            if not self.sheets_service.client:
                self.logger.warning("⚠️ Google Sheets client not initialized")
                return

            # Initialize Users worksheet
            self._ensure_worksheet_exists(
                self.users_sheet,
                [
                    ['User ID', 'Email', 'Password Hash', 'Full Name', 'Role', 'Department',
                     'Status', 'Created Date', 'Last Login', 'Failed Attempts', 'Locked Until'],
                    ['admin001', 'admin@mia.vn',
                     self._hash_password('123456'), 'Administrator', 'admin', 'IT',
                     'ACTIVE', datetime.now().strftime('%Y-%m-%d %H:%M:%S'), '', '0', '']
                ]
            )

            # Initialize Sessions worksheet
            self._ensure_worksheet_exists(
                self.sessions_sheet,
                [
                    ['Session ID', 'User ID', 'Email', 'Created', 'Expires', 'Status', 'IP Address', 'User Agent']
                ]
            )

            # Initialize Login Logs worksheet
            self._ensure_worksheet_exists(
                self.login_logs_sheet,
                [
                    ['Timestamp', 'Email', 'Status', 'IP Address', 'User Agent', 'Error Message']
                ]
            )

        except Exception as e:
            self.logger.error(f"❌ Failed to initialize auth worksheets: {e}")

    def _ensure_worksheet_exists(self, worksheet_name: str, default_data: list):
        """Đảm bảo worksheet tồn tại và có dữ liệu mặc định"""
        try:
            worksheet = self.sheets_service.spreadsheet.worksheet(worksheet_name)
            self.logger.info(f"✅ Worksheet '{worksheet_name}' already exists")
        except:
            # Create new worksheet
            worksheet = self.sheets_service.spreadsheet.add_worksheet(
                title=worksheet_name, rows=100, cols=15
            )
            # Add default data
            if default_data:
                worksheet.update('A1', default_data)
            self.logger.info(f"✅ Created worksheet '{worksheet_name}' with default data")

    def _hash_password(self, password: str) -> str:
        """Hash password using SHA-256 with salt"""
        salt = "mia_vn_salt_2024"  # In production, use random salt per user
        return hashlib.sha256((password + salt).encode()).hexdigest()

    def _verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        return self._hash_password(password) == password_hash

    def _generate_session_id(self) -> str:
        """Generate secure session ID"""
        return secrets.token_urlsafe(32)

    def authenticate_user(self, email: str, password: str, ip_address: str = '', user_agent: str = '') -> Tuple[bool, Dict[str, Any]]:
        """
        Xác thực người dùng

        Args:
            email: Email đăng nhập
            password: Mật khẩu
            ip_address: Địa chỉ IP
            user_agent: User agent

        Returns:
            Tuple[bool, Dict]: (success, user_data/error_info)
        """
        try:
            # Log login attempt
            self._log_login_attempt(email, ip_address, user_agent)

            # Get user data
            user_data = self._get_user_by_email(email)
            if not user_data:
                self._log_login_attempt(email, ip_address, user_agent, 'FAILED', 'User not found')
                return False, {'error': 'Thông tin đăng nhập không chính xác'}

            # Check if account is locked
            if self._is_account_locked(user_data):
                self._log_login_attempt(email, ip_address, user_agent, 'FAILED', 'Account locked')
                return False, {'error': 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên'}

            # Check if account is active
            if user_data.get('status', '').upper() != 'ACTIVE':
                self._log_login_attempt(email, ip_address, user_agent, 'FAILED', 'Account inactive')
                return False, {'error': 'Tài khoản không hoạt động'}

            # Verify password
            if not self._verify_password(password, user_data.get('password_hash', '')):
                # Increase failed attempts
                self._increment_failed_attempts(user_data['user_id'])
                self._log_login_attempt(email, ip_address, user_agent, 'FAILED', 'Invalid password')
                return False, {'error': 'Thông tin đăng nhập không chính xác'}

            # Successful authentication
            # Reset failed attempts
            self._reset_failed_attempts(user_data['user_id'])

            # Update last login
            self._update_last_login(user_data['user_id'])

            # Create session
            session_data = self._create_session(user_data, ip_address, user_agent)

            # Log successful login
            self._log_login_attempt(email, ip_address, user_agent, 'SUCCESS')

            return True, {
                'user': {
                    'id': user_data['user_id'],
                    'email': user_data['email'],
                    'name': user_data['full_name'],
                    'role': user_data['role'],
                    'department': user_data['department']
                },
                'session': session_data
            }

        except Exception as e:
            self.logger.error(f"❌ Authentication error: {e}")
            self._log_login_attempt(email, ip_address, user_agent, 'ERROR', str(e))
            return False, {'error': 'Có lỗi xảy ra trong quá trình đăng nhập'}

    def _get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Lấy thông tin user theo email"""
        try:
            worksheet = self.sheets_service.spreadsheet.worksheet(self.users_sheet)
            records = worksheet.get_all_records()

            for record in records:
                if record.get('Email', '').lower() == email.lower():
                    return {
                        'user_id': record.get('User ID'),
                        'email': record.get('Email'),
                        'password_hash': record.get('Password Hash'),
                        'full_name': record.get('Full Name'),
                        'role': record.get('Role'),
                        'department': record.get('Department'),
                        'status': record.get('Status'),
                        'failed_attempts': int(record.get('Failed Attempts', 0)),
                        'locked_until': record.get('Locked Until', '')
                    }
            return None

        except Exception as e:
            self.logger.error(f"❌ Error getting user by email: {e}")
            return None

    def _is_account_locked(self, user_data: Dict[str, Any]) -> bool:
        """Kiểm tra xem tài khoản có bị khóa không"""
        try:
            locked_until = user_data.get('locked_until', '')
            if not locked_until:
                return False

            locked_time = datetime.strptime(locked_until, '%Y-%m-%d %H:%M:%S')
            return datetime.now() < locked_time

        except:
            return False

    def _increment_failed_attempts(self, user_id: str):
        """Tăng số lần đăng nhập thất bại"""
        try:
            worksheet = self.sheets_service.spreadsheet.worksheet(self.users_sheet)
            records = worksheet.get_all_records()

            for i, record in enumerate(records):
                if record.get('User ID') == user_id:
                    row_num = i + 2  # +2 vì header ở row 1 và index bắt đầu từ 0
                    failed_attempts = int(record.get('Failed Attempts', 0)) + 1

                    # Update failed attempts
                    worksheet.update(f'J{row_num}:J{row_num}', [[str(failed_attempts)]])

                    # Lock account if too many attempts
                    if failed_attempts >= 5:
                        lock_until = (datetime.now() + timedelta(minutes=15)).strftime('%Y-%m-%d %H:%M:%S')
                        worksheet.update(f'K{row_num}:K{row_num}', [[lock_until]])

                    break

        except Exception as e:
            self.logger.error(f"❌ Error incrementing failed attempts: {e}")

    def _reset_failed_attempts(self, user_id: str):
        """Reset số lần đăng nhập thất bại"""
        try:
            worksheet = self.sheets_service.spreadsheet.worksheet(self.users_sheet)
            records = worksheet.get_all_records()

            for i, record in enumerate(records):
                if record.get('User ID') == user_id:
                    row_num = i + 2
                    # Fix: Reset failed attempts and locked until
                    worksheet.update(f'J{row_num}:K{row_num}', [['0', '']])
                    break

        except Exception as e:
            self.logger.error(f"❌ Error resetting failed attempts: {e}")

    def _update_last_login(self, user_id: str):
        """Cập nhật thời gian đăng nhập cuối"""
        try:
            worksheet = self.sheets_service.spreadsheet.worksheet(self.users_sheet)
            records = worksheet.get_all_records()

            for i, record in enumerate(records):
                if record.get('User ID') == user_id:
                    row_num = i + 2
                    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    # Fix: Use correct update format with list of lists
                    worksheet.update(f'I{row_num}:I{row_num}', [[current_time]])
                    break

        except Exception as e:
            self.logger.error(f"❌ Error updating last login: {e}")

    def _create_session(self, user_data: Dict[str, Any], ip_address: str, user_agent: str) -> Dict[str, Any]:
        """Tạo session cho user"""
        try:
            session_id = self._generate_session_id()
            created = datetime.now()
            expires = created + timedelta(hours=24)  # Session expires after 24 hours

            # Save session to sheets
            worksheet = self.sheets_service.spreadsheet.worksheet(self.sessions_sheet)
            worksheet.append_row([
                session_id,
                user_data['user_id'],
                user_data['email'],
                created.strftime('%Y-%m-%d %H:%M:%S'),
                expires.strftime('%Y-%m-%d %H:%M:%S'),
                'ACTIVE',
                ip_address,
                user_agent
            ])

            return {
                'session_id': session_id,
                'expires': expires.isoformat(),
                'created': created.isoformat()
            }

        except Exception as e:
            self.logger.error(f"❌ Error creating session: {e}")
            return {}

    def _log_login_attempt(self, email: str, ip_address: str, user_agent: str, status: str = 'ATTEMPT', error_message: str = ''):
        """Log login attempt"""
        try:
            worksheet = self.sheets_service.spreadsheet.worksheet(self.login_logs_sheet)
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            worksheet.append_row([
                timestamp,
                email,
                status,
                ip_address,
                user_agent,
                error_message
            ])

        except Exception as e:
            self.logger.error(f"❌ Error logging login attempt: {e}")

    def verify_session(self, session_id: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """Xác minh session"""
        try:
            worksheet = self.sheets_service.spreadsheet.worksheet(self.sessions_sheet)
            records = worksheet.get_all_records()

            for record in records:
                if (record.get('Session ID') == session_id and
                    record.get('Status') == 'ACTIVE'):

                    # Check if session expired
                    expires = datetime.strptime(record.get('Expires'), '%Y-%m-%d %H:%M:%S')
                    if datetime.now() > expires:
                        return False, None

                    # Get user data
                    user_data = self._get_user_by_email(record.get('Email'))
                    if user_data:
                        return True, {
                            'user': {
                                'id': user_data['user_id'],
                                'email': user_data['email'],
                                'name': user_data['full_name'],
                                'role': user_data['role'],
                                'department': user_data['department']
                            },
                            'session': {
                                'session_id': session_id,
                                'expires': record.get('Expires')
                            }
                        }

            return False, None

        except Exception as e:
            self.logger.error(f"❌ Error verifying session: {e}")
            return False, None

    def logout(self, session_id: str) -> bool:
        """Đăng xuất - deactivate session"""
        try:
            worksheet = self.sheets_service.spreadsheet.worksheet(self.sessions_sheet)
            records = worksheet.get_all_records()

            for i, record in enumerate(records):
                if record.get('Session ID') == session_id:
                    row_num = i + 2
                    # Fix: Use correct update format with list of lists
                    worksheet.update(f'F{row_num}:F{row_num}', [['INACTIVE']])
                    return True

            return False

        except Exception as e:
            self.logger.error(f"❌ Error logging out: {e}")
            return False

    def add_user(self, email: str, password: str, full_name: str, role: str = 'user', department: str = '') -> bool:
        """Thêm user mới"""
        try:
            # Check if user already exists
            if self._get_user_by_email(email):
                return False

            # Generate user ID
            user_id = f"user_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

            # Add to worksheet
            worksheet = self.sheets_service.spreadsheet.worksheet(self.users_sheet)
            worksheet.append_row([
                user_id,
                email,
                self._hash_password(password),
                full_name,
                role,
                department,
                'ACTIVE',
                datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                '',
                '0',
                ''
            ])

            self.logger.info(f"✅ Added new user: {email}")
            return True

        except Exception as e:
            self.logger.error(f"❌ Error adding user: {e}")
            return False


def main():
    """Test authentication service"""
    print("🔐 TESTING AUTHENTICATION SERVICE")
    print("=" * 50)

    # Initialize service
    auth_service = AuthenticationService()

    # Test authentication
    test_cases = [
        ("admin@mia.vn", "123456"),
        ("admin@mia.vn", "wrong_password"),
        ("nonexistent@mia.vn", "123456")
    ]

    for email, password in test_cases:
        print(f"\n🧪 Testing: {email} / {password}")
        success, result = auth_service.authenticate_user(
            email, password, "127.0.0.1", "Test User Agent"
        )

        if success:
            print(f"✅ SUCCESS: {result['user']['name']} ({result['user']['role']})")
            print(f"   Session: {result['session']['session_id'][:20]}...")
        else:
            print(f"❌ FAILED: {result['error']}")

    print("\n🎉 Authentication service test completed!")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()
