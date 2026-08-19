"""memory_agent.py - Interfaz de consulta/escritura sobre la memoria persistente (SQLite)."""
from typing import Optional

from sqlalchemy.orm import Session

from models import Patient, ReminiscencePhoto, VoiceMemo


def get_patient(db: Session) -> Patient:
    patient = db.query(Patient).first()
    if patient is None:
        raise RuntimeError("No hay paciente sembrado en la base de datos. Ejecutar seed.py.")
    return patient


def fetch_relevant_reminiscence_photo(db: Session, patient_id: int) -> Optional[ReminiscencePhoto]:
    return (
        db.query(ReminiscencePhoto)
        .filter(ReminiscencePhoto.patient_id == patient_id, ReminiscencePhoto.is_calm_landscape.is_(False))
        .first()
    )


def fetch_calm_mode_landscape(db: Session, patient_id: int) -> Optional[ReminiscencePhoto]:
    calm_photo = (
        db.query(ReminiscencePhoto)
        .filter(ReminiscencePhoto.patient_id == patient_id, ReminiscencePhoto.is_calm_landscape.is_(True))
        .first()
    )
    if calm_photo:
        return calm_photo
    return db.query(ReminiscencePhoto).filter(ReminiscencePhoto.patient_id == patient_id).first()


def check_for_pending_voice_memo(db: Session, patient_id: int) -> Optional[VoiceMemo]:
    return (
        db.query(VoiceMemo)
        .filter(VoiceMemo.patient_id == patient_id, VoiceMemo.played.is_(False))
        .order_by(VoiceMemo.timestamp.asc())
        .first()
    )


def mark_voice_memo_as_read(db: Session, memo_id: str) -> None:
    memo = db.query(VoiceMemo).filter(VoiceMemo.id == memo_id).first()
    if memo:
        memo.played = True
        db.commit()
