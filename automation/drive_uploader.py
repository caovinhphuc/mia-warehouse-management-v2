#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Google Drive uploader using Service Account.
Reads credentials from config/google service account JSON.
"""

from __future__ import annotations

import os
from typing import Optional

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
except Exception:
    service_account = None  # type: ignore
    build = None  # type: ignore
    MediaFileUpload = None  # type: ignore


SCOPES = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
]


def upload_file_to_drive(
    file_path: str,
    folder_id: str,
    service_account_json: Optional[str] = None,
) -> Optional[str]:
    """Upload a local file to Google Drive folder. Returns file id or None.

    Args:
        file_path: Local path to file
        folder_id: Google Drive folder id
        service_account_json: path to service account credentials
    """
    if service_account is None or build is None or MediaFileUpload is None:
        return None

    if not os.path.isfile(file_path) or not folder_id:
        return None

    creds_path = service_account_json or os.path.join("config", "service_account.json")
    if not os.path.isfile(creds_path):
        return None

    try:
        creds = service_account.Credentials.from_service_account_file(
            creds_path, scopes=SCOPES
        )
        drive = build("drive", "v3", credentials=creds, cache_discovery=False)

        metadata = {"name": os.path.basename(file_path), "parents": [folder_id]}
        media = MediaFileUpload(file_path, resumable=True)
        file = (
            drive.files()
            .create(body=metadata, media_body=media, fields="id, webViewLink")
            .execute()
        )
        return file.get("id")
    except Exception:
        return None


