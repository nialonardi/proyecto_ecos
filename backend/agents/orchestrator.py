"""orchestrator.py - Port de Orchestrator.js.

Corre el ciclo de 7 pasos (Observar -> Analizar -> Planificar -> Ejecutar -> Evaluar ->
Aprender -> Nueva Observación) server-side, y devuelve tanto el plan a renderizar como
el log de actividad por agente (para que DevStudioUI siga mostrando el monitor en vivo,
ahora reflejando lo que realmente pasó en el backend en vez de una simulación local).
"""
from datetime import datetime
from typing import List

from sqlalchemy.orm import Session

from agents import learning_agent, memory_agent, planning_agent
from agents.emotional_analyzer import analyze_affectivity
from agents.safety_rules import apply_validation_therapy, is_dusk_circadian


def _now_str() -> str:
    return datetime.now().strftime("%H:%M:%S")


def _photo_to_dict(photo):
    if photo is None:
        return None
    return {
        "id": photo.id,
        "url": photo.url,
        "title": photo.title,
        "description": photo.description,
        "suggestedQuestion": photo.suggested_question,
    }


def _memo_to_dict(memo):
    if memo is None:
        return None
    return {
        "id": memo.id,
        "sender": memo.sender,
        "text": memo.text,
        "audioUrl": memo.audio_url,
        "played": memo.played,
        "timestamp": memo.timestamp.strftime("%I:%M %p"),
    }


def run_orchestration_cycle(db: Session, transcript: str, client_hour: int = None) -> dict:
    steps: List[dict] = []

    def log(agent: str, message: str, level: str = "info"):
        steps.append({"agent": agent, "message": message, "level": level, "timestamp": _now_str()})

    patient = memory_agent.get_patient(db)
    hour = client_hour if client_hour is not None else datetime.now().hour
    is_night_or_dusk = is_dusk_circadian(hour)

    log("Captura", f'Audio recibido del usuario: "{transcript}"' if transcript != "PRESENCE_TRIGGER"
        else "Sensor de presencia activado (>3s mirada sostenida).")

    # PASO 2: ANALIZAR (Emocional + Safety Guardrails)
    log("Emocional", "Analizando prosodia y carga afectiva del audio...")
    analyzed_text = "Hola ECOS" if transcript == "PRESENCE_TRIGGER" else transcript
    emotional = analyze_affectivity(analyzed_text)

    log("Orquestador", "Verificando Reglas de Seguridad y Terapia de Validación...")
    validation_input = "" if transcript == "PRESENCE_TRIGGER" else transcript
    validation = apply_validation_therapy(validation_input, patient.name)

    # PASO 3: PLANIFICAR
    log("Planificación", "Formulando la mejor acción y estrategia conversacional...")
    plan = planning_agent.plan_next_action(db, patient, emotional, validation, is_night_or_dusk)

    mode = "CALM" if plan.action_type == "ACTIVATE_CALM_MODE" else "DAYTIME"

    # PASO 4: EJECUTAR
    log("Conversacional", f'Generando síntesis de voz adaptable: "{plan.response_text}"')

    if plan.action_type == "INJECT_FAMILY_VOICE_MEMO" and plan.memo:
        memory_agent.mark_voice_memo_as_read(db, plan.memo.id)

    # PASOS 5, 6 y 7: EVALUAR, APRENDER Y NUEVA OBSERVACIÓN
    log("Aprendizaje", "Evaluando métricas de satisfacción y actualizando modelo persistente...")
    learning_agent.evaluate_interaction(db, patient.id, plan.action_type, emotional)

    # Registrar el estado emocional detectado en el historial (equivalente a EmotionalAgent.processInteraction)
    from models import EmotionalLog

    db.add(EmotionalLog(
        patient_id=patient.id,
        status=emotional.detected_state,
        valence=emotional.valence,
        detail=f'Frase analizada: "{analyzed_text}"',
    ))
    db.commit()

    return {
        "actionType": plan.action_type,
        "reason": plan.reason,
        "responseText": plan.response_text,
        "mode": mode,
        "displayPhoto": _photo_to_dict(plan.display_photo),
        "memo": _memo_to_dict(plan.memo),
        "synthSettings": plan.synth_settings,
        "steps": steps,
    }
