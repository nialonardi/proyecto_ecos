"""stats_router.py - Estadísticas agregadas para DevStudioUI."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import CurrentUser, require_role
from database import get_db
from models import InteractionStat, Patient
from schemas import StatsOut

router = APIRouter(prefix="/api", tags=["stats"])


@router.get("/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db), _: CurrentUser = Depends(require_role("admin", "family", "health"))):
    patient = db.query(Patient).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    stats = db.query(InteractionStat).filter(InteractionStat.patient_id == patient.id).first()
    if stats is None:
        return StatsOut(
            totalConversations=0,
            successfulReminiscences=0,
            calmModesActivated=0,
            averageSatisfactionScore=0.0,
        )

    return StatsOut(
        totalConversations=stats.total_conversations,
        successfulReminiscences=stats.successful_reminiscences,
        calmModesActivated=stats.calm_modes_activated,
        averageSatisfactionScore=stats.average_satisfaction_score,
    )
