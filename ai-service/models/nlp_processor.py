"""
Natural Language Processing Model
NLP capabilities for chat, voice, summaries, and search
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import re
from collections import Counter

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False
    # Simple fallback for numpy functions
    class np:
        @staticmethod
        def mean(arr):
            return sum(arr) / len(arr) if arr else 0
        @staticmethod
        def std(arr):
            if not arr or len(arr) < 2:
                return 0
            mean_val = np.mean(arr)
            variance = sum((x - mean_val) ** 2 for x in arr) / len(arr)
            return variance ** 0.5


class NLPProcessor:
    """
    Natural Language Processing capabilities:
    - Chat interface for data queries
    - Voice commands processing
    - Auto-generated summaries
    - Smart search across all data
    """

    def __init__(self):
        self.intent_patterns = {
            "query_data": [
                r"show (me )?data",
                r"get (me )?data",
                r"list (all )?data",
                r"find (all )?data",
                r"what data",
                r"display data",
            ],
            "filter": [
                r"filter (by|where)",
                r"show (only|just)",
                r"where.*(is|equals|>)",
                r"find.*(with|where)",
            ],
            "aggregate": [
                r"sum (of|up)",
                r"total",
                r"average",
                r"mean",
                r"count",
                r"how many",
            ],
            "compare": [
                r"compare",
                r"difference (between|of)",
                r"vs",
                r"versus",
                r"which (is|has)",
            ],
            "trend": [
                r"trend",
                r"change (over|in)",
                r"increase",
                r"decrease",
                r"growth",
            ],
            "search": [
                r"search (for|about)",
                r"find",
                r"look (for|up)",
                r"where (is|are)",
            ],
        }

        self.entity_patterns = {
            "date": [
                r"\d{4}-\d{2}-\d{2}",
                r"\d{2}/\d{2}/\d{4}",
                r"(today|yesterday|tomorrow)",
                r"(last|this|next) (week|month|year)",
            ],
            "number": [
                r"\d+",
                r"\d+\.\d+",
                r"(one|two|three|four|five|six|seven|eight|nine|ten)",
            ],
            "column": [
                r"column ([\w]+)",
                r"field ([\w]+)",
                r"([\w]+) column",
                r"([\w]+) field",
            ],
        }

    def process_chat_query(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process natural language query"""
        query_lower = query.lower().strip()

        # Extract intent
        intent = self._detect_intent(query_lower)

        # Extract entities
        entities = self._extract_entities(query_lower)

        # Parse query structure
        parsed = {
            "intent": intent,
            "entities": entities,
            "original_query": query,
            "confidence": self._calculate_confidence(query_lower, intent),
            "timestamp": datetime.now().isoformat(),
        }

        # Generate SQL-like or query structure
        parsed["query_structure"] = self._generate_query_structure(parsed, context)

        return parsed

    def _detect_intent(self, query: str) -> str:
        """Detect user intent from query"""
        scores = {}

        for intent, patterns in self.intent_patterns.items():
            score = 0
            for pattern in patterns:
                if re.search(pattern, query, re.IGNORECASE):
                    score += 1
            scores[intent] = score

        # Return intent with highest score
        if scores:
            return max(scores, key=scores.get)
        return "unknown"

    def _extract_entities(self, query: str) -> Dict[str, Any]:
        """Extract entities from query"""
        entities = {
            "dates": [],
            "numbers": [],
            "columns": [],
            "keywords": [],
        }

        # Extract dates
        for pattern in self.entity_patterns["date"]:
            matches = re.findall(pattern, query, re.IGNORECASE)
            entities["dates"].extend(matches)

        # Extract numbers
        for pattern in self.entity_patterns["number"]:
            matches = re.findall(pattern, query, re.IGNORECASE)
            entities["numbers"].extend(matches)

        # Extract column names
        for pattern in self.entity_patterns["column"]:
            matches = re.findall(pattern, query, re.IGNORECASE)
            entities["columns"].extend(matches)

        # Extract keywords (non-stop words)
        stop_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"}
        words = re.findall(r"\b\w+\b", query.lower())
        entities["keywords"] = [w for w in words if w not in stop_words and len(w) > 2]

        return entities

    def _calculate_confidence(self, query: str, intent: str) -> float:
        """Calculate confidence score for intent detection"""
        if intent == "unknown":
            return 0.0

        patterns = self.intent_patterns.get(intent, [])
        matches = sum(1 for pattern in patterns if re.search(pattern, query, re.IGNORECASE))

        if not patterns:
            return 0.0

        return min(matches / len(patterns), 1.0)

    def _generate_query_structure(self, parsed: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate query structure from parsed intent"""
        intent = parsed["intent"]
        entities = parsed["entities"]

        structure = {
            "type": intent,
            "filters": [],
            "aggregations": [],
            "group_by": [],
            "order_by": [],
            "limit": None,
        }

        if intent == "query_data":
            structure["action"] = "select"
            structure["columns"] = ["*"]

        elif intent == "filter":
            structure["action"] = "filter"
            # Extract filter conditions from entities
            for keyword in entities.get("keywords", []):
                structure["filters"].append({
                    "field": keyword,
                    "operator": "contains",
                    "value": keyword,
                })

        elif intent == "aggregate":
            structure["action"] = "aggregate"
            structure["aggregations"] = [{
                "function": "sum",
                "column": entities.get("columns", [None])[0] or "value",
            }]

        elif intent == "compare":
            structure["action"] = "compare"
            structure["columns"] = entities.get("columns", [])

        elif intent == "trend":
            structure["action"] = "trend_analysis"
            structure["time_column"] = entities.get("columns", [None])[0] or "date"
            structure["value_column"] = entities.get("columns", [None])[1] or "value"

        elif intent == "search":
            structure["action"] = "search"
            structure["search_terms"] = entities.get("keywords", [])

        return structure

    def generate_summary(self, data: List[Dict[str, Any]], max_length: int = 200) -> str:
        """Generate auto summary from data"""
        if not data:
            return "No data available for summary."

        summary_parts = []

        # Basic statistics
        total_items = len(data)
        summary_parts.append(f"Analysis of {total_items} data points")

        # Numeric statistics
        numeric_fields = {}
        for row in data:
            for key, value in row.items():
                if isinstance(value, (int, float)):
                    if key not in numeric_fields:
                        numeric_fields[key] = []
                    numeric_fields[key].append(value)

        if numeric_fields:
            for field, values in numeric_fields.items():
                if values:
                    avg = sum(values) / len(values)
                    summary_parts.append(
                        f"{field}: avg {avg:.2f}, min {min(values)}, max {max(values)}"
                    )

        # Date range
        date_fields = [k for k in data[0].keys() if "date" in k.lower() or "time" in k.lower()]
        if date_fields:
            for field in date_fields[:1]:  # First date field
                dates = [row.get(field) for row in data if field in row and row.get(field)]
                if dates:
                    summary_parts.append(f"Date range: {min(dates)} to {max(dates)}")

        summary = ". ".join(summary_parts)

        # Truncate if too long
        if len(summary) > max_length:
            summary = summary[:max_length] + "..."

        return summary

    def smart_search(self, query: str, data: List[Dict[str, Any]],
                    columns: List[str] = None) -> List[Dict[str, Any]]:
        """Smart search across all data"""
        if not data:
            return []

        query_lower = query.lower()
        query_words = re.findall(r"\b\w+\b", query_lower)

        # Search across all columns if not specified
        search_columns = columns or list(data[0].keys()) if data else []

        results = []
        scores = {}

        for i, row in enumerate(data):
            score = 0

            # Search in each column
            for col in search_columns:
                if col not in row:
                    continue

                value = str(row[col]).lower()

                # Exact match
                if query_lower in value:
                    score += 10

                # Word matches
                for word in query_words:
                    if word in value and len(word) > 2:
                        score += 1

                # Partial match
                if any(word in value for word in query_words if len(word) > 2):
                    score += 0.5

            if score > 0:
                scores[i] = score

        # Sort by score and return top results
        sorted_indices = sorted(scores, key=scores.get, reverse=True)
        results = [data[i] for i in sorted_indices[:50]]  # Top 50 results

        return results

    def process_voice_command(self, command: str) -> Dict[str, Any]:
        """Process voice command (same as chat query for now)"""
        return self.process_chat_query(command)

    def generate_response(self, query_result: Dict[str, Any], data: List[Dict[str, Any]] = None) -> str:
        """Generate natural language response"""
        intent = query_result.get("intent", "unknown")
        confidence = query_result.get("confidence", 0)

        if confidence < 0.3:
            return "I'm not sure I understood. Could you rephrase your question?"

        responses = {
            "query_data": f"I found {len(data) if data else 0} data points matching your query.",
            "filter": f"Filtered results: {len(data) if data else 0} items found.",
            "aggregate": f"The total is {data[0].get('total', 'N/A') if data else 'N/A'}.",
            "compare": "Here's the comparison you requested.",
            "trend": "Analyzing trends...",
            "search": f"Found {len(data) if data else 0} results for your search.",
        }

        base_response = responses.get(intent, "I'll help you with that.")

        if data and len(data) > 0:
            summary = self.generate_summary(data[:5], max_length=100)
            return f"{base_response} {summary}"

        return base_response


# Singleton instance
nlp_processor = NLPProcessor()
