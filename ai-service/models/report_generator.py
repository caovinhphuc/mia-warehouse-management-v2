"""
Automated Report Generator
Generate automated reports from data
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json


class ReportGenerator:
    """
    Generate automated reports:
    - Summary reports
    - Trend reports
    - Anomaly reports
    - Custom reports
    """

    def __init__(self):
        self.reports = []

    def generate_summary_report(self, data: List[Dict[str, Any]], title: str = "Data Summary") -> Dict[str, Any]:
        """Generate summary report"""
        if not data:
            return {
                "title": title,
                "type": "summary",
                "timestamp": datetime.now().isoformat(),
                "data_points": 0,
                "sections": []
            }

        report = {
            "title": title,
            "type": "summary",
            "timestamp": datetime.now().isoformat(),
            "data_points": len(data),
            "sections": []
        }

        # Basic statistics
        if data and len(data) > 0:
            # Calculate basic stats for numeric columns
            numeric_columns = {}
            for row in data:
                for key, value in row.items():
                    if isinstance(value, (int, float)):
                        if key not in numeric_columns:
                            numeric_columns[key] = []
                        numeric_columns[key].append(value)

            if numeric_columns:
                stats_section = {
                    "section": "Statistics",
                    "content": {}
                }
                for col, values in numeric_columns.items():
                    if values:
                        stats_section["content"][col] = {
                            "count": len(values),
                            "min": min(values),
                            "max": max(values),
                            "avg": sum(values) / len(values),
                            "sum": sum(values)
                        }
                report["sections"].append(stats_section)

            # Data range
            date_columns = [key for key in data[0].keys() if "date" in key.lower() or "time" in key.lower()]
            if date_columns:
                range_section = {
                    "section": "Date Range",
                    "content": {}
                }
                for col in date_columns:
                    dates = [row.get(col) for row in data if col in row and row.get(col)]
                    if dates:
                        range_section["content"][col] = {
                            "earliest": min(dates),
                            "latest": max(dates),
                            "span_days": (max(dates) - min(dates)).days if hasattr(max(dates), '__sub__') else None
                        }
                report["sections"].append(range_section)

        return report

    def generate_trend_report(self, data: List[Dict[str, Any]], value_column: str,
                             date_column: str = None, title: str = "Trend Analysis") -> Dict[str, Any]:
        """Generate trend analysis report"""
        from .pattern_recognizer import pattern_recognizer

        if not data:
            return {
                "title": title,
                "type": "trend",
                "timestamp": datetime.now().isoformat(),
                "error": "No data provided"
            }

        # Analyze patterns
        pattern_analysis = pattern_recognizer.analyze_patterns(data, value_column, date_column)

        report = {
            "title": title,
            "type": "trend",
            "timestamp": datetime.now().isoformat(),
            "data_points": len(data),
            "trend_analysis": pattern_analysis.get("trends", {}),
            "cycle_analysis": pattern_analysis.get("cycles", {}),
            "anomalies": pattern_analysis.get("anomalies", []),
            "summary": pattern_analysis.get("summary", {}),
            "insights": self._generate_trend_insights(pattern_analysis)
        }

        return report

    def generate_anomaly_report(self, data: List[Dict[str, Any]], value_column: str,
                               title: str = "Anomaly Detection") -> Dict[str, Any]:
        """Generate anomaly detection report"""
        from .pattern_recognizer import pattern_recognizer

        if not data:
            return {
                "title": title,
                "type": "anomaly",
                "timestamp": datetime.now().isoformat(),
                "error": "No data provided"
            }

        anomalies = pattern_recognizer.detect_anomalies(data, value_column)

        report = {
            "title": title,
            "type": "anomaly",
            "timestamp": datetime.now().isoformat(),
            "data_points": len(data),
            "anomaly_count": len(anomalies),
            "anomalies": anomalies,
            "severity_breakdown": self._count_by_severity(anomalies),
            "recommendations": self._generate_anomaly_recommendations(anomalies)
        }

        return report

    def generate_categorized_report(self, data: List[Dict[str, Any]],
                                   category_column: str, title: str = "Categorized Report") -> Dict[str, Any]:
        """Generate report grouped by categories"""
        from .smart_categorizer import smart_categorizer

        if not data:
            return {
                "title": title,
                "type": "categorized",
                "timestamp": datetime.now().isoformat(),
                "error": "No data provided"
            }

        # Group by category
        groups = {}
        for row in data:
            category = str(row.get(category_column, "uncategorized"))
            if category not in groups:
                groups[category] = []
            groups[category].append(row)

        report = {
            "title": title,
            "type": "categorized",
            "timestamp": datetime.now().isoformat(),
            "total_items": len(data),
            "categories": {},
            "category_summary": {}
        }

        for category, items in groups.items():
            report["categories"][category] = {
                "count": len(items),
                "items": items[:10]  # Limit to first 10 items per category
            }
            report["category_summary"][category] = len(items)

        return report

    def generate_comprehensive_report(self, data: List[Dict[str, Any]], value_column: str,
                                     date_column: str = None, title: str = "Comprehensive Report") -> Dict[str, Any]:
        """Generate comprehensive report with all analyses"""
        if not data:
            return {
                "title": title,
                "type": "comprehensive",
                "timestamp": datetime.now().isoformat(),
                "error": "No data provided"
            }

        # Generate all report types
        summary = self.generate_summary_report(data, f"{title} - Summary")
        trend = self.generate_trend_report(data, value_column, date_column, f"{title} - Trends")
        anomaly = self.generate_anomaly_report(data, value_column, f"{title} - Anomalies")

        report = {
            "title": title,
            "type": "comprehensive",
            "timestamp": datetime.now().isoformat(),
            "data_points": len(data),
            "sections": {
                "summary": summary,
                "trend_analysis": trend,
                "anomaly_detection": anomaly
            },
            "executive_summary": self._generate_executive_summary(summary, trend, anomaly)
        }

        return report

    def _generate_trend_insights(self, pattern_analysis: Dict[str, Any]) -> List[str]:
        """Generate insights from trend analysis"""
        insights = []

        trend = pattern_analysis.get("trends", {}).get("trend", "unknown")
        change_pct = pattern_analysis.get("trends", {}).get("change_percentage", 0)
        anomalies = pattern_analysis.get("anomalies", [])
        cycle = pattern_analysis.get("cycles", {}).get("cycle", "none")

        if trend == "increasing" and abs(change_pct) > 20:
            insights.append(f"Strong {trend} trend detected with {change_pct:.1f}% change")
        elif trend == "decreasing" and abs(change_pct) > 20:
            insights.append(f"Significant {trend} trend detected with {change_pct:.1f}% decline")

        if len(anomalies) > 0:
            insights.append(f"Found {len(anomalies)} anomalies requiring attention")

        if cycle not in ["none", "insufficient_data", "no_clear_cycle"]:
            insights.append(f"Detected {cycle} pattern in data")

        if not insights:
            insights.append("Data shows stable patterns with no significant trends or anomalies")

        return insights

    def _generate_anomaly_recommendations(self, anomalies: List[Dict[str, Any]]) -> List[str]:
        """Generate recommendations based on anomalies"""
        recommendations = []

        if not anomalies:
            recommendations.append("No anomalies detected. Data appears normal.")
            return recommendations

        high_severity = [a for a in anomalies if a.get("severity") == "high"]
        if high_severity:
            recommendations.append(f"Immediate attention required for {len(high_severity)} high-severity anomalies")

        spikes = [a for a in anomalies if a.get("type") == "spike"]
        drops = [a for a in anomalies if a.get("type") == "drop"]

        if spikes:
            recommendations.append(f"Investigate {len(spikes)} data spikes - may indicate system issues or exceptional events")

        if drops:
            recommendations.append(f"Review {len(drops)} data drops - may indicate system failures or missing data")

        recommendations.append("Review anomaly timestamps to identify patterns or root causes")

        return recommendations

    def _count_by_severity(self, anomalies: List[Dict[str, Any]]) -> Dict[str, int]:
        """Count anomalies by severity"""
        counts = {"high": 0, "medium": 0, "low": 0}
        for anomaly in anomalies:
            severity = anomaly.get("severity", "medium")
            counts[severity] = counts.get(severity, 0) + 1
        return counts

    def _generate_executive_summary(self, summary: Dict[str, Any], trend: Dict[str, Any],
                                   anomaly: Dict[str, Any]) -> str:
        """Generate executive summary"""
        summary_parts = []

        data_points = summary.get("data_points", 0)
        summary_parts.append(f"Analysis of {data_points} data points")

        trend_info = trend.get("trend_analysis", {})
        if trend_info:
            trend_direction = trend_info.get("trend", "unknown")
            change_pct = trend_info.get("change_percentage", 0)
            if change_pct != 0:
                summary_parts.append(f"{trend_direction} trend with {change_pct:.1f}% change")

        anomaly_count = anomaly.get("anomaly_count", 0)
        if anomaly_count > 0:
            summary_parts.append(f"{anomaly_count} anomalies detected")

        if not summary_parts:
            summary_parts.append("Standard data analysis completed")

        return ". ".join(summary_parts) + "."


# Singleton instance
report_generator = ReportGenerator()
