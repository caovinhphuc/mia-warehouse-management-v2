"""
Pattern Recognition Model
Data pattern recognition trong Google Sheets
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Any
from datetime import datetime, timedelta
import statistics


class PatternRecognizer:
    """
    Recognize patterns in data:
    - Trends (increasing, decreasing, stable)
    - Anomalies (outliers, spikes, drops)
    - Cycles (daily, weekly, monthly)
    - Correlations between columns
    """

    def __init__(self):
        self.patterns = []

    def recognize_trends(self, data: List[Dict[str, Any]], value_column: str) -> Dict[str, Any]:
        """Recognize trend patterns in data"""
        if not data or len(data) < 2:
            return {"trend": "insufficient_data", "confidence": 0}

        values = [row.get(value_column, 0) for row in data if value_column in row]
        if len(values) < 2:
            return {"trend": "insufficient_data", "confidence": 0}

        # Calculate trend using linear regression
        x = np.arange(len(values))
        y = np.array(values)

        # Simple linear regression
        slope = np.polyfit(x, y, 1)[0]
        mean_value = np.mean(y)
        std_value = np.std(y) if len(y) > 1 else 0

        # Determine trend
        if std_value == 0:
            trend = "stable"
            confidence = 1.0
        elif abs(slope) < 0.01 * abs(mean_value):
            trend = "stable"
            confidence = 0.8
        elif slope > 0:
            trend = "increasing"
            confidence = min(abs(slope) / (0.1 * abs(mean_value) + 1), 1.0)
        else:
            trend = "decreasing"
            confidence = min(abs(slope) / (0.1 * abs(mean_value) + 1), 1.0)

        return {
            "trend": trend,
            "slope": float(slope),
            "confidence": float(confidence),
            "mean": float(mean_value),
            "std": float(std_value),
            "change_percentage": float((values[-1] - values[0]) / (values[0] + 1) * 100) if values[0] != 0 else 0
        }

    def detect_anomalies(self, data: List[Dict[str, Any]], value_column: str) -> List[Dict[str, Any]]:
        """Detect anomalies in data"""
        if not data:
            return []

        values = [float(row.get(value_column, 0)) for row in data if value_column in row]
        if len(values) < 3:
            return []

        mean = np.mean(values)
        std = np.std(values) if len(values) > 1 else 0

        if std == 0:
            return []

        anomalies = []
        threshold = 2 * std  # 2 standard deviations

        for i, row in enumerate(data):
            value = float(row.get(value_column, 0))
            z_score = abs((value - mean) / std) if std > 0 else 0

            if z_score > 2:
                anomaly_type = "spike" if value > mean else "drop"
                anomalies.append({
                    "index": i,
                    "value": value,
                    "expected_range": [mean - threshold, mean + threshold],
                    "z_score": float(z_score),
                    "type": anomaly_type,
                    "severity": "high" if z_score > 3 else "medium",
                    "timestamp": row.get("timestamp") or row.get("date") or datetime.now().isoformat()
                })

        return anomalies

    def detect_cycles(self, data: List[Dict[str, Any]], value_column: str, date_column: str = None) -> Dict[str, Any]:
        """Detect cyclical patterns (daily, weekly, monthly)"""
        if not data or len(data) < 7:
            return {"cycle": "insufficient_data", "period": None}

        values = [float(row.get(value_column, 0)) for row in data]

        # Simple cycle detection using autocorrelation
        # Check for weekly patterns (7 days)
        if len(values) >= 14:
            # Calculate correlation with 7-day lag
            values_array = np.array(values)
            lag_7 = values_array[7:]
            original = values_array[:-7]

            if len(original) > 0 and np.std(original) > 0 and np.std(lag_7) > 0:
                correlation_7 = np.corrcoef(original, lag_7)[0, 1]

                if correlation_7 > 0.5:
                    return {
                        "cycle": "weekly",
                        "period": 7,
                        "confidence": float(correlation_7),
                        "pattern": "repeating_weekly"
                    }

        # Check for monthly patterns (30 days)
        if len(values) >= 60:
            lag_30 = values_array[30:]
            original = values_array[:-30]

            if len(original) > 0 and np.std(original) > 0 and np.std(lag_30) > 0:
                correlation_30 = np.corrcoef(original, lag_30)[0, 1]

                if correlation_30 > 0.5:
                    return {
                        "cycle": "monthly",
                        "period": 30,
                        "confidence": float(correlation_30),
                        "pattern": "repeating_monthly"
                    }

        return {"cycle": "no_clear_cycle", "period": None, "confidence": 0}

    def find_correlations(self, data: List[Dict[str, Any]], columns: List[str]) -> Dict[str, Any]:
        """Find correlations between columns"""
        if not data or len(columns) < 2:
            return {"correlations": []}

        # Extract values for each column
        column_data = {}
        for col in columns:
            column_data[col] = [float(row.get(col, 0)) for row in data if col in row]

        correlations = []
        for i, col1 in enumerate(columns):
            for col2 in columns[i+1:]:
                if col1 in column_data and col2 in column_data:
                    values1 = column_data[col1]
                    values2 = column_data[col2]

                    if len(values1) == len(values2) and len(values1) > 1:
                        if np.std(values1) > 0 and np.std(values2) > 0:
                            corr = np.corrcoef(values1, values2)[0, 1]
                            if not np.isnan(corr):
                                correlations.append({
                                    "column1": col1,
                                    "column2": col2,
                                    "correlation": float(corr),
                                    "strength": "strong" if abs(corr) > 0.7 else "moderate" if abs(corr) > 0.4 else "weak"
                                })

        return {
            "correlations": correlations,
            "total_pairs": len(correlations)
        }

    def analyze_patterns(self, data: List[Dict[str, Any]], value_column: str, date_column: str = None) -> Dict[str, Any]:
        """Comprehensive pattern analysis"""
        results = {
            "timestamp": datetime.now().isoformat(),
            "data_points": len(data),
            "trends": {},
            "anomalies": [],
            "cycles": {},
            "summary": {}
        }

        if not data:
            return results

        # Analyze trends
        results["trends"] = self.recognize_trends(data, value_column)

        # Detect anomalies
        results["anomalies"] = self.detect_anomalies(data, value_column)

        # Detect cycles
        results["cycles"] = self.detect_cycles(data, value_column, date_column)

        # Summary
        results["summary"] = {
            "has_trend": results["trends"].get("trend") != "insufficient_data",
            "trend_direction": results["trends"].get("trend", "unknown"),
            "anomaly_count": len(results["anomalies"]),
            "has_cycle": results["cycles"].get("cycle") not in ["insufficient_data", "no_clear_cycle"],
            "cycle_type": results["cycles"].get("cycle", "none")
        }

        return results


# Singleton instance
pattern_recognizer = PatternRecognizer()
