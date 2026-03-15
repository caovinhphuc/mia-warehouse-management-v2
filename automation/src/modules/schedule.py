#!/usr/bin/env python3
"""
Task Scheduler Module
"""

import schedule
import time
import threading
import logging
from typing import Dict, List, Callable

class TaskScheduler:
    """Task scheduler for automation"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self._running = False
        self._thread = None
        self.jobs = []

    def initialize(self):
        """Initialize scheduler"""
        self.logger.info("Task scheduler initialized")
        return True

    def add_job(self, func: Callable, schedule_type: str, **kwargs):
        """Add scheduled job"""
        if schedule_type == 'daily':
            schedule.every().day.at(kwargs.get('time', '06:00')).do(func)
        elif schedule_type == 'weekly':
            schedule.every().week.do(func)
        elif schedule_type == 'hourly':
            schedule.every().hour.do(func)

        self.logger.info(f"Added {schedule_type} job")

    def start(self):
        """Start scheduler"""
        if self._running:
            return

        self._running = True
        self._thread = threading.Thread(target=self._run_scheduler)
        self._thread.daemon = True
        self._thread.start()

        self.logger.info("Task scheduler started")

    def stop(self):
        """Stop scheduler"""
        self._running = False
        if self._thread:
            self._thread.join()

        self.logger.info("Task scheduler stopped")

    def _run_scheduler(self):
        """Run scheduler loop"""
        while self._running:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

    def is_running(self) -> bool:
        return self._running
