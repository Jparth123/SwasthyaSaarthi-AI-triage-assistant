"""
SwasthyaSaarthi — Dashboard Route
GET /api/v1/dashboard
Returns aggregate statistics.
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models import Case, TriageResult, Alert, Patient
from database import get_db

router = APIRouter()


@router.get("")
def get_dashboard(db: Session = Depends(get_db)):
    total_cases = db.query(Case).count()
    emergency = db.query(TriageResult).filter(TriageResult.urgency == "EMERGENCY").count()
    urgent = db.query(TriageResult).filter(TriageResult.urgency == "URGENT").count()
    routine = db.query(TriageResult).filter(TriageResult.urgency == "ROUTINE").count()
    human_review = db.query(TriageResult).filter(TriageResult.urgency == "HUMAN_REVIEW").count()
    phc_alerts = db.query(Alert).count()
    pending_alerts = db.query(Alert).filter(Alert.status == "pending").count()

    # Recent cases
    recent_cases = db.query(Case).order_by(Case.created_at.desc()).limit(5).all()
    recent = []
    for c in recent_cases:
        patient = c.patient
        triage = c.triage_result
        recent.append({
            "id": c.id,
            "patient_id": patient.patient_id if patient else "—",
            "village": patient.village if patient else "—",
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "urgency": triage.urgency if triage else None,
            "confidence": triage.confidence if triage else None,
            "status": c.status,
        })

    return {
        "total_cases": total_cases,
        "emergency": emergency,
        "urgent": urgent,
        "routine": routine,
        "human_review": human_review,
        "phc_alerts": phc_alerts,
        "pending_alerts": pending_alerts,
        "recent_cases": recent,
    }
