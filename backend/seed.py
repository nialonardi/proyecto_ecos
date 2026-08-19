"""seed.py - Siembra la base de datos con los mismos datos mock del prototipo original
(paciente Marta Ialonardi) para no perder el demo al migrar de localStorage a SQLite."""
import json
from datetime import datetime

from auth import hash_password
from database import Base, SessionLocal, engine
from models import (
    EmotionalLog,
    InteractionStat,
    Patient,
    Preference,
    ReminiscencePhoto,
    Routine,
    User,
    VoiceMemo,
)

USERS_SEED = [
    {"username": "familia", "password": "123", "role": "family", "name": "Familia Ialonardi"},
    {"username": "doctor", "password": "123", "role": "health", "name": "Dr. Pérez"},
    {"username": "admin", "password": "admin", "role": "admin", "name": "DevStudio Admin"},
]


def seed_if_empty():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return  # ya sembrado

        for u in USERS_SEED:
            db.add(User(
                username=u["username"],
                hashed_password=hash_password(u["password"]),
                role=u["role"],
                name=u["name"],
            ))

        patient = Patient(
            name="Marta",
            last_name="Ialonardi",
            age=81,
            condition="Deterioro Cognitivo Leve - Síndrome del Ocaso ocasional",
            primary_caregiver="Nicolás (Hijo)",
            emergency_contact="+54 9 11 5555-4321",
        )
        db.add(patient)
        db.flush()  # asigna patient.id

        db.add(Preference(
            patient_id=patient.id,
            music=json.dumps(["Tango clásico", "Carlos Gardel", "Mercedes Sosa"]),
            favorite_places=json.dumps(["Mar del Plata", "Bariloche", "Jardín Botánico"]),
            hobbies=json.dumps(["Jardinería", "Escuchar música de radio", "Mirar fotos antiguas"]),
            favorite_topics=json.dumps(["Las vacaciones de 1978", "Sus nietos", "Recetas de cocina tradicional"]),
        ))

        db.add(ReminiscencePhoto(
            id="photo_beach_1978",
            patient_id=patient.id,
            url="assets/family_reminiscence_beach.jpg",
            title="Mar del Plata, 1978",
            description="Playa popular con la familia, el mar radiante y risas compartidas.",
            suggested_question="¿Te acordás quién viajó con vos ese verano a Mar del Plata?",
            is_calm_landscape=False,
        ))
        db.add(ReminiscencePhoto(
            id="photo_nature_calm",
            patient_id=patient.id,
            url="assets/calm_nature_landscape.jpg",
            title="Paisaje Natural Biofílico",
            description="Lago sereno al atardecer para momentos de calma neurológica.",
            suggested_question="El agua tranquila me trae mucha paz. ¿A vos te gusta escuchar el sonido de la naturaleza?",
            is_calm_landscape=True,
        ))

        routines_seed = [
            ("m1", "08:30", "Medicación de la mañana (Antihipertensivo)", True),
            ("m2", "13:00", "Almuerzo y paseo por el patio", True),
            ("m3", "17:30", "Té con galletitas y estimulación musical", False),
            ("m4", "20:30", "Cena y medicación vespertina", False),
        ]
        for rid, time, title, completed in routines_seed:
            db.add(Routine(id=rid, patient_id=patient.id, time=time, title=title, completed=completed))

        db.add(EmotionalLog(
            patient_id=patient.id, timestamp=datetime.utcnow(), status="Estable / Alegre",
            valence=0.85, detail="Recordó con alegría las vacaciones de 1978.",
        ))
        db.add(EmotionalLog(
            patient_id=patient.id, timestamp=datetime.utcnow(), status="Tranquilo",
            valence=0.78, detail="Escuchó un tango de Carlos Gardel.",
        ))

        db.add(VoiceMemo(
            id="memo_nico_1",
            patient_id=patient.id,
            sender="Nicolás (Hijo)",
            text="¡Hola mamá! Te mando un abrazo grande, pasé a dejarte las flores esta mañana.",
            audio_url="",
            played=False,
        ))

        db.add(InteractionStat(
            patient_id=patient.id,
            total_conversations=42,
            successful_reminiscences=38,
            calm_modes_activated=4,
            average_satisfaction_score=0.92,
        ))

        db.commit()
        print("✅ Base de datos sembrada con datos iniciales de Marta Ialonardi.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_if_empty()
