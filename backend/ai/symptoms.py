"""
SwasthyaSaarthi — Symptom Extraction compatibility wrapper
Re-exports from symptom_extractor.py
"""

from ai.symptom_extractor import SYMPTOM_DICT, extract_symptoms, extract_duration

__all__ = ["SYMPTOM_DICT", "extract_symptoms", "extract_duration"]
