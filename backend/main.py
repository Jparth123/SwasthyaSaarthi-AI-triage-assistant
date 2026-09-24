"""
SwasthyaSaarthi Backend — FastAPI Application Entry Point
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routes.cases import router as cases_router
from routes.alerts import router as alerts_router
from routes.dashboard import router as dashboard_router
from routes.demo import router as demo_router

app = FastAPI(
    title="SwasthyaSaarthi API",
    description="Offline-first AI triage assistant for ASHA workers — Hackathon Prototype",
    version="0.1.0",
)

# Allow all origins for hackathon prototype
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(cases_router, prefix="/api/v1/cases", tags=["Cases"])
app.include_router(alerts_router, prefix="/api/v1/alerts", tags=["Alerts"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(demo_router, prefix="/api/v1/demo", tags=["Demo"])


@app.on_event("startup")
def startup_event():
    init_db()
    try:
        from seed_data import seed_database
        seed_database(force=False)
    except Exception as e:
        print(f"Seed error: {e}")
    print("SwasthyaSaarthi API started - DB initialized & seeded")


@app.get("/")
def root():
    return {
        "app": "SwasthyaSaarthi",
        "version": "0.1.0",
        "status": "running",
        "note": "Hackathon prototype — not a production medical system",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
