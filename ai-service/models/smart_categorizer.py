"""
Smart Categorizer Model
Smart categorization của data
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import re
from collections import Counter

try:
    import pandas as pd
    HAS_PANDAS = True
except ImportError:
    HAS_PANDAS = False


class SmartCategorizer:
    """
    Categorize data intelligently:
    - Auto-categorize by patterns
    - Group similar items
    - Tag classification
    - Priority classification
    """

    def __init__(self):
        self.categories = {}
        self.patterns = {
            "financial": ["price", "cost", "revenue", "profit", "expense", "budget", "$", "đ"],
            "date_time": ["date", "time", "created", "updated", "deadline", "due"],
            "status": ["status", "state", "active", "inactive", "completed", "pending"],
            "priority": ["priority", "urgent", "important", "high", "low", "medium"],
            "contact": ["email", "phone", "address", "contact", "name"],
            "numeric": ["amount", "quantity", "count", "number", "total", "sum"],
            "text": ["description", "notes", "comments", "message", "text"]
        }

    def categorize_column(self, column_name: str, sample_values: List[Any] = None) -> Dict[str, Any]:
        """Categorize a column based on name and sample values"""
        column_lower = column_name.lower()
        category = "other"
        confidence = 0.5
        subcategory = None

        # Check column name patterns
        for cat, keywords in self.patterns.items():
            matches = sum(1 for keyword in keywords if keyword in column_lower)
            if matches > 0:
                category = cat
                confidence = min(0.7 + matches * 0.1, 1.0)
                break

        # Analyze sample values if provided
        if sample_values and len(sample_values) > 0:
            value_analysis = self._analyze_values(sample_values)
            if value_analysis.get("confidence", 0) > confidence:
                category = value_analysis.get("category", category)
                confidence = value_analysis.get("confidence", confidence)
                subcategory = value_analysis.get("subcategory")

        return {
            "column": column_name,
            "category": category,
            "subcategory": subcategory,
            "confidence": confidence,
            "suggested_type": self._get_suggested_type(category, sample_values)
        }

    def _analyze_values(self, values: List[Any]) -> Dict[str, Any]:
        """Analyze sample values to determine category"""
        if not values:
            return {"category": "unknown", "confidence": 0}

        # Check data types
        numeric_count = sum(1 for v in values if isinstance(v, (int, float)))
        date_count = sum(1 for v in values if isinstance(v, (datetime, str)) and self._looks_like_date(str(v)))
        email_count = sum(1 for v in values if isinstance(v, str) and "@" in str(v) and "." in str(v))
        url_count = sum(1 for v in values if isinstance(v, str) and ("http://" in str(v) or "https://" in str(v)))

        total = len(values)

        if email_count > total * 0.5:
            return {"category": "contact", "subcategory": "email", "confidence": 0.9}
        elif url_count > total * 0.5:
            return {"category": "text", "subcategory": "url", "confidence": 0.9}
        elif date_count > total * 0.5:
            return {"category": "date_time", "confidence": 0.9}
        elif numeric_count > total * 0.8:
            # Further check if it's currency
            if any("$" in str(v) or "đ" in str(v) for v in values[:10]):
                return {"category": "financial", "subcategory": "currency", "confidence": 0.85}
            return {"category": "numeric", "confidence": 0.9}

        # Check for status/priority keywords
        value_str = " ".join(str(v).lower() for v in values[:20])
        if any(keyword in value_str for keyword in ["active", "inactive", "completed", "pending", "done"]):
            return {"category": "status", "confidence": 0.8}
        if any(keyword in value_str for keyword in ["urgent", "high", "low", "medium", "important"]):
            return {"category": "priority", "confidence": 0.8}

        return {"category": "text", "confidence": 0.6}

    def _looks_like_date(self, value: str) -> bool:
        """Check if string looks like a date"""
        date_patterns = [
            r'\d{4}-\d{2}-\d{2}',  # YYYY-MM-DD
            r'\d{2}/\d{2}/\d{4}',  # MM/DD/YYYY
            r'\d{2}-\d{2}-\d{4}',  # DD-MM-YYYY
        ]
        return any(re.match(pattern, value) for pattern in date_patterns)

    def _get_suggested_type(self, category: str, sample_values: List[Any] = None) -> str:
        """Get suggested data type"""
        type_mapping = {
            "financial": "number",
            "numeric": "number",
            "date_time": "date",
            "contact": "text",
            "text": "text",
            "status": "text",
            "priority": "text"
        }
        return type_mapping.get(category, "text")

    def categorize_rows(self, data: List[Dict[str, Any]], category_rules: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Categorize rows of data based on rules"""
        if not data:
            return []

        categorized = []

        for row in data:
            row_categories = {
                "tags": [],
                "priority": "normal",
                "category": "uncategorized"
            }

            # Apply custom rules if provided
            if category_rules:
                for rule in category_rules.get("rules", []):
                    if self._matches_rule(row, rule):
                        if "category" in rule:
                            row_categories["category"] = rule["category"]
                        if "tags" in rule:
                            row_categories["tags"].extend(rule["tags"])
                        if "priority" in rule:
                            row_categories["priority"] = rule["priority"]

            # Auto-categorize based on content
            row_categories.update(self._auto_categorize_row(row))

            # Add categories to row
            row_with_categories = {**row, "_categories": row_categories}
            categorized.append(row_with_categories)

        return categorized

    def _matches_rule(self, row: Dict[str, Any], rule: Dict[str, Any]) -> bool:
        """Check if row matches a categorization rule"""
        conditions = rule.get("conditions", {})

        for field, expected in conditions.items():
            if field not in row:
                return False
            if isinstance(expected, dict):
                # Support operators like >, <, contains, etc.
                operator = expected.get("operator", "equals")
                value = expected.get("value")

                if operator == "equals":
                    if row[field] != value:
                        return False
                elif operator == "contains":
                    if value not in str(row[field]):
                        return False
                elif operator == ">":
                    if float(row[field]) <= float(value):
                        return False
                elif operator == "<":
                    if float(row[field]) >= float(value):
                        return False
            else:
                if row[field] != expected:
                    return False

        return True

    def _auto_categorize_row(self, row: Dict[str, Any]) -> Dict[str, Any]:
        """Auto-categorize a row based on content"""
        tags = []
        priority = "normal"

        # Analyze text fields for keywords
        for key, value in row.items():
            if isinstance(value, str):
                value_lower = value.lower()

                # Priority detection
                if any(word in value_lower for word in ["urgent", "critical", "asap"]):
                    priority = "high"
                elif any(word in value_lower for word in ["important", "soon"]):
                    priority = "medium"

                # Tag detection
                if any(word in value_lower for word in ["sale", "discount", "promo"]):
                    tags.append("sales")
                if any(word in value_lower for word in ["error", "issue", "problem"]):
                    tags.append("issues")
                if any(word in value_lower for word in ["new", "created"]):
                    tags.append("new")

        return {
            "tags": list(set(tags)),  # Remove duplicates
            "priority": priority
        }

    def group_similar_items(self, data: List[Dict[str, Any]], group_by: List[str] = None) -> Dict[str, List[Dict[str, Any]]]:
        """Group similar items together"""
        if not data:
            return {}

        if group_by:
            # Group by specified columns
            groups = {}
            for row in data:
                key = tuple(str(row.get(col, "")) for col in group_by)
                if key not in groups:
                    groups[key] = []
                groups[key].append(row)
            return {str(k): v for k, v in groups.items()}
        else:
            # Auto-group by similarity
            # Simple implementation: group by most common values
            return {"all": data}  # Simplified for now


# Singleton instance
smart_categorizer = SmartCategorizer()
