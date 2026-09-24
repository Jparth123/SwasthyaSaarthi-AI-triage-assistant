"""
SwasthyaSaarthi — Alerts Routes
GET  /api/v1/alerts
POST /api/v1/alerts/{id}/acknowledge
POST /api/v1/alerts/{id}/sync
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Alert, Case, Patient
from database import get_db

router = APIRouter()


def _serialize_alert(alert: Alert, db: Session) -> dict:
    case = alert.case
    patient = case.patient if case else None
    return {
        "id": alert.id,
        "case_id": alert.case_id,
        "patient_id": patient.patient_id if patient else "—",
        "village": patient.village if patient else "—",
        "urgency": alert.urgency,
        "reason": alert.reason,
        "phc": alert.phc,
        "status": alert.status,
        "created_at": alert.created_at.isoformat() if alert.created_at else None,
    }


@router.get("")
def list_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).all()
    return [_serialize_alert(a, db) for a in alerts]


@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "acknowledged"
    db.commit()
    return _serialize_alert(alert, db)


@router.post("/{alert_id}/sync")
def sync_alert(alert_id: int, db: Session = Depends(get_db)):
    """Simulate syncing a queued alert when connectivity is restored."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    if alert.status == "queued":
        alert.status = "synced"
        db.commit()
    return _serialize_alert(alert, db)


@router.post("/{alert_id}/queue")
def queue_alert(alert_id: int, db: Session = Depends(get_db)):
    """Mark alert as queued (offline mode simulation)."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "queued"
    db.commit()
    return _serialize_alert(alert, db)
