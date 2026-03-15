"""
Optimization Module for AI Service
Provides optimization capabilities using COBYQA and scipy.optimize
"""

# Try to import COBYQA, fallback to scipy if not available
try:
    from .cobyqa_minimize import minimize as cobyqa_minimize
    COBYQA_AVAILABLE = True
except (ImportError, ModuleNotFoundError):
    COBYQA_AVAILABLE = False
    # Fallback to scipy.optimize
    from scipy.optimize import minimize as scipy_minimize

    def cobyqa_minimize(*args, **kwargs):
        """Fallback to scipy.optimize when COBYQA is not available"""
        return scipy_minimize(*args, **kwargs)

__all__ = ['cobyqa_minimize', 'COBYQA_AVAILABLE']

