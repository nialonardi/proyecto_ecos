"""safety_rules.py - Port 1:1 de SafetyRules.js.

Reglas de negocio, ética y Terapia de Validación. Estas reglas son deterministas y
SIEMPRE tienen prioridad sobre el LLM: si detectan desorientación/crisis o un tema
médico, el orquestador usa la respuesta fija de acá y no llama al modelo de lenguaje
para ese turno (ver PROYECTO-ECOS-1.pdf, sección 8 "Reglas de Negocio").
"""
import re
from dataclasses import dataclass
from typing import Optional

DISORIENTATION_PATTERNS = [
    {
        "trigger": re.compile(r"dónde está mi mam[áa]|dond[ee] esta mi mam[áa]|quiero a mi mam[áa]", re.IGNORECASE),
        "validation_response": "{name}, estás segura acá y acompañada. Tu mamá te quería con el alma. ¿Me contás qué les gustaba preparar o cocinar juntas?",
        "redirect_topic": "Recuerdos de cocina con su madre",
    },
    {
        "trigger": re.compile(r"dónde estoy|donde estoy|qu[eé] hago ac[áa]|esta no es mi casa", re.IGNORECASE),
        "validation_response": "{name}, estás en tu hogar cálido y tranquilo. Nicolás dejó todo listo para que estés cómoda. ¿Te gustaría escuchar un lindo tango?",
        "redirect_topic": "Música clásica y tranquilidad del hogar",
    },
    {
        "trigger": re.compile(r"tengo que ir a trabajar|se me hace tarde para la escuela|tengo que buscar a los chicos", re.IGNORECASE),
        "validation_response": "Hoy es un día de descanso bien merecido, {name}. Cumpliste con todo el trabajo. Ahora podemos relajarnos un rato.",
        "redirect_topic": "Descanso y relajación",
    },
]

MEDICAL_KEYWORDS = [
    re.compile(r"diagn[óo]stico", re.IGNORECASE),
    re.compile(r"enfermedad", re.IGNORECASE),
    re.compile(r"cu[áa]l es mi remedio", re.IGNORECASE),
    re.compile(r"cambiar dosis", re.IGNORECASE),
]


@dataclass
class ValidationResult:
    requires_validation: bool = False
    validation_text: Optional[str] = None
    redirect_topic: Optional[str] = None
    trigger_calm_mode: bool = False
    medical_guardrail_triggered: bool = False


def apply_validation_therapy(user_input: str, patient_name: str) -> ValidationResult:
    input_lower = user_input.lower()

    for pattern in DISORIENTATION_PATTERNS:
        if pattern["trigger"].search(input_lower):
            return ValidationResult(
                requires_validation=True,
                validation_text=pattern["validation_response"].format(name=patient_name),
                redirect_topic=pattern["redirect_topic"],
                trigger_calm_mode=True,
            )

    for med_key in MEDICAL_KEYWORDS:
        if med_key.search(input_lower):
            return ValidationResult(
                requires_validation=False,
                medical_guardrail_triggered=True,
                validation_text=(
                    "Para cuestiones médicas o de remedios, Nicolás y tu médico de confianza "
                    "están al tanto de todo tu plan. Yo te acompaño para que disfrutes tu día."
                ),
                trigger_calm_mode=False,
            )

    return ValidationResult()


def is_dusk_circadian(hour: int) -> bool:
    return hour >= 17 or hour < 8
