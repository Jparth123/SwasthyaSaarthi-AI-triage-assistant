"""
SwasthyaSaarthi — Danger Sign Rules
12 deterministic clinical danger rules.
Each rule has: id, name, symptom_keys, keywords, weight, explanation.
Rules are explainable — each match produces a reason and evidence string.
"""

from typing import List, Dict

DANGER_RULES: List[Dict] = [
    {
        "id": "RESP_DISTRESS_001",
        "name": "Severe Breathing Difficulty",
        "symptom_keys": ["breathing_difficulty"],
        "keywords": [
            "saans lene mein bahut dikkat", "saans nahi aa raha", "breathless",
            "saans phool", "saans ukhad", "saans ki takleef", "can't breathe",
            "cannot breathe", "breathing problem", "saans lene mein dikkat",
            "cannot breathe properly and i cannot speak",
            "unable to speak normally because of breathing difficulty",
            "bol nahi paa raha saans", "saans ki wajah se bol nahi",
        ],
        "weight": 0.91,
        "urgency_contribution": "EMERGENCY",
        "explanation": "Severe breathing difficulty is a critical danger sign requiring immediate assessment.",
        "evidence_quote": "Severe breathing difficulty reported with functional distress.",
    },
    {
        "id": "NEURO_UNCONSCIOUS_002",
        "name": "Unconsciousness / Loss of Consciousness",
        "symptom_keys": ["unconsciousness"],
        "keywords": ["behosh", "unconscious", "hosh nahi", "faint", "coma", "hosh kho", "behosh ho gaya"],
        "weight": 0.92,
        "urgency_contribution": "EMERGENCY",
        "explanation": "Loss of consciousness is a critical neurological/vital emergency.",
        "evidence_quote": "Patient reported unresponsive or unconscious.",
    },
    {
        "id": "CARDIO_CHEST_003",
        "name": "Severe Chest Pain / Pressure",
        "symptom_keys": ["chest_pain"],
        "keywords": [
            "chest pain", "seene mein dard", "chest mein dard", "sina dard",
            "seene mein jalan aur dard", "dil ka dard", "chest pressure",
        ],
        "weight": 0.88,
        "urgency_contribution": "EMERGENCY",
        "explanation": "Acute chest pain may indicate a cardiac or pulmonary emergency.",
        "evidence_quote": "Acute chest pain and severe discomfort reported.",
    },
    {
        "id": "HEM_BLEED_004",
        "name": "Uncontrolled / Severe Bleeding",
        "symptom_keys": ["bleeding"],
        "keywords": ["khoon nahi ruk raha", "uncontrolled bleeding", "haemorrhage", "severe bleeding", "khoon bahar aa raha"],
        "weight": 0.89,
        "urgency_contribution": "EMERGENCY",
        "explanation": "Uncontrolled bleeding is a life-threatening danger sign requiring immediate hemostasis.",
        "evidence_quote": "Uncontrolled bleeding that does not stop.",
    },
    {
        "id": "NEURO_SEIZURE_005",
        "name": "Seizure / Convulsion",
        "symptom_keys": ["seizure"],
        "keywords": ["seizure", "convulsion", "mirgi", "jhatke", "jhatkhe", "fits", "epilepsy fit"],
        "weight": 0.86,
        "urgency_contribution": "EMERGENCY",
        "explanation": "Active or recent convulsions require urgent neurological airway stabilization.",
        "evidence_quote": "Convulsive seizure activity or fits reported.",
    },
    {
        "id": "NEURO_SPEECH_006",
        "name": "Inability to Speak / Functional Impairment",
        "symptom_keys": ["inability_to_speak"],
        "keywords": [
            "bol nahi paa raha", "bol nahi pa raha", "speech loss",
            "unable to speak", "zuban nahi chal rahi", "baat nahi kar sakta",
            "unable to speak normally because of breathing difficulty",
        ],
        "weight": 0.85,
        "urgency_contribution": "EMERGENCY",
        "explanation": "Sudden inability to speak indicates severe respiratory distress or neurological compromise.",
        "evidence_quote": "Unable to speak normally because of acute distress.",
    },
    {
        "id": "RESP_CYANOSIS_007",
        "name": "Cyanosis (Blue/Grey Lips or Face)",
        "symptom_keys": ["blue_lips"],
        "keywords": ["blue lips", "hont neele", "grey lips", "neela pad raha", "cyanosis", "lips blue", "face blue"],
        "weight": 0.91,
        "urgency_contribution": "EMERGENCY",
        "explanation": "Cyanosis reflects profound hypoxemia requiring immediate oxygen supplementation.",
        "evidence_quote": "Cyanosis / blue lips observed indicating severe oxygen desaturation.",
    },
    {
        "id": "IMMUNO_ANAPHYLAXIS_008",
        "name": "Severe Allergic Reaction / Anaphylaxis",
        "symptom_keys": ["allergic_reaction"],
        "keywords": ["anaphylaxis", "severe allergy", "throat swelling", "gala phool gaya", "saans band ho rahi allergy"],
        "weight": 0.88,
        "urgency_contribution": "EMERGENCY",
        "explanation": "Severe allergic reactions can rapidly cause airway compromise and shock.",
        "evidence_quote": "Rapid airway swelling or severe allergic reaction.",
    },
    {
        "id": "OBST_PREGNANCY_009",
        "name": "Serious Pregnancy Warning Signs",
        "symptom_keys": ["pregnancy_danger"],
        "keywords": [
            "pregnancy mein dard", "bleeding during pregnancy", "garbhvati khoon",
            "convulsion during pregnancy", "prasav peeda", "pani aaya",
            "eclampsia", "pregnancy headache blur",
        ],
        "weight": 0.89,
        "urgency_contribution": "EMERGENCY",
        "explanation": "Severe warning signs during pregnancy require immediate emergency obstetric care.",
        "evidence_quote": "Obstetric danger indicators reported in pregnancy.",
    },
    {
        "id": "NEURO_WEAKNESS_010",
        "name": "Sudden Weakness / Paralysis",
        "symptom_keys": ["movement_loss"],
        "keywords": [
            "haath pair nahi chal rahe", "body move nahi", "paralysis", "laqwa",
            "sudden weakness", "ek taraf kamzori", "one side weak",
        ],
        "weight": 0.87,
        "urgency_contribution": "EMERGENCY",
        "explanation": "Sudden focal weakness or paralysis is a potential stroke alert.",
        "evidence_quote": "Sudden loss of limb movement or unilateral motor weakness.",
    },
    {
        "id": "GI_DEHYDRATION_011",
        "name": "Severe Dehydration / Inability to Retain Fluids",
        "symptom_keys": ["dehydration"],
        "keywords": ["pani nahi pee raha", "dehydration", "muh sukh raha", "peshab band", "sunken eyes", "lethargic"],
        "weight": 0.65,
        "urgency_contribution": "URGENT",
        "explanation": "Severe fluid deficit requires prompt oral rehydration therapy or clinical evaluation.",
        "evidence_quote": "Clinical indicators of moderate to severe dehydration.",
    },
    {
        "id": "INFECT_FEVER_012",
        "name": "Persistent High Fever with Progressive Weakness",
        "symptom_keys": ["fever", "weakness"],
        "keywords": [
            "din se bukhar", "days fever", "bukhar aur weakness",
            "2 din se bukhar", "do din se bukhar", "teen din se bukhar",
        ],
        "weight": 0.60,
        "urgency_contribution": "URGENT",
        "explanation": "Prolonged febrile illness with systemic weakness warrants clinical investigation.",
        "evidence_quote": "Persistent febrile illness accompanied by escalating lethargy.",
        "requires_multiple": True,
    },
]


def check_danger_rules(text: str, extracted_symptoms: list) -> List[Dict]:
    """
    Evaluate all danger rules against the text and extracted symptoms.
    Returns list of triggered rules with their details.
    """
    text_lower = text.lower()
    extracted_keys = {s["symptom"] for s in extracted_symptoms}
    triggered = []

    for rule in DANGER_RULES:
        keyword_hit = any(kw.lower() in text_lower for kw in rule["keywords"])
        symptom_hit = False

        if rule.get("requires_multiple"):
            symptom_hit = bool(rule["symptom_keys"]) and all(sk in extracted_keys for sk in rule["symptom_keys"])
        elif rule["symptom_keys"]:
            symptom_hit = any(sk in extracted_keys for sk in rule["symptom_keys"])

        if keyword_hit or symptom_hit:
            matched_keywords = [kw for kw in rule["keywords"] if kw.lower() in text_lower]
            evidence = rule.get("evidence_quote") or rule["explanation"]
            
            # If breathing + inability to speak in text, provide specific clinical quote
            if rule["id"] == "RESP_DISTRESS_001" and any(k in text_lower for k in ["bol", "speak"]):
                evidence = "Unable to speak normally because of breathing difficulty."

            triggered.append({
                "rule_id": rule["id"],
                "rule_name": rule["name"],
                "weight": rule["weight"],
                "urgency_contribution": rule["urgency_contribution"],
                "explanation": rule["explanation"],
                "evidence_quote": evidence,
                "matched_keywords": matched_keywords,
            })

    return triggered
