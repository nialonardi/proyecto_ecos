"""learning_agent.py - Port de LearningAgent.js. Actualiza las métricas agregadas tras cada interacción."""
from sqlalchemy.orm import Session

from agents.emotional_analyzer import EmotionalAnalysis
from models import InteractionStat


def evaluate_interaction(db: Session, patient_id: int, action_type: str, emotional: EmotionalAnalysis) -> InteractionStat:
    stats = db.query(InteractionStat).filter(InteractionStat.patient_id == patient_id).first()
    if stats is None:
        stats = InteractionStat(patient_id=patient_id)
        db.add(stats)

    stats.total_conversations += 1

    if emotional.valence >= 0.7:
        stats.successful_reminiscences += 1

    if action_type == "ACTIVATE_CALM_MODE":
        stats.calm_modes_activated += 1

    stats.average_satisfaction_score = min(
        0.99,
        round(stats.successful_reminiscences / stats.total_conversations, 2),
    )

    db.commit()
    db.refresh(stats)
    return stats
