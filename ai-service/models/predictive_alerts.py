"""
Predictive Alerts Model
Predictive alerts based on trends
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import numpy as np
from .pattern_recognizer import pattern_recognizer


class PredictiveAlerts:
    """
    Generate predictive alerts based on:
    - Trend analysis
    - Anomaly detection
    - Threshold crossing predictions
    - Pattern-based forecasting
    """

    def __init__(self):
        self.alerts = []
        self.thresholds = {}

    def set_threshold(self, metric: str, min_value: float = None, max_value: float = None, alert_type: str = "warning"):
        """Set threshold for a metric"""
        self.thresholds[metric] = {
            "min": min_value,
            "max": max_value,
            "type": alert_type
        }

    def predict_threshold_crossing(self, data: List[Dict[str, Any]], value_column: str,
                                   threshold: float, direction: str = "above") -> Optional[Dict[str, Any]]:
        """Predict when a threshold will be crossed"""
        if not data or len(data) < 3:
            return None

        values = [float(row.get(value_column, 0)) for row in data if value_column in row]
        if len(values) < 3:
            return None

        # Analyze trend
        trend_analysis = pattern_recognizer.recognize_trends(data, value_column)
        slope = trend_analysis.get("slope", 0)
        last_value = values[-1]

        # Predict future values using linear projection
        days_to_cross = None
        predicted_value = last_value

        if direction == "above" and slope > 0 and last_value < threshold:
            # Project when it will cross above threshold
            days_to_cross = (threshold - last_value) / slope if slope > 0 else None
            predicted_value = threshold
        elif direction == "below" and slope < 0 and last_value > threshold:
            # Project when it will cross below threshold
            days_to_cross = (last_value - threshold) / abs(slope) if slope < 0 else None
            predicted_value = threshold

        if days_to_cross and days_to_cross > 0 and days_to_cross < 365:  # Within 1 year
            predicted_date = datetime.now() + timedelta(days=int(days_to_cross))
            return {
                "metric": value_column,
                "threshold": threshold,
                "direction": direction,
                "current_value": last_value,
                "predicted_value": predicted_value,
                "days_until_crossing": int(days_to_cross),
                "predicted_date": predicted_date.isoformat(),
                "confidence": min(trend_analysis.get("confidence", 0.5) * 0.8, 0.9),  # Reduce confidence for predictions
                "trend": trend_analysis.get("trend", "unknown")
            }

        return None

    def generate_trend_alerts(self, data: List[Dict[str, Any]], value_column: str,
                              metric_name: str = None) -> List[Dict[str, Any]]:
        """Generate alerts based on trend analysis"""
        alerts = []

        if not data or len(data) < 2:
            return alerts

        trend_analysis = pattern_recognizer.recognize_trends(data, value_column)
        trend = trend_analysis.get("trend", "unknown")
        change_pct = trend_analysis.get("change_percentage", 0)
        confidence = trend_analysis.get("confidence", 0)

        metric_name = metric_name or value_column

        # Alert on significant changes
        if abs(change_pct) > 20 and confidence > 0.7:
            alert_type = "warning" if change_pct < -20 else "info"
            severity = "high" if abs(change_pct) > 50 else "medium"

            alerts.append({
                "type": "trend",
                "metric": metric_name,
                "severity": severity,
                "alert_type": alert_type,
                "message": f"{metric_name} shows {trend} trend with {change_pct:.1f}% change",
                "trend": trend,
                "change_percentage": change_pct,
                "confidence": confidence,
                "timestamp": datetime.now().isoformat(),
                "recommendation": self._get_trend_recommendation(trend, change_pct)
            })

        return alerts

    def generate_anomaly_alerts(self, data: List[Dict[str, Any]], value_column: str,
                                metric_name: str = None) -> List[Dict[str, Any]]:
        """Generate alerts based on anomaly detection"""
        alerts = []

        if not data:
            return alerts

        anomalies = pattern_recognizer.detect_anomalies(data, value_column)
        metric_name = metric_name or value_column

        for anomaly in anomalies:
            alerts.append({
                "type": "anomaly",
                "metric": metric_name,
                "severity": anomaly.get("severity", "medium"),
                "alert_type": "warning" if anomaly.get("type") == "drop" else "info",
                "message": f"Anomaly detected in {metric_name}: {anomaly.get('type', 'unusual')} value",
                "anomaly_details": anomaly,
                "timestamp": anomaly.get("timestamp", datetime.now().isoformat()),
                "recommendation": "Review data point and investigate cause"
            })

        return alerts

    def generate_pattern_alerts(self, data: List[Dict[str, Any]], value_column: str,
                               metric_name: str = None) -> List[Dict[str, Any]]:
        """Generate alerts based on pattern recognition"""
        alerts = []

        if not data:
            return alerts

        cycle_analysis = pattern_recognizer.detect_cycles(data, value_column)
        metric_name = metric_name or value_column

        # Alert on detected cycles
        if cycle_analysis.get("cycle") not in ["insufficient_data", "no_clear_cycle"]:
            cycle_type = cycle_analysis.get("cycle", "unknown")
            confidence = cycle_analysis.get("confidence", 0)

            if confidence > 0.6:
                alerts.append({
                    "type": "pattern",
                    "metric": metric_name,
                    "severity": "low",
                    "alert_type": "info",
                    "message": f"Detected {cycle_type} pattern in {metric_name}",
                    "pattern": cycle_analysis,
                    "confidence": confidence,
                    "timestamp": datetime.now().isoformat(),
                    "recommendation": f"Consider scheduling based on {cycle_type} pattern"
                })

        return alerts

    def _get_trend_recommendation(self, trend: str, change_pct: float) -> str:
        """Get recommendation based on trend"""
        if trend == "increasing" and change_pct > 50:
            return "Significant growth detected. Consider scaling resources."
        elif trend == "decreasing" and change_pct < -50:
            return "Significant decline detected. Investigate root cause immediately."
        elif trend == "increasing":
            return "Positive trend observed. Monitor for sustainability."
        elif trend == "decreasing":
            return "Declining trend. Consider intervention strategies."
        else:
            return "Stable trend. Continue monitoring."

    def analyze_and_alert(self, data: List[Dict[str, Any]], value_column: str,
                         metric_name: str = None, threshold: float = None) -> List[Dict[str, Any]]:
        """Comprehensive analysis and alert generation"""
        all_alerts = []
        metric_name = metric_name or value_column

        # Generate different types of alerts
        all_alerts.extend(self.generate_trend_alerts(data, value_column, metric_name))
        all_alerts.extend(self.generate_anomaly_alerts(data, value_column, metric_name))
        all_alerts.extend(self.generate_pattern_alerts(data, value_column, metric_name))

        # Threshold-based alerts
        if threshold:
            threshold_alert = self.predict_threshold_crossing(data, value_column, threshold)
            if threshold_alert:
                all_alerts.append({
                    "type": "threshold_prediction",
                    "metric": metric_name,
                    "severity": "medium",
                    "alert_type": "warning",
                    "message": f"{metric_name} predicted to cross threshold in {threshold_alert['days_until_crossing']} days",
                    "prediction": threshold_alert,
                    "timestamp": datetime.now().isoformat(),
                    "recommendation": "Plan preventive actions"
                })

        return sorted(all_alerts, key=lambda x: {
            "high": 3, "medium": 2, "low": 1
        }.get(x.get("severity", "low"), 0), reverse=True)


# Singleton instance
predictive_alerts = PredictiveAlerts()
