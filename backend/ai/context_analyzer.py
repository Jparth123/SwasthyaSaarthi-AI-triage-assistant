"""
SwasthyaSaarthi — Emotional / Dramatic Language Context Module

KEY INNOVATION:
Distinguishes culturally normal dramatic or emotionally expressive speech
from genuine concrete clinical danger evidence.

Example:
"I am dying, I can't take this anymore!" / "Meri jaan nikal gayi, main mar raha hoon!"
vs
"I cannot breathe properly and I cannot speak."

Emotional intensity alone NEVER triggers an EMERGENCY triage classification.
"""

from typing import Dict, List

# Dramatic / emotional Hindi & English phrases common in colloquial speech
DRAMATIC_PHRASES = [
    # English dramatic expressions
    "i am dying",
    "i'm dying",
    "i cannot take this anymore",
    "can't take this anymore",
    "i cant take this anymore",
    "going to die",
    "kill me now",
    "it is unbearable",
    "end of the world",
    # Hindi dramatic expressions
    "jaan nikal gayi",
    "jaan ja rahi hai",
    "marne wala hoon",
    "marne wali hoon",
    "mar jaunga",
    "mar jaungi",
    "ab to marna hi hai",
    "meri toh zindagi khatam",
    "meri to jaan nikal",
    "bilkul theek nahi",
    "kuch toh karo",
    "bahut bura lag raha",
    "bahut bura laga",
    "main to gaya",
    "main to gayi",
    "arre yaar",
    "arre bhai",
    "allah re",
    "hai ram",
    "ram ram",
    "bhagwan bachao",
    "bhagwan jaane",
    "tabahi aa gayi",
    "sab khatam ho gaya",
    "meri dasha kharaab hai",
    "bahut pareshaan hoon",
    "takleef bhari zindagi",
    "toot gaya",
    "toot gayi",
    "hadd ho gayi",
    "bass ho gaya",
]

EMOTIONAL_INTENSIFIERS = [
    "bahut bura", "bilkul theek nahi", "kuch bhi nahi", "zyada",
    "bahut zyada", "atyadhik", "itna bura", "itni takleef",
    "so much pain", "unbearable", "terrible", "horrible",
]


def check_emotional_language(text: str) -> Dict:
    """
    Analyze text for emotional/dramatic language.
    Returns:
        - emotional_intensity: float 0.0–1.0
        - detected_phrases: list of matched phrases
        - has_emotional_language: bool
        - explanation: human-readable note explaining the clinical context
    """
    text_lower = text.lower()
    detected = []

    for phrase in DRAMATIC_PHRASES:
        if phrase.lower() in text_lower:
            detected.append(phrase)

    intensifier_count = sum(1 for w in EMOTIONAL_INTENSIFIERS if w.lower() in text_lower)

    base_score = min(len(detected) * 0.30, 0.75)
    intensity_boost = min(intensifier_count * 0.08, 0.20)
    emotional_intensity = min(base_score + intensity_boost, 0.95)

    has_emotional = len(detected) > 0 or intensifier_count > 0

    explanation = ""
    if has_emotional:
        explanation = (
            "Emotionally intense language detected. "
            "However, no strong clinical danger indicator was identified. "
            "Therefore, emotional intensity was NOT used as the primary reason for emergency classification."
        )
    else:
        explanation = "No dramatic or emotionally intense language detected."

    return {
        "emotional_intensity": round(emotional_intensity, 2),
        "detected_phrases": detected,
        "has_emotional_language": has_emotional,
        "explanation": explanation,
    }
