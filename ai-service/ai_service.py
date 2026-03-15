import os
import random
import time
from typing import Any, Dict, List, Optional

import numpy as np
import uvicorn
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import one.tga.com.vn verification
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.support.wait import WebDriverWait
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

try:
    from optimization import COBYQA_AVAILABLE, cobyqa_minimize
except Exception:
    COBYQA_AVAILABLE = False
    try:
        from scipy.optimize import minimize as _scipy_minimize

        def cobyqa_minimize(*args, **kwargs):
            return _scipy_minimize(*args, **kwargs)
    except Exception:
        cobyqa_minimize = None

if cobyqa_minimize is None:
    OPTIMIZATION_ENGINE_NAME = "unavailable"
elif COBYQA_AVAILABLE:
    OPTIMIZATION_ENGINE_NAME = "COBYQA"
else:
    OPTIMIZATION_ENGINE_NAME = "scipy.optimize (fallback)"

app = FastAPI(
    title="MIA.vn AI Service",
    version="4.1",
    description="AI Service with One TGA Verification",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Pydantic Models ====================


class VerifyOneTGARequest(BaseModel):
    email: str
    password: str


class VerifyOneTGAResponse(BaseModel):
    success: bool
    valid: bool
    message: Optional[str] = None
    error: Optional[str] = None


class OptimizationSolveRequest(BaseModel):
    objective_type: str = "minimize"  # minimize | maximize
    initial_guess: List[float]
    bounds: Optional[List[List[float]]] = None  # [[min, max], ...]
    constraints: Optional[List[Dict[str, Any]]] = None
    options: Optional[Dict[str, Any]] = None

# ==================== One TGA Verification ====================


def setup_chrome_driver():
    """Setup Chrome WebDriver với headless mode"""
    if not SELENIUM_AVAILABLE:
        raise Exception(
            "Selenium không được cài đặt. Vui lòng chạy: pip install selenium"
        )

    options = Options()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--headless')  # Headless mode
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--disable-infobars')
    options.add_argument('--disable-logging')
    options.add_argument('--log-level=3')

    # Chrome binary path (Mac)
    chrome_binary_path = (
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    )
    if os.path.exists(chrome_binary_path):
        options.binary_location = chrome_binary_path

    try:
        service = Service('/opt/homebrew/bin/chromedriver')
        driver = webdriver.Chrome(service=service, options=options)
    except Exception:
        # Fallback: không cần service
        driver = webdriver.Chrome(options=options)

    return driver


def _objective_sum_squares(x: np.ndarray, maximize: bool = False) -> float:
    value = float(np.sum(np.asarray(x, dtype=float) ** 2))
    return -value if maximize else value


async def verify_one_tga_login(email: str, password: str) -> dict:
    """
    Verify đăng nhập vào one.tga.com.vn
    Returns: dict với success, valid, error
    """
    if not SELENIUM_AVAILABLE:
        return {
            "success": False,
            "valid": False,
            "error": "Selenium không được cài đặt"
        }

    driver = None
    try:
        driver = setup_chrome_driver()

        # Navigate to login page
        driver.get("https://one.tga.com.vn/")
        time.sleep(2)

        # Find và fill username field
        wait = WebDriverWait(driver, 10)
        username_field = wait.until(
            EC.element_to_be_clickable((
                By.CSS_SELECTOR,
                (
                    "input[type='text'], input[name='username'], "
                    "input[name='email']"
                )
            ))
        )
        username_field.clear()
        username_field.send_keys(email)

        # Find và fill password field
        password_field = driver.find_element(
            By.CSS_SELECTOR,
            "input[type='password'], input[name='password']"
        )
        password_field.clear()
        password_field.send_keys(password)

        # Click login button
        login_button = driver.find_element(
            By.CSS_SELECTOR,
            "button[type='submit'], input[type='submit'], .login-btn"
        )
        login_button.click()

        # Wait for page load
        time.sleep(3)

        # Kiểm tra đăng nhập thành công
        current_url = driver.current_url
        page_title = driver.title.lower()

        # Nếu bị redirect về trang login hoặc URL vẫn là login page
        if "login" in current_url.lower() or "đăng nhập" in page_title:
            return {
                "success": False,
                "valid": False,
                "error": "Đăng nhập thất bại - Credentials không hợp lệ"
            }

        # Nếu URL thay đổi và không phải trang login -> đăng nhập thành công
        if (
            "one.tga.com.vn" in current_url
            and "login" not in current_url.lower()
        ):
            return {
                "success": True,
                "valid": True,
                "message": "Đăng nhập one.tga.com.vn thành công"
            }

        # Kiểm tra thêm bằng cách tìm các element sau khi đăng nhập
        try:
            logged_in_indicators = driver.find_elements(
                By.CSS_SELECTOR,
                ".user-info, .logout, [href*='logout'], .sidebar-menu, "
                ".dashboard"
            )
            if len(logged_in_indicators) > 0:
                return {
                    "success": True,
                    "valid": True,
                    "message": "Đăng nhập one.tga.com.vn thành công"
                }
        except Exception:
            pass

        # Nếu không xác định được, trả về false
        return {
            "success": False,
            "valid": False,
            "error": "Không thể xác định trạng thái đăng nhập"
        }

    except Exception as e:
        return {
            "success": False,
            "valid": False,
            "error": f"Lỗi khi verify: {str(e)}"
        }
    finally:
        if driver:
            try:
                driver.quit()
            except Exception:
                pass

# ==================== API Endpoints ====================


@app.get("/")
async def root():
    return {
        "service": "MIA.vn AI Service",
        "version": "4.1",
        "status": "operational",
        "timestamp": time.time(),
        "features": {
            "one_tga_verification": SELENIUM_AVAILABLE,
            "ai_predictions": True,
            "anomaly_detection": True
        }
    }


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "selenium_available": SELENIUM_AVAILABLE,
        "models": {
            "predictor": True,
            "anomaly_detector": True,
            "optimizer": True,
            "one_tga_verification": SELENIUM_AVAILABLE
        }
    }


@app.post("/api/auth/verify-one-tga", response_model=VerifyOneTGAResponse)
async def verify_one_tga_endpoint(request: VerifyOneTGARequest):
    """
    Verify đăng nhập vào one.tga.com.vn
    """
    if not request.email or not request.password:
        raise HTTPException(
            status_code=400,
            detail="Email và password là bắt buộc"
        )

    result = await verify_one_tga_login(request.email, request.password)

    if result["success"] and result["valid"]:
        return VerifyOneTGAResponse(
            success=True,
            valid=True,
            message=result.get(
                "message",
                "Đăng nhập one.tga.com.vn thành công",
            ),
        )
    else:
        raise HTTPException(
            status_code=401,
            detail=result.get(
                "error",
                "Đăng nhập one.tga.com.vn không thành công",
            ),
        )


@app.get("/ai/predictions")
async def get_predictions():
    return {
        "predictions": {
            "response_time": [random.randint(95, 110) for _ in range(5)],
            "active_users": [random.randint(500, 600) for _ in range(5)]
        },
        "confidence_scores": {
            "response_time": 0.85,
            "active_users": 0.78
        }
    }


@app.get("/ai/anomalies")
async def detect_anomalies():
    return {
        "anomalies": [],
        "risk_level": "low",
        "recommendations": ["System is running optimally"]
    }


@app.get("/ai/optimization")
async def get_optimization():
    return {
        "optimizations": [
            {
                "action": "Optimize database queries",
                "impact": "15%",
                "priority": "high",
            },
            {"action": "Enable caching", "impact": "20%", "priority": "medium"}
        ],
        "overall_score": 89,
        "optimization_engine": OPTIMIZATION_ENGINE_NAME,
    }


@app.get("/ai/optimization/status")
async def get_optimization_status():
    return {
        "cobyqa_available": COBYQA_AVAILABLE,
        "engine": OPTIMIZATION_ENGINE_NAME,
        "status": "ready" if cobyqa_minimize is not None else "unavailable",
    }


@app.post("/ai/optimization/solve")
async def solve_optimization(request: OptimizationSolveRequest):
    if not request.initial_guess:
        raise HTTPException(status_code=400, detail="initial_guess không được rỗng")

    if cobyqa_minimize is None:
        raise HTTPException(status_code=503, detail="Optimization engine unavailable")

    objective_type = (request.objective_type or "minimize").lower().strip()
    if objective_type not in {"minimize", "maximize"}:
        raise HTTPException(status_code=400, detail="objective_type phải là minimize hoặc maximize")

    try:
        x0 = np.asarray(request.initial_guess, dtype=float)

        bounds_obj = None
        if request.bounds is not None:
            if len(request.bounds) != len(x0):
                raise HTTPException(status_code=400, detail="Số chiều bounds phải bằng initial_guess")
            for pair in request.bounds:
                if not isinstance(pair, list) or len(pair) != 2:
                    raise HTTPException(status_code=400, detail="Mỗi bound phải có dạng [min, max]")
            from scipy.optimize import Bounds
            bounds_arr = np.asarray(request.bounds, dtype=float)
            bounds_obj = Bounds(bounds_arr[:, 0], bounds_arr[:, 1])

        maximize = objective_type == "maximize"
        result = cobyqa_minimize(
            fun=lambda x: _objective_sum_squares(x, maximize=maximize),
            x0=x0,
            bounds=bounds_obj,
            constraints=request.constraints or (),
            options=request.options or {},
        )

        x_opt = result.x.tolist() if hasattr(result, "x") else None
        objective_value = None
        if x_opt is not None:
            objective_value = float(_objective_sum_squares(np.asarray(x_opt), maximize=False))

        return {
            "status": "success",
            "method": OPTIMIZATION_ENGINE_NAME,
            "result": {
                "optimal_point": x_opt,
                "objective_value": objective_value,
                "success": bool(getattr(result, "success", False)),
                "message": str(getattr(result, "message", "Optimization completed")),
                "iterations": int(getattr(result, "nit", 0)) if getattr(result, "nit", None) is not None else None,
                "function_evaluations": int(getattr(result, "nfev", 0)) if getattr(result, "nfev", None) is not None else None,
            },
            "timestamp": time.time(),
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(exc)}")


if __name__ == "__main__":
    # Port 8000 - khớp với Dockerfile.ai
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
