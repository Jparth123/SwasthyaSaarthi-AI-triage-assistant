"""
SwasthyaSaarthi — Symptom Extractor
Bilingual (Hindi + English + Hinglish) keyword and pattern-based symptom & duration extraction.
Deterministic and explainable without requiring large cloud models.
"""

import re
from typing import List, Dict, Optional, Tuple

SYMPTOM_DICT: Dict[str, Dict] = {
    "breathing_difficulty": {
        "severity": "severe",
        "display": "Severe breathing difficulty",
        "keywords": [
            "saans lene mein dikkat", "saans lene mein takleef", "saans nahi aa raha",
            "breathing problem", "breathless", "dama", "asthma",
            "saans phool", "saans ukhad", "saans ki takleef",
            "can't breathe", "cannot breathe", "breathing difficulty",
            "saans lene me dikkat", "saans atak rahi",
        ],
    },
    "functional_impairment": {
        "severity": "severe",
        "display": "Functional impairment",
        "keywords": [
            "bol bhi nahi paa raha", "bol nahi pa raha", "baat nahi kar sakta",
            "unable to speak", "zuban nahi chal rahi", "bolne mein takleef",
            "uth nahi paa raha", "khada nahi ho sakta", "chal nahi pa raha",
        ],
    },
    "chest_pain": {
        "severity": "severe",
        "display": "Chest pain",
        "keywords": [
            "chest mein pain", "chest pain", "seene mein dard", "sina dard", "chest mein dard",
            "dil ka dard", "heart pain", "seene ki jalan", "chest me pain",
            "seene par bojh", "chest pressure",
        ],
    },
    "fever": {
        "severity": "moderate",
        "display": "Fever",
        "keywords": [
            "bukhar hai", "bukhaar hai", "fever hai", "temperature hai",
            "tap lagi", "jwar", "garmi lag rahi", "body hot",
            "din se bukhar", "din se bukhaar", "roz bukhar", "bukhar",
        ],
    },
    "unconsciousness": {
        "severity": "severe",
        "display": "Unconsciousness / loss of consciousness",
        "keywords": [
            "behosh", "unconscious", "hosh nahi", "coma", "behoshi",
            "gir gaya", "gir gayi", "hosh kho", "faint",
        ],
    },
    "weakness": {
        "severity": "mild",
        "display": "Weakness / fatigue",
        "keywords": [
            "weakness", "kamzori", "thakaan", "tired", "weak",
            "kamzor", "shakti nahi", "energy nahi", "drained", "sust",
        ],
    },
    "headache": {
        "severity": "mild",
        "display": "Headache",
        "keywords": [
            "headache", "sir dard", "sar dard", "sir mein dard",
            "migraine", "sir bhaari", "sar mein dard",
        ],
    },
    "bleeding": {
        "severity": "severe",
        "display": "Severe bleeding",
        "keywords": [
            "khoon aa raha", "bleeding", "khoon nahi ruk raha",
            "blood", "khoon", "uncontrolled bleed", "haemorrhage",
        ],
    },
    "seizure": {
        "severity": "severe",
        "display": "Seizure / convulsion",
        "keywords": [
            "seizure", "convulsion", "mirgi", "jhatkhe", "jhatke",
            "fits", "epilepsy", "hath pair kaanpna",
        ],
    },
    "vomiting": {
        "severity": "mild",
        "display": "Vomiting / nausea",
        "keywords": [
            "ulti", "vomit", "nausea", "ji machal", "chakkar",
            "vomiting", "ulta", "jee machlana",
        ],
    },
    "dehydration": {
        "severity": "moderate",
        "display": "Dehydration",
        "keywords": [
            "pani nahi pee raha", "dehydration", "dry mouth",
            "bahut pyaas", "muh sukh raha", "peshab nahi",
        ],
    },
    "pregnancy_danger": {
        "severity": "severe",
        "display": "Pregnancy danger sign",
        "keywords": [
            "pregnancy mein dard", "garbhvati", "pregnant", "prasav",
            "delivery", "baby aane wala", "pani aaya", "bleeding during pregnancy",
            "convulsion during pregnancy", "prasav peeda",
        ],
    },
    "inability_to_speak": {
        "severity": "severe",
        "display": "Inability to speak",
        "keywords": [
            "bol nahi paa raha", "bol nahi pa raha", "baat nahi kar sakta",
            "speech loss", "unable to speak", "muh se nahi nikal raha",
            "bolne mein takleef", "zuban nahi chal rahi",
        ],
    },
    "blue_lips": {
        "severity": "severe",
        "display": "Cyanosis (blue/grey lips or skin)",
        "keywords": [
            "lips blue", "blue lips", "hont neele", "skin neeli",
            "grey lips", "neela pad raha", "cyanosis",
        ],
    },
    "allergic_reaction": {
        "severity": "severe",
        "display": "Severe allergic reaction",
        "keywords": [
            "allergy", "anaphylaxis", "swelling", "sujan", "hives",
            "rash aaya", "skin reaction", "khujli ke saath sujan",
        ],
    },
    "diarrhea": {
        "severity": "mild",
        "display": "Diarrhea / loose motions",
        "keywords": [
            "dast", "loose motion", "diarrhea", "paani jaisa", "potty",
            "sulabhata", "aanv", "pet kharab",
        ],
    },
    "body_pain": {
        "severity": "mild",
        "display": "Body pain / aches",
        "keywords": [
            "badan dard", "body pain", "haath dard", "pair dard",
            "muscle pain", "maaspeshion", "dard ho raha",
        ],
    },
}

DURATION_PATTERNS = [
    (r"\bsubah se\b", "Since morning"),
    (r"\bkal se\b", "Since yesterday"),
    (r"\braat se\b", "Since last night"),
    (r"\baaj se\b", "Since today"),
    (r"\b(\d+|do|teen|chaar|paanch|ek)\s*(din|days?)\s*se\b", "For {0} days"),
    (r"\b(\d+|ek|do)\s*(hafte|hafta|weeks?)\s*se\b", "For {0} weeks"),
    (r"\b(since morning|since yesterday|since last night|for \d+ days?)\b", "{0}"),
]


def extract_duration(text: str) -> Optional[str]:
    """Extract clinical duration expression from text if present."""
    text_lower = text.lower()
    
    if "subah se" in text_lower:
        return "Since morning"
    if "kal se" in text_lower:
        return "Since yesterday"
    if "raat se" in text_lower:
        return "Since last night"
    if "aaj se" in text_lower:
        return "Since today"
    
    m_days = re.search(r"(\d+|do|teen|chaar|paanch)\s*din\s*se", text_lower)
    if m_days:
        val = m_days.group(1)
        num_map = {"do": "2", "teen": "3", "chaar": "4", "paanch": "5"}
        return f"For {num_map.get(val, val)} days"
        
    m_eng = re.search(r"\b(since morning|since yesterday|since last night|for \d+ days?)\b", text_lower)
    if m_eng:
        return m_eng.group(1).title()

    return None


def extract_symptoms(text: str) -> List[Dict]:
    """
    Extract symptoms from mixed Hindi-English text using keyword matching.
    Returns list of: {symptom, display, severity, matched_keyword, duration}
    """
    text_lower = text.lower()
    found = []
    seen = set()
    duration = extract_duration(text)

    for symptom_key, symptom_info in SYMPTOM_DICT.items():
        for keyword in symptom_info["keywords"]:
            if keyword.lower() in text_lower and symptom_key not in seen:
                found.append({
                    "symptom": symptom_key,
                    "display": symptom_info["display"],
                    "severity": symptom_info["severity"],
                    "matched_keyword": keyword,
                    "duration": duration,
                })
                seen.add(symptom_key)
                break

    return found
