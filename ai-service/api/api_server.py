# api_server.py
import json
import os
import subprocess
import threading
from datetime import datetime

import pandas as pd
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _project_path(*parts):
    return os.path.join(PROJECT_ROOT, *parts)

@app.route('/')
def root():
    """Serve default dashboard HTML if available, else a simple status"""
    try:
        if os.path.exists(_project_path('mia_dynamic_dashboard.html')):
            return send_from_directory(PROJECT_ROOT, 'mia_dynamic_dashboard.html')
        if os.path.exists(_project_path('warehouse-dashboard-enterprise.html')):
            return send_from_directory(PROJECT_ROOT, 'warehouse-dashboard-enterprise.html')
        return jsonify({
            'success': True,
            'message': 'API server is running',
            'endpoints': ['/api/orders', '/api/products', '/api/sla', '/api/config', '/api/run']
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/mia_dynamic_dashboard.html')
def serve_mia_dashboard():
    """Serve MIA dynamic dashboard HTML from project root"""
    try:
        if os.path.exists(_project_path('mia_dynamic_dashboard.html')):
            return send_from_directory(PROJECT_ROOT, 'mia_dynamic_dashboard.html')
        return jsonify({'success': False, 'error': 'mia_dynamic_dashboard.html not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/warehouse-dashboard-enterprise.html')
def serve_enterprise_dashboard():
    """Serve enterprise dashboard HTML from project root"""
    try:
        if os.path.exists(_project_path('warehouse-dashboard-enterprise.html')):
            return send_from_directory(PROJECT_ROOT, 'warehouse-dashboard-enterprise.html')
        return jsonify({'success': False, 'error': 'warehouse-dashboard-enterprise.html not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/orders')
def get_orders():
    """API endpoint cho orders data"""
    try:
        # Tìm file CSV mới nhất
        csv_files = []
        data_dir = _project_path('data')
        if os.path.exists(data_dir):
            for file in os.listdir(data_dir):
                if file.startswith('orders_') and file.endswith('.csv'):
                    csv_files.append(_project_path('data', file))

        if csv_files:
            latest_file = max(csv_files, key=os.path.getmtime)
            df = pd.read_csv(latest_file)
            return jsonify({
                'success': True,
                'data': df.to_dict('records'),
                'count': len(df),
                'source': latest_file,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'success': False, 'error': 'No CSV files found'})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/config', methods=['GET', 'POST'])
def config_handler():
    """Read or update config/config.json with a safe whitelist"""
    try:
        config_candidates = [
            _project_path('config', 'config.json'),
            _project_path('config', 'sla_config.json'),
        ]
        config_path = next((p for p in config_candidates if os.path.exists(p)), None)
        if request.method == 'GET':
            if not config_path:
                return jsonify({'success': False, 'error': 'No config file found (config.json or sla_config.json)'}), 404
            with open(config_path, 'r', encoding='utf-8') as f:
                cfg = json.load(f)
            return jsonify({'success': True, 'config': cfg, 'source': config_path})

        # POST: update config (partial)
        payload = request.get_json(force=True, silent=True) or {}
        if not isinstance(payload, dict):
            return jsonify({'success': False, 'error': 'Invalid JSON body'}), 400

        # Load existing
        if not config_path:
            return jsonify({'success': False, 'error': 'No config file found to update'}), 404

        with open(config_path, 'r', encoding='utf-8') as f:
            cfg = json.load(f)

        # Whitelist of editable keys (nested)
        allowed = {
            'system': {
                'implicit_wait': int,
                'page_load_timeout': int
            },
            'data_processing': {
                'max_rows_for_testing': int,
                'enable_fast_mode': bool,
                'product_details_batch_size': int
            }
        }

        def apply_updates(target: dict, updates: dict, schema: dict):
            changed = 0
            for key, val in updates.items():
                if key in schema:
                    if isinstance(schema[key], dict):
                        target.setdefault(key, {})
                        if isinstance(val, dict):
                            changed += apply_updates(target[key], val, schema[key])
                    else:
                        # cast to expected type
                        try:
                            expected = schema[key]
                            if expected is bool:
                                casted = bool(val)
                            else:
                                casted = expected(val)
                            target[key] = casted
                            changed += 1
                        except Exception:
                            pass
            return changed

        changed = apply_updates(cfg, payload, allowed)

        # Save if changed
        if changed > 0:
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(cfg, f, ensure_ascii=False, indent=2)
        return jsonify({'success': True, 'updated_fields': changed, 'config': cfg, 'source': config_path})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


def run_background(command: str):
    def _runner():
        try:
            subprocess.Popen(['bash', '-lc', command], cwd=PROJECT_ROOT)
        except Exception:
            pass
    t = threading.Thread(target=_runner, daemon=True)
    t.start()

@app.route('/api/run', methods=['POST'])
def run_action():
    """Trigger predefined automation actions safely"""
    try:
        data = request.get_json(force=True, silent=True) or {}
        action = (data.get('action') or '').strip()
        if not action:
            return jsonify({'success': False, 'error': 'Missing action'}), 400

        # Map actions to commands (non-interactive)
        commands = {
            'quick_run': 'bash run_main_simple.sh',
            'full_run': 'bash run_ai_service.sh',
            'test_system': (
                'venv/bin/python -m py_compile ai_service.py main.py '
                'models/*.py api/api_server.py'
            ),
            'setup': 'bash setup.sh',
        }

        if action not in commands:
            return jsonify({'success': False, 'error': 'Unsupported action'}), 400

        run_background(commands[action])
        return jsonify({'success': True, 'started': True, 'action': action})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/products')
def get_products():
    """API endpoint cho products data"""
    try:
        # Tương tự cho products
        csv_files = []
        data_dir = _project_path('data')
        if os.path.exists(data_dir):
            for file in os.listdir(data_dir):
                if file.startswith('products_') and file.endswith('.csv'):
                    csv_files.append(_project_path('data', file))

        if csv_files:
            latest_file = max(csv_files, key=os.path.getmtime)
            df = pd.read_csv(latest_file)
            return jsonify({
                'success': True,
                'data': df.to_dict('records'),
                'count': len(df),
                'source': latest_file
            })
        else:
            return jsonify({'success': False, 'error': 'No product files found'})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/sla')
def get_sla():
    """API endpoint cho SLA data"""
    try:
        # Đọc SLA summary file
        sla_files = []
        data_dir = _project_path('data')
        if os.path.exists(data_dir):
            for file in os.listdir(data_dir):
                if file.startswith('sla_summary_') and file.endswith('.txt'):
                    sla_files.append(_project_path('data', file))

        if sla_files:
            latest_file = max(sla_files, key=os.path.getmtime)
            with open(latest_file, 'r', encoding='utf-8') as f:
                content = f.read()

            return jsonify({
                'success': True,
                'content': content,
                'source': latest_file
            })
        else:
            return jsonify({'success': False, 'error': 'No SLA files found'})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, port=8000)
