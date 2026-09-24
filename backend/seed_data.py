"""
SwasthyaSaarthi — Database Seeder
Seeds exactly the 12 cases specified in the hackathon requirement:
- 12 Total Cases
- 2 Emergency
- 4 Urgent
- 6 Routine
- 3 Pending Reviews
- 1 PHC Alert (Pending Human Acknowledgement)
- Specific cases: C-1021 / P-102, C-1022 / P-103, C-1023 / P-104, and P-1042 (Demo Village)
"""

import json
from datetime import datetime, timezone, timedelta
from database import SessionLocal, init_db, engine
from models import Base, Patient, Case, TriageResult, Symptom, Alert


def seed_database(force: bool = False):
    init_db()
    db = SessionLocal()
    try:
        count = db.query(Case).count()
        if count >= 12 and not force:
            return

        # Clean old records if forcing or re-seeding
        if force or count < 12:
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)

        now = datetime.now(timezone.utc)

        cases_data = [
            # 1. C-1021 | P-102 | 10:21 | Emergency | PHC Alert
            {
                "patient_id": "P-102",
                "age": 52,
                "gender": "Male",
                "village": "Rampur",
                "phone": "+91 98765 43210",
                "time_offset_min": 180,
                "transcription": "Saans lene mein bahut dikkat ho rahi hai aur bol bhi nahi paa raha. Seene mein dard hai aur hont neele pad rahe hain.",
                "urgency": "EMERGENCY",
                "confidence": 0.94,
                "reasoning": "Reported danger indicator: Severe breathing difficulty, functional inability to speak, cyanosis. Triggered rule: RESP_DISTRESS_001, NEURO_SPEECH_006, RESP_CYANOSIS_007.",
                "clinical_evidence": "Unable to speak normally because of breathing difficulty.",
                "triggered_rules": [
                    {
                        "rule_id": "RESP_DISTRESS_001",
                        "rule_name": "Severe Breathing Difficulty",
                        "weight": 0.91,
                        "urgency_contribution": "EMERGENCY",
                        "explanation": "Severe breathing difficulty is a critical danger sign requiring immediate assessment.",
                        "matched_keywords": ["saans lene mein bahut dikkat", "bol bhi nahi paa raha"],
                    },
                    {
                        "rule_id": "NEURO_SPEECH_006",
                        "rule_name": "Inability to Speak / Functional Impairment",
                        "weight": 0.85,
                        "urgency_contribution": "EMERGENCY",
                        "explanation": "Sudden inability to speak indicates severe respiratory distress or neurological compromise.",
                        "matched_keywords": ["bol bhi nahi paa raha"],
                    },
                    {
                        "rule_id": "RESP_CYANOSIS_007",
                        "rule_name": "Cyanosis (Blue/Grey Lips)",
                        "weight": 0.91,
                        "urgency_contribution": "EMERGENCY",
                        "explanation": "Cyanosis (blue/grey lips) indicates dangerously low oxygen levels.",
                        "matched_keywords": ["hont neele"],
                    }
                ],
                "emotional_intensity": 0.10,
                "emotional_phrases": [],
                "emotional_explanation": "No dramatic speech detected. Urgency driven solely by physiological danger signs.",
                "human_review": False,
                "recommended_action": "Escalate to PHC for immediate human assessment.",
                "symptoms": [
                    {"symptom": "breathing_difficulty", "display": "Severe breathing difficulty", "severity": "severe", "duration": "Since morning"},
                    {"symptom": "inability_to_speak", "display": "Inability to speak", "severity": "severe", "duration": "Since morning"},
                    {"symptom": "blue_lips", "display": "Cyanosis (blue lips)", "severity": "severe", "duration": "Since morning"},
                ],
                "alert": {
                    "reason": "Severe breathing difficulty reported.",
                    "status": "acknowledged",
                    "phc": "Primary Health Centre — Demo Block",
                },
                "status": "analyzed",
            },
            # 2. C-1022 | P-103 | 10:43 | Urgent | Pending
            {
                "patient_id": "P-103",
                "age": 28,
                "gender": "Female",
                "village": "Sitapur",
                "phone": "+91 98765 43211",
                "time_offset_min": 140,
                "transcription": "Do din se tez bukhar hai aur chalne mein bahut kamzori lag rahi hai. Khaana bhi nahi kha paa rahi.",
                "urgency": "URGENT",
                "confidence": 0.74,
                "reasoning": "Persistent febrile illness accompanied by progressive weakness. Clinical review recommended within 24 hours.",
                "clinical_evidence": "Persistent febrile illness accompanied by escalating lethargy for 2 days.",
                "triggered_rules": [
                    {
                        "rule_id": "INFECT_FEVER_012",
                        "rule_name": "Persistent High Fever with Progressive Weakness",
                        "weight": 0.60,
                        "urgency_contribution": "URGENT",
                        "explanation": "Prolonged febrile illness with systemic weakness warrants clinical investigation.",
                        "matched_keywords": ["do din se bukhar", "kamzori"],
                    }
                ],
                "emotional_intensity": 0.05,
                "emotional_phrases": [],
                "emotional_explanation": "No emotional exaggeration detected.",
                "human_review": False,
                "recommended_action": "Arrange prompt clinical assessment at the nearest PHC within 24 hours.",
                "symptoms": [
                    {"symptom": "fever", "display": "Fever", "severity": "moderate", "duration": "For 2 days"},
                    {"symptom": "weakness", "display": "Weakness / fatigue", "severity": "mild", "duration": "For 2 days"},
                ],
                "alert": None,
                "status": "analyzed",
            },
            # 3. C-1023 | P-104 | 11:02 | Routine | Reviewed
            {
                "patient_id": "P-104",
                "age": 35,
                "gender": "Male",
                "village": "Karanpur",
                "phone": "+91 98765 43212",
                "time_offset_min": 110,
                "transcription": "Kal dhoop mein khet par kaam kiya tha, shaam se thoda sar dard hai aur thakaan hai. Bukhar nahi hai.",
                "urgency": "ROUTINE",
                "confidence": 0.82,
                "reasoning": "Mild tension headache and heat fatigue. No red flags or danger indicators.",
                "clinical_evidence": "Mild transient symptoms consistent with routine outpatient monitoring.",
                "triggered_rules": [],
                "emotional_intensity": 0.0,
                "emotional_phrases": [],
                "emotional_explanation": "Calm, objective symptom reporting.",
                "human_review": False,
                "recommended_action": "Schedule routine clinic visit / continue home monitoring.",
                "symptoms": [
                    {"symptom": "headache", "display": "Headache", "severity": "mild", "duration": "Since yesterday"},
                    {"symptom": "weakness", "display": "Weakness / fatigue", "severity": "mild", "duration": "Since yesterday"},
                ],
                "alert": None,
                "status": "reviewed",
            },
            # 4. P-1042 | Demo Village | 09:15 | Emergency | PHC Alert (Pending Human Acknowledgement)
            {
                "patient_id": "P-1042",
                "age": 44,
                "gender": "Female",
                "village": "Demo Village",
                "phone": "+91 98765 43213",
                "time_offset_min": 240,
                "transcription": "Subah se chest mein pain hai aur saans lene mein dikkat ho rahi hai. Bolne mein takleef ho rahi hai.",
                "urgency": "EMERGENCY",
                "confidence": 0.91,
                "reasoning": "Reported danger indicator: Severe breathing difficulty, functional impairment, acute chest pain. Triggered rule: RESP_DISTRESS_001, CARDIO_CHEST_003.",
                "clinical_evidence": "Unable to speak normally because of breathing difficulty.",
                "triggered_rules": [
                    {
                        "rule_id": "RESP_DISTRESS_001",
                        "rule_name": "Severe Breathing Difficulty",
                        "weight": 0.91,
                        "urgency_contribution": "EMERGENCY",
                        "explanation": "Severe breathing difficulty is a critical danger sign requiring immediate assessment.",
                        "matched_keywords": ["saans lene mein dikkat", "bolne mein takleef"],
                    },
                    {
                        "rule_id": "CARDIO_CHEST_003",
                        "rule_name": "Severe Chest Pain / Pressure",
                        "weight": 0.88,
                        "urgency_contribution": "EMERGENCY",
                        "explanation": "Acute chest pain may indicate a cardiac or pulmonary emergency.",
                        "matched_keywords": ["chest mein pain"],
                    }
                ],
                "emotional_intensity": 0.12,
                "emotional_phrases": [],
                "emotional_explanation": "Clinical urgency determined by physiological distress markers.",
                "human_review": False,
                "recommended_action": "Escalate to PHC for immediate human assessment.",
                "symptoms": [
                    {"symptom": "chest_pain", "display": "Chest pain", "severity": "severe", "duration": "Since morning"},
                    {"symptom": "breathing_difficulty", "display": "Severe breathing difficulty", "severity": "severe", "duration": "Since morning"},
                    {"symptom": "functional_impairment", "display": "Functional impairment", "severity": "severe", "duration": "Since morning"},
                ],
                "alert": {
                    "reason": "Severe breathing difficulty",
                    "status": "pending",  # PENDING HUMAN ACKNOWLEDGEMENT
                    "phc": "Primary Health Centre — Demo Block",
                },
                "status": "analyzed",
            },
            # 5. P-105 | Bhojpur | Urgent (Pending Review 1)
            {
                "patient_id": "P-105",
                "age": 24,
                "gender": "Female",
                "village": "Bhojpur",
                "phone": "+91 98765 43214",
                "time_offset_min": 200,
                "transcription": "Pregnancy mein pet mein dard hai kal raat se, thoda khichav lag raha hai.",
                "urgency": "URGENT",
                "confidence": 0.77,
                "reasoning": "Pregnancy discomfort reported. Requires health worker inspection to rule out obstetric complications.",
                "clinical_evidence": "Second trimester abdominal discomfort without bleeding.",
                "triggered_rules": [
                    {
                        "rule_id": "OBST_PREGNANCY_009",
                        "rule_name": "Serious Pregnancy Warning Signs",
                        "weight": 0.75,
                        "urgency_contribution": "URGENT",
                        "explanation": "Warning signs during pregnancy require prompt obstetric check.",
                        "matched_keywords": ["pregnancy mein dard"],
                    }
                ],
                "emotional_intensity": 0.15,
                "emotional_phrases": [],
                "emotional_explanation": "Calm query regarding abdominal tightness.",
                "human_review": True,
                "recommended_action": "Arrange prompt clinical assessment at the nearest PHC within 24 hours.",
                "symptoms": [
                    {"symptom": "pregnancy_danger", "display": "Pregnancy warning sign", "severity": "moderate", "duration": "Since last night"},
                ],
                "alert": None,
                "status": "pending",
            },
            # 6. P-106 | Anandpur | Routine (Dramatic Speech Showcase!)
            {
                "patient_id": "P-106",
                "age": 31,
                "gender": "Female",
                "village": "Anandpur",
                "phone": "+91 98765 43215",
                "time_offset_min": 170,
                "transcription": "Arre meri toh jaan nikal gayi! Main marne wali hoon, kuch toh karo bhai! Itna bura sar dard hai ki main to gayi!",
                "urgency": "ROUTINE",
                "confidence": 0.80,
                "reasoning": "Emotionally intense language was detected, but no clinical danger signs were identified. The system does not classify emotional language as an emergency indicator.",
                "clinical_evidence": "Hyperbolic emotional expressions without verified physiological danger markers.",
                "triggered_rules": [],
                "emotional_intensity": 0.88,
                "emotional_phrases": ["jaan nikal gayi", "marne wali hoon", "kuch toh karo", "main to gayi"],
                "emotional_explanation": "Emotionally intense language detected. However, no strong clinical danger indicator was identified. Therefore, emotional intensity was NOT used as the primary reason for emergency classification.",
                "human_review": False,
                "recommended_action": "Schedule routine clinic visit / continue home monitoring.",
                "symptoms": [
                    {"symptom": "headache", "display": "Headache", "severity": "mild", "duration": "Since morning"},
                ],
                "alert": None,
                "status": "reviewed",
            },
            # 7. P-107 | Rampur | Urgent
            {
                "patient_id": "P-107",
                "age": 4,
                "gender": "Male",
                "village": "Rampur",
                "phone": "+91 98765 43216",
                "time_offset_min": 150,
                "transcription": "Bacche ko do din se dast aur ulti hai, pani nahi pee raha hai aur muh sookh raha hai.",
                "urgency": "URGENT",
                "confidence": 0.84,
                "reasoning": "Pediatric diarrhea with signs of moderate dehydration. Oral rehydration and clinic visit recommended.",
                "clinical_evidence": "Clinical indicators of moderate dehydration and ongoing fluid loss.",
                "triggered_rules": [
                    {
                        "rule_id": "GI_DEHYDRATION_011",
                        "rule_name": "Severe Dehydration / Inability to Retain Fluids",
                        "weight": 0.65,
                        "urgency_contribution": "URGENT",
                        "explanation": "Severe fluid deficit requires prompt oral rehydration therapy or clinical evaluation.",
                        "matched_keywords": ["pani nahi pee raha", "muh sookh raha"],
                    }
                ],
                "emotional_intensity": 0.25,
                "emotional_phrases": [],
                "emotional_explanation": "Parent expressing genuine concern for child.",
                "human_review": False,
                "recommended_action": "Arrange prompt clinical assessment at the nearest PHC within 24 hours.",
                "symptoms": [
                    {"symptom": "dehydration", "display": "Dehydration", "severity": "moderate", "duration": "For 2 days"},
                    {"symptom": "diarrhea", "display": "Diarrhea", "severity": "mild", "duration": "For 2 days"},
                    {"symptom": "vomiting", "display": "Vomiting", "severity": "mild", "duration": "For 2 days"},
                ],
                "alert": None,
                "status": "analyzed",
            },
            # 8. P-108 | Sitapur | Routine
            {
                "patient_id": "P-108",
                "age": 40,
                "gender": "Male",
                "village": "Sitapur",
                "phone": "+91 98765 43217",
                "time_offset_min": 120,
                "transcription": "Kal se daayein haath mein thoda dard hai, vajan uthaya tha isliye shayad.",
                "urgency": "ROUTINE",
                "confidence": 0.85,
                "reasoning": "Musculoskeletal strain from heavy lifting. No neurological deficits or systemic flags.",
                "clinical_evidence": "Localized exertional strain without systemic symptoms.",
                "triggered_rules": [],
                "emotional_intensity": 0.0,
                "emotional_phrases": [],
                "emotional_explanation": "Straightforward historical report.",
                "human_review": False,
                "recommended_action": "Schedule routine clinic visit / continue home monitoring.",
                "symptoms": [
                    {"symptom": "body_pain", "display": "Body pain / aches", "severity": "mild", "duration": "Since yesterday"},
                ],
                "alert": None,
                "status": "reviewed",
            },
            # 9. P-109 | Karanpur | Urgent
            {
                "patient_id": "P-109",
                "age": 19,
                "gender": "Female",
                "village": "Karanpur",
                "phone": "+91 98765 43218",
                "time_offset_min": 90,
                "transcription": "Dawai khane ke baad se chehre par rash aaya hai aur khujli ke saath thodi sujan lag rahi hai.",
                "urgency": "URGENT",
                "confidence": 0.78,
                "reasoning": "Suspected drug-induced cutaneous reaction with localized edema. Discontinue offending agent and review at PHC.",
                "clinical_evidence": "Localized facial rash and itching following medication.",
                "triggered_rules": [
                    {
                        "rule_id": "IMMUNO_ANAPHYLAXIS_008",
                        "rule_name": "Severe Allergic Reaction / Anaphylaxis",
                        "weight": 0.70,
                        "urgency_contribution": "URGENT",
                        "explanation": "Cutaneous allergic reaction requiring monitoring against respiratory progression.",
                        "matched_keywords": ["rash aaya", "sujan"],
                    }
                ],
                "emotional_intensity": 0.18,
                "emotional_phrases": [],
                "emotional_explanation": "Anxious presentation regarding sudden rash.",
                "human_review": False,
                "recommended_action": "Arrange prompt clinical assessment at the nearest PHC within 24 hours.",
                "symptoms": [
                    {"symptom": "allergic_reaction", "display": "Allergic reaction / rash", "severity": "moderate", "duration": "Since today"},
                ],
                "alert": None,
                "status": "analyzed",
            },
            # 10. P-110 | Bhojpur | Routine (Pending Review 2 — Dialect Ambiguity)
            {
                "patient_id": "P-110",
                "age": 62,
                "gender": "Male",
                "village": "Bhojpur",
                "phone": "+91 98765 43219",
                "time_offset_min": 70,
                "transcription": "Ajeeb sa lagta hai... woh... pehle bhi hua tha... theek se samajh nahi aa raha.",
                "urgency": "HUMAN_REVIEW",
                "confidence": 0.42,
                "reasoning": "Ambiguous regional dialect content with incomplete clinical signal. Direct ASHA health worker examination recommended.",
                "clinical_evidence": "Incomplete verbal description without clear danger signs or definitive symptom descriptors.",
                "triggered_rules": [],
                "emotional_intensity": 0.05,
                "emotional_phrases": [],
                "emotional_explanation": "Speech is hesitant and ambiguous.",
                "human_review": True,
                "recommended_action": "Insufficient clinical clarity. Health worker review required.",
                "symptoms": [],
                "alert": None,
                "status": "pending",
            },
            # 11. P-111 | Anandpur | Routine (Pending Review 3)
            {
                "patient_id": "P-111",
                "age": 48,
                "gender": "Female",
                "village": "Anandpur",
                "phone": "+91 98765 43220",
                "time_offset_min": 45,
                "transcription": "Halka khansi jukaam hai teen din se, thoda gale mein kharash hai.",
                "urgency": "ROUTINE",
                "confidence": 0.81,
                "reasoning": "Upper respiratory tract symptoms consistent with viral coryza. Follow routine supportive care.",
                "clinical_evidence": "Mild rhinorrhea and pharyngeal tickle without respiratory distress.",
                "triggered_rules": [],
                "emotional_intensity": 0.0,
                "emotional_phrases": [],
                "emotional_explanation": "Standard mild cold symptoms.",
                "human_review": True,
                "recommended_action": "Schedule routine clinic visit / continue home monitoring.",
                "symptoms": [
                    {"symptom": "weakness", "display": "Mild malaise", "severity": "mild", "duration": "For 3 days"},
                ],
                "alert": None,
                "status": "pending",
            },
            # 12. P-112 | Demo Village | Routine
            {
                "patient_id": "P-112",
                "age": 16,
                "gender": "Male",
                "village": "Demo Village",
                "phone": "+91 98765 43221",
                "time_offset_min": 20,
                "transcription": "Dhoop mein cycle chalane ke baad aankhon mein thodi jalan aur paani aa raha hai.",
                "urgency": "ROUTINE",
                "confidence": 0.86,
                "reasoning": "Environmental ocular irritation. No systemic distress or visual impairment.",
                "clinical_evidence": "Transient conjunctival irritation from dust / sunlight exposure.",
                "triggered_rules": [],
                "emotional_intensity": 0.0,
                "emotional_phrases": [],
                "emotional_explanation": "Non-distressed presentation.",
                "human_review": False,
                "recommended_action": "Schedule routine clinic visit / continue home monitoring.",
                "symptoms": [],
                "alert": None,
                "status": "reviewed",
            },
        ]

        for cdata in cases_data:
            patient = Patient(
                patient_id=cdata["patient_id"],
                age=cdata["age"],
                gender=cdata["gender"],
                village=cdata["village"],
                phone=cdata["phone"],
            )
            db.add(patient)
            db.flush()

            case_time = now - timedelta(minutes=cdata["time_offset_min"])
            case = Case(
                patient_id=patient.id,
                created_at=case_time,
                status=cdata["status"],
                transcription=cdata["transcription"],
            )
            db.add(case)
            db.flush()

            triage = TriageResult(
                case_id=case.id,
                urgency=cdata["urgency"],
                confidence=cdata["confidence"],
                reasoning=cdata["reasoning"],
                clinical_evidence=cdata.get("clinical_evidence"),
                triggered_rules=json.dumps(cdata["triggered_rules"]),
                emotional_intensity=cdata["emotional_intensity"],
                emotional_phrases=json.dumps(cdata["emotional_phrases"]),
                emotional_explanation=cdata["emotional_explanation"],
                human_review=cdata["human_review"],
                recommended_action=cdata["recommended_action"],
                created_at=case_time,
            )
            db.add(triage)

            for s in cdata["symptoms"]:
                symptom = Symptom(
                    case_id=case.id,
                    symptom=s["symptom"],
                    display=s["display"],
                    severity=s["severity"],
                    duration=s.get("duration"),
                )
                db.add(symptom)

            if cdata.get("alert"):
                alert_info = cdata["alert"]
                alert = Alert(
                    case_id=case.id,
                    urgency=cdata["urgency"],
                    reason=alert_info["reason"],
                    phc=alert_info.get("phc", "Primary Health Centre — Demo Block"),
                    status=alert_info.get("status", "pending"),
                    created_at=case_time,
                )
                db.add(alert)

        db.commit()
        print("Database seeded with exactly 12 cases (2 Emergency, 4 Urgent, 6 Routine, 3 Pending, 1 PHC Alert)!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database(force=True)
