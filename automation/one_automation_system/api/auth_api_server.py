#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Authentication API Server for MIA.vn Clone
Flask API server để xử lý xác thực từ React frontend
"""

import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from auth_service import AuthenticationService

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize authentication service
auth_service = AuthenticationService()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'MIA.vn Authentication API'
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login endpoint"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'error': 'Dữ liệu không hợp lệ'
            }), 400

        email = data.get('email', '').strip()
        password = data.get('password', '')
        remember_me = data.get('rememberMe', False)

        # Validate input
        if not email or not password:
            return jsonify({
                'success': False,
                'error': 'Email và mật khẩu là bắt buộc'
            }), 400

        # Get client info
        ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', ''))
        user_agent = request.environ.get('HTTP_USER_AGENT', '')

        # Authenticate user
        success, result = auth_service.authenticate_user(
            email, password, ip_address, user_agent
        )

        if success:
            response_data = {
                'success': True,
                'user': result['user'],
                'session': result['session'],
                'message': 'Đăng nhập thành công'
            }

            # Set session cookie if remember me
            response = jsonify(response_data)
            if remember_me:
                response.set_cookie(
                    'session_id',
                    result['session']['session_id'],
                    max_age=24*60*60,  # 24 hours
                    httponly=True,
                    secure=False,  # Set to True in production with HTTPS
                    samesite='Lax'
                )

            return response

        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Đăng nhập thất bại')
            }), 401

    except Exception as e:
        logging.error(f"Login error: {e}")
        return jsonify({
            'success': False,
            'error': 'Có lỗi xảy ra trong quá trình đăng nhập'
        }), 500

@app.route('/api/auth/verify', methods=['POST'])
def verify_session():
    """Verify session endpoint"""
    try:
        data = request.get_json()
        session_id = data.get('sessionId') if data else None

        # Try to get session from cookie if not provided
        if not session_id:
            session_id = request.cookies.get('session_id')

        if not session_id:
            return jsonify({
                'success': False,
                'error': 'Session không tồn tại'
            }), 401

        # Verify session
        valid, user_data = auth_service.verify_session(session_id)

        if valid:
            return jsonify({
                'success': True,
                'user': user_data['user'],
                'session': user_data['session']
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Session không hợp lệ hoặc đã hết hạn'
            }), 401

    except Exception as e:
        logging.error(f"Session verification error: {e}")
        return jsonify({
            'success': False,
            'error': 'Có lỗi xảy ra khi xác minh session'
        }), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout endpoint"""
    try:
        data = request.get_json()
        session_id = data.get('sessionId') if data else None

        # Try to get session from cookie if not provided
        if not session_id:
            session_id = request.cookies.get('session_id')

        if session_id:
            auth_service.logout(session_id)

        response = jsonify({
            'success': True,
            'message': 'Đăng xuất thành công'
        })

        # Clear session cookie
        response.set_cookie('session_id', '', expires=0)

        return response

    except Exception as e:
        logging.error(f"Logout error: {e}")
        return jsonify({
            'success': False,
            'error': 'Có lỗi xảy ra khi đăng xuất'
        }), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register new user endpoint"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'error': 'Dữ liệu không hợp lệ'
            }), 400

        email = data.get('email', '').strip()
        password = data.get('password', '')
        full_name = data.get('fullName', '').strip()
        role = data.get('role', 'user')
        department = data.get('department', '').strip()

        # Validate input
        if not all([email, password, full_name]):
            return jsonify({
                'success': False,
                'error': 'Email, mật khẩu và họ tên là bắt buộc'
            }), 400

        # Add user
        success = auth_service.add_user(email, password, full_name, role, department)

        if success:
            return jsonify({
                'success': True,
                'message': 'Đăng ký thành công'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Email đã tồn tại hoặc có lỗi xảy ra'
            }), 400

    except Exception as e:
        logging.error(f"Registration error: {e}")
        return jsonify({
            'success': False,
            'error': 'Có lỗi xảy ra trong quá trình đăng ký'
        }), 500

@app.route('/api/auth/status', methods=['GET'])
def auth_status():
    """Get authentication service status"""
    try:
        # Check if Google Sheets connection is working
        sheets_connected = auth_service.sheets_service.client is not None

        return jsonify({
            'success': True,
            'status': {
                'sheets_connected': sheets_connected,
                'service': 'Authentication API',
                'timestamp': datetime.now().isoformat()
            }
        })

    except Exception as e:
        logging.error(f"Status check error: {e}")
        return jsonify({
            'success': False,
            'error': 'Không thể kiểm tra trạng thái service'
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint không tồn tại'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'success': False,
        'error': 'Lỗi server nội bộ'
    }), 500

def main():
    """Run the Flask application"""
    print("🚀 STARTING MIA.VN AUTHENTICATION API SERVER")
    print("=" * 60)
    print("🌐 API Endpoints:")
    print("   POST /api/auth/login    - Đăng nhập")
    print("   POST /api/auth/verify   - Xác minh session")
    print("   POST /api/auth/logout   - Đăng xuất")
    print("   POST /api/auth/register - Đăng ký")
    print("   GET  /api/auth/status   - Trạng thái service")
    print("   GET  /health           - Health check")
    print()
    print("🔧 Configuration:")
    print(f"   Debug: {app.debug}")
    print("   Host: 0.0.0.0")
    print("   Port: 5001")  # Updated port number
    print()
    print("📋 Google Sheets Integration:")
    if auth_service.sheets_service.client:
        print("   ✅ Connected to Google Sheets")
        print(f"   📊 Spreadsheet ID: {auth_service.sheets_service.spreadsheet_id}")
    else:
        print("   ❌ Google Sheets connection failed")
    print()
    print("🚀 Server starting...")
    print("   Press Ctrl+C to stop")
    print("=" * 60)

    # Run Flask app
    app.run(
        host='0.0.0.0',
        port=5001,  # Changed from 5000 to avoid AirPlay conflict
        debug=False,  # Disable debug mode for stability
        threaded=True
    )

if __name__ == '__main__':
    main()
