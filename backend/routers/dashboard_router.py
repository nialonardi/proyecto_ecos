"""dashboard_router.py - Endpoints que alimentan el Dashboard Familiar (PWA)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import CurrentUser, require_role
from database import get_db
from models import EmotionalLog, Patient, Routine, VoiceMemo
from schemas import (
    EmotionalLogOut,
    PatientOut,
    RoutineOut,
    VoiceMemoCreate,
    VoiceMemoOut,
)

router = APIRouter(prefix="/api", tags=["dashboard"])

DASHBOARD_ROLES = ("family", "health", "admin")


def _get_patient(db: Session) -> Patient:
    patient = db.query(Patient).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return patient


@router.get("/patient", response_model=PatientOut)
def get_patient(db: Session = Depends(get_db), _: CurrentUser = Depends(require_role(*DASHBOARD_ROLES))):
    patient = _get_patient(db)
    return PatientOut(
        name=patient.name,
        lastName=patient.last_name,
        age=patient.age,
        condition=patient.condition,
        primaryCaregiver=patient.primary_caregiver,
        emergencyContact=patient.emergency_contact,
    )


@router.get("/routines", response_model=list[RoutineOut])
def get_routines(db: Session = Depends(get_db), _: CurrentUser = Depends(require_role(*DASHBOARD_ROLES))):
    patient = _get_patient(db)
    routines = db.query(Routine).filter(Routine.patient_id == patient.id).all()
    return [RoutineOut(id=r.id, time=r.time, title=r.title, completed=r.completed) for r in routines]


@router.patch("/routines/{routine_id}", response_model=RoutineOut)
def complete_routine(
    routine_id: str,
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_role("health", "admin")),
):
    routine = db.query(Routine).filter(Routine.id == routine_id).first()
    if routine is None:
        raise HTTPException(status_code=404, detail="Rutina no encontrada")
    routine.completed = True
    db.commit()
    db.refresh(routine)
    return RoutineOut(id=routine.id, time=routine.time, title=routine.title, completed=routine.completed)


@router.get("/emotional-history", response_model=list[EmotionalLogOut])
def get_emotional_history(db: Session = Depends(get_db), _: CurrentUser = Depends(require_role(*DASHBOARD_ROLES))):
    patient = _get_patient(db)
    logs = (
        db.query(EmotionalLog)
        .filter(EmotionalLog.patient_id == patient.id)
        .order_by(EmotionalLog.timestamp.desc())
        .limit(20)
        .all()
    )
    return [
        EmotionalLogOut(
            timestamp=log.timestamp.strftime("%H:%M"),
            status=log.status,
            valence=log.valence,
            detail=log.detail,
        )
        for log in logs
    ]


@router.get("/voice-memos", response_model=list[VoiceMemoOut])
def get_voice_memos(db: Session = Depends(get_db), _: CurrentUser = Depends(require_role(*DASHBOARD_ROLES))):
    patient = _get_patient(db)
    memos = (
        db.query(VoiceMemo)
        .filter(VoiceMemo.patient_id == patient.id)
        .order_by(VoiceMemo.timestamp.desc())
        .all()
    )
    return [
        VoiceMemoOut(
            id=m.id,
            sender=m.sender,
            text=m.text,
            audioUrl=m.audio_url,
            played=m.played,
            timestamp=m.timestamp.strftime("%I:%M %p"),
        )
        for m in memos
    ]


@router.post("/voice-memos", response_model=VoiceMemoOut)
def create_voice_memo(
    payload: VoiceMemoCreate,
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_role("family", "admin")),
):
    import uuid
    from datetime import datetime

    patient = _get_patient(db)
    memo = VoiceMemo(
        id=f"memo_{uuid.uuid4().hex[:10]}",
        patient_id=patient.id,
        sender=payload.sender,
        text=payload.text,
        audio_url=payload.audioUrl,
        played=False,
        timestamp=datetime.utcnow(),
    )
    db.add(memo)
    db.commit()
    db.refresh(memo)
    return VoiceMemoOut(
        id=memo.id,
        sender=memo.sender,
        text=memo.text,
        audioUrl=memo.audio_url,
        played=memo.played,
        timestamp=memo.timestamp.strftime("%I:%M %p"),
    )
