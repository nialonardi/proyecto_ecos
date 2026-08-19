"""orchestrator_router.py - Expone el ciclo de orquestación agéntica como API HTTP.

Sin autenticación, igual que la tablet del adulto mayor en el mockup original (la
interfaz Zero-UI no tiene login: el paciente no debería necesitar credenciales).
"""
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from agents.orchestrator import run_orchestration_cycle
from database import get_db
from schemas import InteractRequest, InteractResponse

router = APIRouter(prefix="/api/orchestrator", tags=["orchestrator"])


@router.post("/interact", response_model=InteractResponse)
def interact(payload: InteractRequest, db: Session = Depends(get_db)):
    result = run_orchestration_cycle(db, payload.transcript, payload.hour)
    return result


@router.post("/presence", response_model=InteractResponse)
def presence(hour: Optional[int] = None, db: Session = Depends(get_db)):
    result = run_orchestration_cycle(db, "PRESENCE_TRIGGER", hour)
    return result
