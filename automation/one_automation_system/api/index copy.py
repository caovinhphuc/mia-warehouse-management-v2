#!/usr/bin/env python3
"""
Vercel Serverless entrypoint for Flask API.
Tries to reuse api_server.app if available, otherwise serves a minimal API.
"""

import os

try:
    # Reuse existing Flask app from api_server.py
    from api_server import app  # type: ignore
except Exception:
    # Fallback minimal Flask app
    from flask import Flask, jsonify, send_from_directory
    from flask_cors import CORS

    app = Flask(__name__)  # type: ignore
    CORS(app)

    @app.route("/")
    def root():
        if os.path.exists("warehouse-dashboard-enterprise.html"):
            return send_from_directory(".", "warehouse-dashboard-enterprise.html")
        return jsonify({"success": True, "message": "API online"})

    @app.route("/api/health")
    def health():
        return jsonify({"success": True, "status": "healthy"})

# Exported symbol for Vercel
__all__ = ["app"]


