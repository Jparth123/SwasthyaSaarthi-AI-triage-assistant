"""
SwasthyaSaarthi — Transcription Module
Modular stub — accepts audio path or uses predefined demo text.
Designed to accept a real offline STT model (e.g., Whisper) in the future.
"""

import os
from typing import Optional

# Predefined demo transcriptions
DEMO_TRANSCRIPTIONS = {
    "emergency": (
        "Saans lene mein bahut dikkat ho rahi hai, bol bhi nahi paa raha hoon. "
        "Chest mein dard hai aur lips blue ho rahe hain."
    ),
    "dramatic": (
        "Arre meri toh jaan nikal gayi, bahut bura lag raha hai yaar. "
        "Kuch toh karo bhai, bilkul theek nahi hoon."
    ),
    "urgent": (
        "Do din se bukhar hai aur weakness badh rahi hai. "
        "Khaana nahi kha raha, thoda sir dard bhi hai."
    ),
    "ambiguous": (
        "Woh... kuch... lagta hai... nahi pata... ajeeb sa..."
        "Bas theek nahi hai. Pehle bhi aisa hua tha shayad."
    ),
    "routine": (
        "Thoda headache hai kal se, fever nahi hai. "
        "Kaam kiya tha dhoop mein, thakaan lag rahi hai."
    ),
}


def transcribe_audio(audio_path: Optional[str] = None, demo_type: Optional[str] = None) -> dict:
    """
    Transcribe audio to text.
    - If demo_type is provided, returns the predefined transcription.
    - If audio_path is provided, returns a placeholder (real STT to be added).
    - Returns a dict with: text, source, confidence.
    """
    if demo_type and demo_type in DEMO_TRANSCRIPTIONS:
        return {
            "text": DEMO_TRANSCRIPTIONS[demo_type],
            "source": "demo",
            "confidence": 0.99,
            "language": "hi-en",  # Hindi-English mixed
        }

    if audio_path and os.path.exists(audio_path):
        # Placeholder for future offline STT (e.g., Whisper small)
        return {
            "text": "[Audio transcription pending — offline STT module not yet integrated]",
            "source": "audio_stub",
            "confidence": 0.0,
            "language": "unknown",
        }

    return {
        "text": "",
        "source": "none",
        "confidence": 0.0,
        "language": "unknown",
    }
