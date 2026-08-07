"""
Logging middleware for request/response tracking.
"""
import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("stockflow")


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()
        response = await call_next(request)
        process_time = (time.perf_counter() - start_time) * 1000

        logger.info(
            f"{request.method} {request.url.path} "
            f"status={response.status_code} "
            f"duration={process_time:.1f}ms"
        )
        response.headers["X-Process-Time"] = f"{process_time:.1f}ms"
        return response
