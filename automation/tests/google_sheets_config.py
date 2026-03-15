#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Compatibility shim for tests.

This module forwards `GoogleSheetsConfigService` to the canonical
implementation in automation/google_sheets_config.py so test runners don't
accidentally use a stale copy under tests/.
"""

from __future__ import annotations

import importlib.util
from pathlib import Path

_CANONICAL_FILE = Path(__file__).resolve().parents[1] / "google_sheets_config.py"

_spec = importlib.util.spec_from_file_location("automation_google_sheets_config", _CANONICAL_FILE)
if _spec is None or _spec.loader is None:
    raise ImportError(f"Cannot load canonical module: {_CANONICAL_FILE}")

_module = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_module)

GoogleSheetsConfigService = _module.GoogleSheetsConfigService

__all__ = ["GoogleSheetsConfigService"]
