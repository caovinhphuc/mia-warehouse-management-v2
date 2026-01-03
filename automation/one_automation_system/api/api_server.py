# api_server.py
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import pandas as pd
import json
import os
from datetime import datetime
import subprocess
import threading

app = Flask(__name__)
CORS(app)
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

@app.route('/')
def root():
    """Serve default dashboard HTML if available, else a simple status"""
    try:
        if os.path.exists('mia_dynamic_dashboard.html'):
            return send_from_directory('.', 'mia_dynamic_dashboard.html')
        if os.path.exists('warehouse-dashboard-enterprise.html'):
            return send_from_directory('.', 'warehouse-dashboard-enterprise.html')
        return jsonify({
            'success': True,
            'message': 'API server is running',
            'endpoints': ['/api/orders', '/api/products', '/api/sla']
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/mia_dynamic_dashboard.html')
def serve_mia_dashboard():
    """Serve MIA dynamic dashboard HTML from project root"""
    try:
        if os.path.exists('mia_dynamic_dashboard.html'):
            return send_from_directory('.', 'mia_dynamic_dashboard.html')
        return jsonify({'success': False, 'error': 'mia_dynamic_dashboard.html not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/warehouse-dashboard-enterprise.html')
def serve_enterprise_dashboard():
    """Serve enterprise dashboard HTML from project root"""
    try:
        if os.path.exists('warehouse-dashboard-enterprise.html'):
            return send_from_directory('.', 'warehouse-dashboard-enterprise.html')
        return jsonify({'success': False, 'error': 'warehouse-dashboard-enterprise.html not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/orders')
def get_orders():
    """API endpoint cho orders data"""
    try:
        # Tìm file CSV mới nhất
        csv_files = []
        if os.path.exists('data'):
            for file in os.listdir('data'):
                if file.startswith('orders_') and file.endswith('.csv'):
                    csv_files.append(f'data/{file}')

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
        config_path = os.path.join(PROJECT_ROOT, 'config', 'config.json')
        if request.method == 'GET':
            if not os.path.exists(config_path):
                return jsonify({'success': False, 'error': 'config.json not found'}), 404
            with open(config_path, 'r', encoding='utf-8') as f:
                cfg = json.load(f)
            return jsonify({'success': True, 'config': cfg})

        # POST: update config (partial)
        payload = request.get_json(force=True, silent=True) or {}
        if not isinstance(payload, dict):
            return jsonify({'success': False, 'error': 'Invalid JSON body'}), 400

        # Load existing
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
        return jsonify({'success': True, 'updated_fields': changed, 'config': cfg})
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
            'quick_run': 'source venv/bin/activate && ./quick_run.sh',
            'full_run': 'source venv/bin/activate && python automation.py --run-once',
            'sla_run': 'source venv/bin/activate && python automation_enhanced.py --mode sla --config config/config.json',
            'test_system': 'source venv/bin/activate && python system_check.py',
            'start_dashboard': 'source venv/bin/activate && streamlit run dashboard.py --server.port 8501 --server.address 0.0.0.0'
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
        if os.path.exists('data'):
            for file in os.listdir('data'):
                if file.startswith('products_') and file.endswith('.csv'):
                    csv_files.append(f'data/{file}')

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
        if os.path.exists('data'):
            for file in os.listdir('data'):
                if file.startswith('sla_summary_') and file.endswith('.txt'):
                    sla_files.append(f'data/{file}')

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
    app.run(debug=True, port=5000)
