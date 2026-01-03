#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import requests
import traceback


def send_email(subject: str, html_body: str, to_emails: list[str]) -> bool:
    # Load .env once per import
    try:
        load_dotenv()
    except Exception:
        pass
    sender = os.getenv('EMAIL_ADDRESS') or os.getenv('EMAIL_USERNAME')
    app_password = os.getenv('EMAIL_PASSWORD') or os.getenv('EMAIL_APP_PASSWORD')
    smtp_server = os.getenv('EMAIL_SMTP', 'smtp.gmail.com')
    smtp_port = int(os.getenv('EMAIL_SMTP_PORT', '587'))

    if not sender or not app_password:
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = sender
        msg['To'] = ', '.join(to_emails)
        msg['Subject'] = subject
        msg.attach(MIMEText(html_body, 'html', 'utf-8'))

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender, app_password)
        server.sendmail(sender, to_emails, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        if os.getenv('DEBUG_NOTIFIER') == '1':
            print(f"[notifier] Email send failed: {e}")
            traceback.print_exc()
        return False


def send_telegram(message: str, bot_token: Optional[str] = None, chat_id: Optional[str] = None) -> bool:
    token = bot_token or os.getenv('TELEGRAM_BOT_TOKEN')
    chat = chat_id or os.getenv('TELEGRAM_CHAT_ID')
    if not token or not chat:
        return False
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        resp = requests.post(url, json={
            'chat_id': chat,
            'text': message,
            'parse_mode': 'HTML',
            'disable_web_page_preview': True
        }, timeout=10)
        return resp.status_code == 200
    except Exception as e:
        if os.getenv('DEBUG_NOTIFIER') == '1':
            print(f"[notifier] Telegram send failed: {e}")
            traceback.print_exc()
        return False

