"""
SwasthyaSaarthi — Cases Routes
POST /api/v1/cases
POST /api/v1/cases/{id}/analyze
GET  /api/v1/cases
GET  /api/v1/cases/{id}
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import Patient, Case, TriageResult, Symptom, Alert
from ai.transcription import transcribe_audio
from ai.symptom_extractor import extract_symptoms
from ai.danger_rules import check_danger_rules
from ai.context_analyzer import check_emotional_language
from ai.triage_engine import run_triage

router = APIRouter()


class CreateCaseRequest(BaseModel):
    patient_id: str
    age: Optional[int] = None
    gender: Optional[str] = None
    village: Optional[str] = None
    phone: Optional[str] = None
    transcription: Optional[str] = None  # if manual text provided


def _serialize_case(case: Case, db: Session) -> dict:
    patient = case.patient
    triage = case.triage_result
    symptoms = case.symptoms

    return {
        "id": case.id,
        "patient_id": patient.patient_id if patient else None,
        "age": patient.age if patient else None,
        "gender": patient.gender if patient else None,
        "village": patient.village if patient else None,
        "phone": patient.phone if patient else None,
        "created_at": case.created_at.isoformat() if case.created_at else None,
        "status": case.status,
        "transcription": case.transcription,
        "triage": {
            "urgency": triage.urgency,
            "confidence": triage.confidence,
            "reasoning": triage.reasoning,
            "clinical_evidence": triage.clinical_evidence,
            "triggered_rules": json.loads(triage.triggered_rules) if triage.triggered_rules else [],
            "emotional_intensity": triage.emotional_intensity,
            "emotional_phrases": json.loads(triage.emotional_phrases) if triage.emotional_phrases else [],
            "emotional_explanation": triage.emotional_explanation,
            "human_review": triage.human_review,
            "recommended_action": triage.recommended_action,
        } if triage else None,
        "symptoms": [
            {
                "symptom": s.symptom,
                "display": s.display or s.symptom.replace("_", " ").title(),
                "severity": s.severity,
                "duration": s.duration,
            }
            for s in symptoms
        ],
    }


@router.post("")
def create_case(body: CreateCaseRequest, db: Session = Depends(get_db)):
    """Create a new patient + case."""
    patient = db.query(Patient).filter(Patient.patient_id == body.patient_id).first()
    if not patient:
        patient = Patient(
            patient_id=body.patient_id,
            age=body.age,
            gender=body.gender,
            village=body.village,
            phone=body.phone,
        )
        db.add(patient)
        db.flush()

    case = Case(
        patient_id=patient.id,
        status="pending",
        transcription=body.transcription,
    )
    db.add(case)
    db.commit()
    db.refresh(case)

    return {"id": case.id, "patient_id": patient.patient_id, "status": case.status}


@router.post("/{case_id}/analyze")
def analyze_case(case_id: int, db: Session = Depends(get_db)):
    """Run full AI triage pipeline on a case."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    text = case.transcription or ""

    # Run AI pipeline
    symptoms = extract_symptoms(text)
    danger_hits = check_danger_rules(text, symptoms)
    emotional = check_emotional_language(text)
    triage_data = run_triage(text, symptoms, danger_hits, emotional)

    # Save symptoms
    db.query(Symptom).filter(Symptom.case_id == case_id).delete()
    for s in symptoms:
        db.add(Symptom(
            case_id=case_id,
            symptom=s["symptom"],
            display=s.get("display"),
            severity=s["severity"],
            duration=s.get("duration"),
        ))

    # Save triage result
    existing = db.query(TriageResult).filter(TriageResult.case_id == case_id).first()
    if existing:
        db.delete(existing)
        db.flush()

    triage_result = TriageResult(
        case_id=case_id,
        urgency=triage_data["urgency"],
        confidence=triage_data["confidence"],
        reasoning=triage_data["reasoning"],
        clinical_evidence=triage_data.get("clinical_evidence"),
        triggered_rules=triage_data["triggered_rules"],
        emotional_intensity=triage_data["emotional_intensity"],
        emotional_phrases=triage_data["emotional_phrases"],
        emotional_explanation=triage_data.get("emotional_explanation"),
        human_review=triage_data["human_review"],
        recommended_action=triage_data["recommended_action"],
    )
    db.add(triage_result)

    # Update case status
    case.status = "analyzed"

    # Create PHC alert if emergency or urgent
    if triage_data["urgency"] in ("EMERGENCY", "URGENT"):
        existing_alert = db.query(Alert).filter(Alert.case_id == case_id).first()
        if not existing_alert:
            reason_rules = json.loads(triage_data["triggered_rules"])
            reason_text = "Severe breathing difficulty reported." if any(r.get("rule_id") == "RESP_DISTRESS_001" for r in reason_rules) else (reason_rules[0]["rule_name"] if reason_rules else triage_data["reasoning"][:80])
            alert = Alert(
                case_id=case_id,
                urgency=triage_data["urgency"],
                reason=reason_text,
                phc="Primary Health Centre — Demo Block",
                status="pending",
            )
            db.add(alert)

    db.commit()
    db.refresh(case)

    return _serialize_case(case, db)


@router.get("")
def list_cases(
    urgency: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all cases with optional urgency filter."""
    cases = db.query(Case).order_by(Case.created_at.desc()).all()
    result = []
    for c in cases:
        serialized = _serialize_case(c, db)
        if urgency and serialized.get("triage"):
            if serialized["triage"]["urgency"] != urgency.upper():
                continue
        result.append(serialized)
    return result


@router.get("/{case_id}")
def get_case(case_id: int, db: Session = Depends(get_db)):
    """Get single case detail."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return _serialize_case(case, db)
