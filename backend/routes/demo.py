"""
SwasthyaSaarthi — Demo Cases Route
POST /api/v1/demo/{case_type}

Injects one of 5 predefined demo cases and runs triage automatically.
Ensures hackathon demos work reliably with full explainability.

case_type: emergency | dramatic | urgent | ambiguous | routine
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Patient, Case, TriageResult, Symptom, Alert
from ai.transcription import DEMO_TRANSCRIPTIONS
from ai.symptom_extractor import extract_symptoms
from ai.danger_rules import check_danger_rules
from ai.context_analyzer import check_emotional_language
from ai.triage_engine import run_triage

router = APIRouter()

DEMO_CASES = {
    "emergency": {
        "patient_id": "P-1042",
        "age": 44,
        "gender": "Female",
        "village": "Demo Village",
        "description": "True Emergency — Severe Breathing Difficulty",
    },
    "dramatic": {
        "patient_id": "P-1043",
        "age": 32,
        "gender": "Female",
        "village": "Sitapur",
        "description": "Dramatic Speech — No Clinical Emergency",
    },
    "urgent": {
        "patient_id": "P-1044",
        "age": 28,
        "gender": "Male",
        "village": "Karanpur",
        "description": "Urgent — Persistent Fever + Weakness",
    },
    "ambiguous": {
        "patient_id": "P-1045",
        "age": 60,
        "gender": "Female",
        "village": "Bhojpur",
        "description": "Ambiguous Dialect — Human Review Required",
    },
    "routine": {
        "patient_id": "P-1046",
        "age": 22,
        "gender": "Male",
        "village": "Anandpur",
        "description": "Routine — Mild Headache",
    },
}


@router.post("/{case_type}")
def run_demo_case(case_type: str, db: Session = Depends(get_db)):
    if case_type not in DEMO_CASES:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown demo case type. Valid: {list(DEMO_CASES.keys())}"
        )

    demo_info = DEMO_CASES[case_type]
    transcription = DEMO_TRANSCRIPTIONS.get(case_type, "")

    # Create or reuse patient
    patient = db.query(Patient).filter(Patient.patient_id == demo_info["patient_id"]).first()
    if not patient:
        patient = Patient(
            patient_id=demo_info["patient_id"],
            age=demo_info["age"],
            gender=demo_info["gender"],
            village=demo_info["village"],
        )
        db.add(patient)
        db.flush()

    # Create case
    case = Case(
        patient_id=patient.id,
        status="pending",
        transcription=transcription,
    )
    db.add(case)
    db.flush()

    # Run AI pipeline
    symptoms = extract_symptoms(transcription)
    danger_hits = check_danger_rules(transcription, symptoms)
    emotional = check_emotional_language(transcription)
    triage_data = run_triage(transcription, symptoms, danger_hits, emotional)

    # Save symptoms
    for s in symptoms:
        db.add(Symptom(
            case_id=case.id,
            symptom=s["symptom"],
            display=s.get("display"),
            severity=s["severity"],
            duration=s.get("duration"),
        ))

    # Save triage result
    triage_result = TriageResult(
        case_id=case.id,
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

    case.status = "analyzed"

    # Create alert if needed
    if triage_data["urgency"] in ("EMERGENCY", "URGENT"):
        reason_text = "Severe breathing difficulty" if case_type == "emergency" else "Persistent fever and weakness reported"
        alert = Alert(
            case_id=case.id,
            urgency=triage_data["urgency"],
            reason=reason_text,
            phc="Primary Health Centre — Demo Block",
            status="pending",
        )
        db.add(alert)

    db.commit()
    db.refresh(case)

    return {
        "id": case.id,
        "demo_type": case_type,
        "patient_id": patient.patient_id,
        "village": patient.village,
        "transcription": transcription,
        "triage": {
            "urgency": triage_data["urgency"],
            "confidence": triage_data["confidence"],
            "reasoning": triage_data["reasoning"],
            "clinical_evidence": triage_data.get("clinical_evidence"),
            "triggered_rules": json.loads(triage_data["triggered_rules"]),
            "emotional_intensity": triage_data["emotional_intensity"],
            "emotional_phrases": json.loads(triage_data["emotional_phrases"]),
            "emotional_explanation": triage_data.get("emotional_explanation"),
            "human_review": triage_data["human_review"],
            "recommended_action": triage_data["recommended_action"],
        },
        "symptoms": [
            {"symptom": s["symptom"], "display": s.get("display") or s["symptom"], "severity": s["severity"], "duration": s.get("duration")}
            for s in symptoms
        ],
    }
