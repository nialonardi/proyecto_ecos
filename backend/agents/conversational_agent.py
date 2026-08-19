"""conversational_agent.py - Agente Conversacional.

Genera el texto de respuesta para las interacciones "normales" (sin disparadores de
seguridad). Si hay ANTHROPIC_API_KEY configurada, usa Claude con un system prompt que
refuerza las reglas de negocio del PDF (sección 8: terapia de validación, transparencia,
no diagnósticos, personalización obligatoria). Si no hay key, cae a una plantilla
determinista equivalente a la del PlanningAgent.js original, para que el proyecto sea
demostrable sin credenciales.
"""
import os
from typing import Optional

_anthropic_client = None
_anthropic_unavailable = False


def _get_client():
    global _anthropic_client, _anthropic_unavailable
    if _anthropic_unavailable:
        return None
    if _anthropic_client is not None:
        return _anthropic_client

    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        _anthropic_unavailable = True
        return None

    try:
        import anthropic

        _anthropic_client = anthropic.Anthropic(api_key=api_key)
        return _anthropic_client
    except Exception:
        _anthropic_unavailable = True
        return None


SYSTEM_PROMPT = """Sos ECOS, un asistente de acompañamiento por voz para adultos mayores con deterioro cognitivo leve.
Reglas obligatorias (no negociables):
- Identificate siempre como un sistema inteligente. Nunca hagas creer al usuario que hablás como una persona real.
- No emitas diagnósticos médicos, no sugieras cambios de tratamiento ni de medicación.
- Nunca confrontes directamente un recuerdo erróneo o una idea de desorientación: usá redirección amable hacia temas positivos.
- Las respuestas deben ser breves (1-2 oraciones), cálidas, en tono natural y adaptadas a nivel cognitivo simple.
- Personalizá siempre usando la información del paciente que se te da en el contexto (nombre, preferencias, fotos, rutinas).
- No emitas respuestas genéricas si hay información personalizada disponible en el contexto."""


def generate_response(
    patient_name: str,
    context_summary: str,
    action_type: str,
    fallback_text: str,
) -> str:
    """Devuelve el texto de respuesta conversacional. Usa el LLM si está disponible."""
    client = _get_client()
    if client is None:
        return fallback_text

    model = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-5")
    try:
        message = client.messages.create(
            model=model,
            max_tokens=200,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"Paciente: {patient_name}.\n"
                        f"Contexto de la interacción actual: {context_summary}\n"
                        f"Tipo de acción decidida por el planificador: {action_type}\n"
                        "Generá el texto que ECOS debería decirle al paciente ahora, "
                        "siguiendo las reglas del system prompt."
                    ),
                }
            ],
        )
        text_blocks = [block.text for block in message.content if getattr(block, "type", None) == "text"]
        generated = " ".join(text_blocks).strip()
        return generated or fallback_text
    except Exception:
        # Ante cualquier falla de red/API, no romper la interacción: usar fallback determinista.
        return fallback_text
