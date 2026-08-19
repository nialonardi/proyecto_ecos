"""emotional_analyzer.py - Port de EmotionalAnalyzer.js.

Heurística de valencia/estado afectivo a partir del texto reconocido (y, opcionalmente,
métricas de habla que en esta versión web-based no llegan del navegador todavía).
"""
from dataclasses import dataclass, field

ANXIETY_KEYWORDS = ["miedo", "asustada", "angustia", "sola", "triste", "perdida", "dónde", "donde", "ayuda"]
POSITIVE_KEYWORDS = ["lindo", "alegría", "gracias", "hermoso", "bien", "contenta", "te quiero"]


@dataclass
class EmotionalAnalysis:
    valence: float
    detected_state: str
    is_agitated_or_disoriented: bool
    speech_rate: float = 1.0
    pauses_count: int = 0
    intensity: str = "Normal"


def analyze_affectivity(input_text: str, speech_rate: float = 1.0, pauses_count: int = 0) -> EmotionalAnalysis:
    text_lower = input_text.lower()

    valence = 0.8
    detected_state = "Estable / Tranquilo"
    is_agitated_or_disoriented = False

    matches_anxiety = sum(1 for word in ANXIETY_KEYWORDS if word in text_lower)
    matches_positive = sum(1 for word in POSITIVE_KEYWORDS if word in text_lower)

    if matches_anxiety > 0 or speech_rate > 1.4 or pauses_count > 3:
        valence = max(0.2, 0.7 - matches_anxiety * 0.2)
        detected_state = "Agitación / Desorientación" if matches_anxiety > 1 else "Leve Ansiedad / Tristeza"
        is_agitated_or_disoriented = True
    elif matches_positive > 0:
        valence = min(1.0, 0.85 + matches_positive * 0.1)
        detected_state = "Alegre / Receptivo"

    return EmotionalAnalysis(
        valence=valence,
        detected_state=detected_state,
        is_agitated_or_disoriented=is_agitated_or_disoriented,
        speech_rate=speech_rate,
        pauses_count=pauses_count,
        intensity="Elevada" if is_agitated_or_disoriented else "Normal",
    )
