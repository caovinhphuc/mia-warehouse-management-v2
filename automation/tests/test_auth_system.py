#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test Authentication System
Kiểm tra toàn bộ hệ thống xác thực trước khi chạy fullstack
"""

import os
import sys
import time
import requests
import subprocess
from auth_service import AuthenticationService

def test_google_sheets_connection():
    """Test kết nối Google Sheets"""
    print("🔍 TESTING GOOGLE SHEETS CONNECTION")
    print("=" * 50)

    try:
        auth_service = AuthenticationService()

        if auth_service.sheets_service.client:
            print("✅ Google Sheets client initialized successfully")

            # Test accessing spreadsheet
            spreadsheet = auth_service.sheets_service.spreadsheet
            print(f"✅ Spreadsheet accessible: {spreadsheet.title}")

            # Test accessing worksheets
            worksheets = spreadsheet.worksheets()
            print(f"✅ Found {len(worksheets)} worksheets:")
            for ws in worksheets:
                print(f"   - {ws.title}")

            return True
        else:
            print("❌ Failed to initialize Google Sheets client")
            return False

    except Exception as e:
        print(f"❌ Google Sheets connection error: {e}")
        return False

def test_authentication_service():
    """Test authentication service functionality"""
    print("\n🔐 TESTING AUTHENTICATION SERVICE")
    print("=" * 50)

    try:
        auth_service = AuthenticationService()

        # Test user authentication
        print("🧪 Testing user authentication...")
        success, result = auth_service.authenticate_user(
            "admin@mia.vn",
            "123456",
            "127.0.0.1",
            "Test User Agent"
        )

        if success:
            print("✅ Authentication successful")
            print(f"   User: {result['user']['name']} ({result['user']['role']})")
            print(f"   Session: {result['session']['session_id'][:20]}...")

            # Test session verification
            session_id = result['session']['session_id']
            valid, session_data = auth_service.verify_session(session_id)

            if valid:
                print("✅ Session verification successful")
            else:
                print("❌ Session verification failed")

            # Test logout
            logout_success = auth_service.logout(session_id)
            if logout_success:
                print("✅ Logout successful")
            else:
                print("❌ Logout failed")

            return True
        else:
            print(f"❌ Authentication failed: {result.get('error')}")
            return False

    except Exception as e:
        print(f"❌ Authentication service error: {e}")
        return False

def test_api_server():
    """Test API server"""
    print("\n🌐 TESTING API SERVER")
    print("=" * 50)

    try:        # Start API server in background
        print("🚀 Starting API server...")
        server_process = subprocess.Popen([
            sys.executable, "auth_api_server.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        # Wait for server to start (increased timeout)
        time.sleep(8)

        # Test health endpoint
        print("🏥 Testing health endpoint...")
        response = requests.get("http://localhost:5001/health", timeout=10)

        if response.status_code == 200:
            print("✅ Health check successful")
            health_data = response.json()
            print(f"   Status: {health_data.get('status')}")
            print(f"   Service: {health_data.get('service')}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False

        # Test auth status endpoint
        print("🔧 Testing auth status endpoint...")
        response = requests.get("http://localhost:5001/api/auth/status", timeout=10)

        if response.status_code == 200:
            print("✅ Auth status check successful")
            status_data = response.json()
            print(f"   Sheets connected: {status_data.get('status', {}).get('sheets_connected')}")
        else:
            print(f"❌ Auth status check failed: {response.status_code}")

        # Test login endpoint
        print("🔐 Testing login endpoint...")
        login_data = {
            "email": "admin@mia.vn",
            "password": "123456",
            "rememberMe": False
        }

        response = requests.post(
            "http://localhost:5001/api/auth/login",
            json=login_data,
            timeout=15  # Increased timeout for login
        )

        if response.status_code == 200:
            print("✅ Login API successful")
            login_result = response.json()
            print(f"   User: {login_result.get('user', {}).get('name')}")
        else:
            print(f"❌ Login API failed: {response.status_code}")
            if response.text:
                print(f"   Error: {response.text}")

        # Stop server
        server_process.terminate()
        server_process.wait()
        print("🛑 API server stopped")

        return True

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API server")
        return False
    except Exception as e:
        print(f"❌ API server test error: {e}")
        return False
    finally:
        # Ensure server is stopped
        try:
            server_process.terminate()
        except:
            pass

def test_prerequisites():
    """Test system prerequisites"""
    print("📋 TESTING PREREQUISITES")
    print("=" * 50)

    all_good = True

    # Check Python version
    python_version = sys.version
    print(f"🐍 Python version: {python_version.split()[0]}")

    # Check required packages
    required_packages = [
        'flask', 'flask_cors', 'gspread', 'google.auth',
        'pandas', 'requests'
    ]

    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package} installed")
        except ImportError:
            print(f"❌ {package} not installed")
            all_good = False

    # Check credentials file
    credentials_path = "config/service_account.json"
    if os.path.exists(credentials_path):
        print(f"✅ Credentials file found: {credentials_path}")
    else:
        print(f"❌ Credentials file not found: {credentials_path}")
        all_good = False

    return all_good

def main():
    """Run all tests"""
    print("🧪 MIA.VN AUTHENTICATION SYSTEM TEST")
    print("=" * 60)

    # Test prerequisites
    prereq_ok = test_prerequisites()
    if not prereq_ok:
        print("\n❌ Prerequisites check failed. Please install missing packages.")
        sys.exit(1)

    # Test Google Sheets
    sheets_ok = test_google_sheets_connection()

    # Test authentication service
    auth_ok = test_authentication_service()

    # Test API server
    api_ok = test_api_server()

    # Summary
    print("\n📊 TEST SUMMARY")
    print("=" * 60)
    print(f"Prerequisites: {'✅ PASS' if prereq_ok else '❌ FAIL'}")
    print(f"Google Sheets: {'✅ PASS' if sheets_ok else '❌ FAIL'}")
    print(f"Auth Service:  {'✅ PASS' if auth_ok else '❌ FAIL'}")
    print(f"API Server:    {'✅ PASS' if api_ok else '❌ FAIL'}")

    if all([prereq_ok, sheets_ok, auth_ok, api_ok]):
        print("\n🎉 ALL TESTS PASSED! Ready to run fullstack application.")
        print("Run: ./start_fullstack.sh")
    else:
        print("\n❌ Some tests failed. Please fix issues before running fullstack.")
        sys.exit(1)

if __name__ == "__main__":
    main()
