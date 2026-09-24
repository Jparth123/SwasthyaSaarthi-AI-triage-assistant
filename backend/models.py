"""
SwasthyaSaarthi Backend — ORM Models
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, unique=True, index=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    village = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    cases = relationship("Case", back_populates="patient")


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String, default="pending")  # pending, analyzed, reviewed
    audio_path = Column(String, nullable=True)
    transcription = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="cases")
    triage_result = relationship("TriageResult", back_populates="case", uselist=False)
    symptoms = relationship("Symptom", back_populates="case")
    alerts = relationship("Alert", back_populates="case")


class TriageResult(Base):
    __tablename__ = "triage_results"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), unique=True)
    urgency = Column(String)          # EMERGENCY, URGENT, ROUTINE, HUMAN_REVIEW
    confidence = Column(Float)
    reasoning = Column(Text)
    clinical_evidence = Column(Text, nullable=True)
    triggered_rules = Column(Text)    # JSON string
    emotional_intensity = Column(Float, default=0.0)
    emotional_phrases = Column(Text, nullable=True)  # JSON string
    emotional_explanation = Column(Text, nullable=True)
    human_review = Column(Boolean, default=False)
    recommended_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("Case", back_populates="triage_result")


class Symptom(Base):
    __tablename__ = "symptoms"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    symptom = Column(String)
    display = Column(String, nullable=True)
    severity = Column(String, default="moderate")  # mild, moderate, severe
    duration = Column(String, nullable=True)

    case = relationship("Case", back_populates="symptoms")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    urgency = Column(String)
    reason = Column(Text)
    phc = Column(String, default="Primary Health Centre — Demo Block")
    status = Column(String, default="pending")  # pending, queued, synced, acknowledged
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("Case", back_populates="alerts")
