"""planning_agent.py - Port de PlanningAgent.js.

Decide la mejor acción según contexto, estado emocional y guardrails de seguridad.
El texto de respuesta para el caso "normal" (Estimulación Reminiscente Diurna) se
delega al Agente Conversacional (que puede usar LLM); los casos de seguridad y de
mensaje familiar mantienen su texto determinista, igual que en el mockup original.
"""
from dataclasses import dataclass, field
from typing import Optional

from sqlalchemy.orm import Session

from agents import conversational_agent, memory_agent
from agents.emotional_analyzer import EmotionalAnalysis
from agents.safety_rules import ValidationResult
from models import Patient, ReminiscencePhoto, VoiceMemo


@dataclass
class Plan:
    action_type: str
    reason: str
    response_text: str
    synth_settings: dict
    display_photo: Optional[ReminiscencePhoto] = None
    memo: Optional[VoiceMemo] = None


def plan_next_action(
    db: Session,
    patient: Patient,
    emotional: EmotionalAnalysis,
    validation: ValidationResult,
    is_night_or_dusk: bool,
) -> Plan:
    # 1. Prioridad absoluta: Seguridad y Mitigación de Crisis / Terapia de Validación.
    # Guardrail determinista: si dispara, NO se llama al LLM para este turno.
    if validation.trigger_calm_mode or emotional.is_agitated_or_disoriented or is_night_or_dusk:
        landscape = memory_agent.fetch_calm_mode_landscape(db, patient.id)
        reason = (
            "Terapia de Validación por desorientación"
            if validation.requires_validation
            else "Ajuste circadiano vespertino"
        )
        response_text = validation.validation_text or (
            f"{patient.name}, estás en tu hogar sereno. Todo está tranquilo y en orden."
        )
        return Plan(
            action_type="ACTIVATE_CALM_MODE",
            reason=reason,
            display_photo=landscape,
            response_text=response_text,
            synth_settings={"pitch": 0.8, "rate": 0.75},
        )

    # 1b. Guardrail médico: tampoco llama al LLM, respuesta fija de redirección.
    if validation.medical_guardrail_triggered:
        return Plan(
            action_type="MEDICAL_GUARDRAIL",
            reason="Restricción de negocio: no diagnósticos ni cambios de tratamiento",
            response_text=validation.validation_text,
            synth_settings={"pitch": 1.0, "rate": 0.9},
        )

    # 2. Mensaje afectivo de voz pendiente enviado por la familia.
    pending_memo = memory_agent.check_for_pending_voice_memo(db, patient.id)
    if pending_memo:
        return Plan(
            action_type="INJECT_FAMILY_VOICE_MEMO",
            reason="Inyección oportuna de mensaje afectivo familiar",
            memo=pending_memo,
            response_text=f'{patient.name}, tenés un mensaje cariñoso de {pending_memo.sender}: "{pending_memo.text}"',
            synth_settings={"pitch": 1.0, "rate": 0.9},
        )

    # 3. Estimulación Reminiscente Diurna Estándar (acá sí puede intervenir el LLM).
    photo = memory_agent.fetch_relevant_reminiscence_photo(db, patient.id)
    fallback_text = f"{patient.name}, mirá qué hermosa foto de Mar del Plata. ¿Te acordás quién viajó con vos ese verano?"
    context_summary = (
        f"Se le va a mostrar la foto '{photo.title}' ({photo.description}). "
        f"Pregunta sugerida original: {photo.suggested_question}"
        if photo
        else "No hay foto de reminiscencia disponible en este momento."
    )
    response_text = conversational_agent.generate_response(
        patient_name=patient.name,
        context_summary=context_summary,
        action_type="DIURNAL_REMINISCENCE",
        fallback_text=fallback_text,
    )

    return Plan(
        action_type="DIURNAL_REMINISCENCE",
        reason="Estimulación cognitiva mediante memoria fotográfica",
        display_photo=photo,
        response_text=response_text,
        synth_settings={"pitch": 1.0, "rate": 0.95},
    )
