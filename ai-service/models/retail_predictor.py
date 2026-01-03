"""
🛒 MIA Retail - Retail-Specific Predictor

AI model dự đoán cho retail business:
- Sales forecasting
- Inventory optimization
- Customer behavior prediction
- Demand forecasting
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Optional
import pickle
import os


class RetailPredictor:
    """
    Retail-specific predictor for MIA Retail.

    Predicts:
    - Daily/Weekly/Monthly sales
    - Product demand
    - Customer purchase patterns
    - Inventory needs
    """

    def __init__(self, model_path: Optional[str] = None):
        self.sales_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.demand_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        self.historical_average = None
        self.model_path = model_path or 'models/retail_model.pkl'

        # Retail-specific parameters
        self.seasonal_factors = {}  # Seasonal adjustment factors
        self.product_categories = []  # Product categories

        # Load pre-trained model if exists
        if os.path.exists(self.model_path):
            try:
                self.load_model()
            except Exception as e:
                print(f"⚠️ Could not load model: {e}")

    def train_on_retail_data(self, historical_data: pd.DataFrame) -> Dict:
        """
        Train model với retail historical data.

        Args:
            historical_data: DataFrame với columns:
                - date, day_of_week, month, is_holiday
                - sales_amount, order_count
                - product_id, category, price
                - customer_count, weather_score

        Returns:
            Training metrics
        """
        try:
            # Retail-specific features
            features = [
                'day_of_week',
                'month',
                'is_holiday',
                'is_weekend',
                'weather_score',
                'promotion_active',
                'previous_day_sales',
                'previous_week_sales',
            ]

            target = 'sales_amount'  # Target variable

            # Prepare data
            if target not in historical_data.columns:
                raise ValueError(f"Target column '{target}' not found")

            # Feature engineering for retail
            historical_data = self._add_retail_features(historical_data)

            X = historical_data[features].fillna(0)
            y = historical_data[target]

            # Scale features
            X_scaled = self.scaler.fit_transform(X)

            # Train sales model
            self.sales_model.fit(X_scaled, y)
            self.is_trained = True
            self.historical_average = y.mean()

            # Calculate seasonal factors
            self._calculate_seasonal_factors(historical_data)

            # Training metrics
            train_score = self.sales_model.score(X_scaled, y)

            # Save model
            self.save_model()

            return {
                'success': True,
                'training_score': float(train_score),
                'samples_trained': len(y),
                'historical_average': float(self.historical_average),
                'seasonal_factors': self.seasonal_factors,
                'message': 'Retail model trained successfully'
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Training failed'
            }

    def predict_sales(
        self,
        current_features: Dict[str, float],
        timeframe: str = '1d'
    ) -> Dict:
        """
        Dự đoán sales cho retail.

        Args:
            current_features: Current feature values
            timeframe: '1d', '7d', '30d'

        Returns:
            Sales prediction với retail insights
        """
        if not self.is_trained:
            return self._fallback_prediction(current_features)

        try:
            # Retail feature order
            feature_order = [
                'day_of_week',
                'month',
                'is_holiday',
                'is_weekend',
                'weather_score',
                'promotion_active',
                'previous_day_sales',
                'previous_week_sales',
            ]

            feature_array = np.array([
                current_features.get(f, 0) for f in feature_order
            ]).reshape(1, -1)

            # Scale and predict
            feature_scaled = self.scaler.transform(feature_array)
            prediction = self.sales_model.predict(feature_scaled)[0]

            # Apply seasonal adjustment
            month = int(current_features.get('month', 1))
            if month in self.seasonal_factors:
                prediction *= self.seasonal_factors[month]

            # Calculate confidence
            confidence = self._calculate_retail_confidence(current_features)

            # Generate retail insights
            insight = self._generate_retail_insight(prediction, current_features)

            return {
                'predicted_sales': float(prediction),
                'predicted_orders': float(prediction / current_features.get('avg_order_value', 2777)),
                'confidence': float(confidence),
                'business_insight': insight,
                'timeframe': timeframe,
                'recommendations': self._get_retail_recommendations(prediction),
                'timestamp': pd.Timestamp.now().isoformat()
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'prediction': self._fallback_prediction(current_features)
            }

    def predict_demand(self, product_id: str, days_ahead: int = 7) -> Dict:
        """
        Dự đoán demand cho sản phẩm cụ thể.
        """
        # TODO: Implement product-specific demand prediction
        return {
            'product_id': product_id,
            'predicted_demand': 100,
            'confidence': 0.75,
            'days_ahead': days_ahead
        }

    def _add_retail_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add retail-specific features."""
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'])
            df['day_of_week'] = df['date'].dt.dayofweek
            df['month'] = df['date'].dt.month
            df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)

        # Previous period features
        if 'sales_amount' in df.columns:
            df['previous_day_sales'] = df['sales_amount'].shift(1).fillna(0)
            df['previous_week_sales'] = df['sales_amount'].shift(7).fillna(0)

        return df

    def _calculate_seasonal_factors(self, df: pd.DataFrame):
        """Calculate seasonal adjustment factors."""
        if 'month' in df.columns and 'sales_amount' in df.columns:
            monthly_avg = df.groupby('month')['sales_amount'].mean()
            overall_avg = df['sales_amount'].mean()
            self.seasonal_factors = (monthly_avg / overall_avg).to_dict()

    def _generate_retail_insight(
        self,
        prediction: float,
        features: Dict[str, float]
    ) -> str:
        """Generate retail-specific business insights."""
        if self.historical_average is None:
            return "📊 Sales prediction generated"

        threshold_high = self.historical_average * 1.2
        threshold_low = self.historical_average * 0.8

        is_weekend = features.get('is_weekend', 0)
        is_holiday = features.get('is_holiday', 0)
        promotion = features.get('promotion_active', 0)

        if prediction > threshold_high:
            if promotion:
                return "📈 High sales expected - promotion is working well!"
            elif is_weekend or is_holiday:
                return "📈 Weekend/Holiday boost expected - ensure adequate inventory"
            else:
                return "📈 Above average sales expected - consider increasing staff"
        elif prediction < threshold_low:
            return "📉 Below average expected - consider promotions or marketing"
        else:
            return "📊 Normal sales range expected"

    def _get_retail_recommendations(self, predicted_sales: float) -> List[str]:
        """Get retail-specific recommendations."""
        recommendations = []

        if predicted_sales > self.historical_average * 1.2:
            recommendations.append("Consider increasing inventory for high-demand items")
            recommendations.append("Schedule additional staff for peak hours")

        if predicted_sales < self.historical_average * 0.8:
            recommendations.append("Consider running promotions to boost sales")
            recommendations.append("Review slow-moving inventory")

        return recommendations

    def _calculate_retail_confidence(
        self,
        current_features: Dict[str, float]
    ) -> float:
        """Calculate prediction confidence for retail."""
        required_features = ['day_of_week', 'month']
        complete_features = sum(
            1 for f in required_features if f in current_features
        )

        base_confidence = complete_features / len(required_features)

        # Boost confidence if we have retail-specific features
        if 'promotion_active' in current_features:
            base_confidence += 0.1
        if 'previous_day_sales' in current_features:
            base_confidence += 0.1

        if self.is_trained:
            return min(0.95, base_confidence + 0.2)
        else:
            return max(0.3, base_confidence * 0.5)

    def _fallback_prediction(
        self,
        current_features: Dict[str, float]
    ) -> Dict:
        """Fallback prediction when model not trained."""
        prediction = self.historical_average or 100000  # Default VND

        return {
            'predicted_sales': float(prediction),
            'predicted_orders': float(prediction / 2777),
            'confidence': 0.3,
            'business_insight': '⚠️ Using fallback prediction - train model for better accuracy',
            'warning': 'Train model with historical retail data'
        }

    def save_model(self):
        """Save trained model."""
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        with open(self.model_path, 'wb') as f:
            pickle.dump({
                'sales_model': self.sales_model,
                'scaler': self.scaler,
                'historical_average': self.historical_average,
                'seasonal_factors': self.seasonal_factors,
                'is_trained': self.is_trained
            }, f)

    def load_model(self):
        """Load trained model."""
        with open(self.model_path, 'rb') as f:
            data = pickle.load(f)
            self.sales_model = data['sales_model']
            self.scaler = data['scaler']
            self.historical_average = data.get('historical_average')
            self.seasonal_factors = data.get('seasonal_factors', {})
            self.is_trained = data.get('is_trained', False)


# Example usage
if __name__ == '__main__':
    predictor = RetailPredictor()

    # Example training data
    dates = pd.date_range('2024-01-01', periods=365, freq='D')
    sample_data = pd.DataFrame({
        'date': dates,
        'sales_amount': np.random.rand(365) * 200000 + 100000,
        'order_count': np.random.randint(20, 100, 365),
        'is_holiday': (dates.day == 1).astype(int),  # First of month
        'promotion_active': np.random.randint(0, 2, 365),
        'weather_score': np.random.rand(365) * 100,
    })

    # Train
    result = predictor.train_on_retail_data(sample_data)
    print("Training result:", result)

    # Predict
    prediction = predictor.predict_sales({
        'day_of_week': 3,
        'month': 11,
        'is_holiday': 0,
        'is_weekend': 0,
        'weather_score': 75,
        'promotion_active': 1,
        'previous_day_sales': 120000,
        'previous_week_sales': 800000,
        'avg_order_value': 2777,
    })
    print("Prediction:", prediction)
