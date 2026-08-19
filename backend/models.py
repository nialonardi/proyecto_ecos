"""models.py - Modelos ORM que reemplazan la memoria en localStorage del mockup original."""
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'family' | 'health' | 'admin'
    name = Column(String, nullable=False)


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    condition = Column(String, nullable=False)
    primary_caregiver = Column(String, nullable=False)
    emergency_contact = Column(String, nullable=False)

    preferences = relationship("Preference", back_populates="patient", uselist=False)
    photos = relationship("ReminiscencePhoto", back_populates="patient")
    routines = relationship("Routine", back_populates="patient")
    emotional_logs = relationship("EmotionalLog", back_populates="patient")
    voice_memos = relationship("VoiceMemo", back_populates="patient")
    stats = relationship("InteractionStat", back_populates="patient", uselist=False)


class Preference(Base):
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    music = Column(Text, nullable=False)  # JSON-encoded list
    favorite_places = Column(Text, nullable=False)
    hobbies = Column(Text, nullable=False)
    favorite_topics = Column(Text, nullable=False)

    patient = relationship("Patient", back_populates="preferences")


class ReminiscencePhoto(Base):
    __tablename__ = "reminiscence_photos"

    id = Column(String, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    url = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    suggested_question = Column(Text, nullable=False)
    is_calm_landscape = Column(Boolean, default=False)

    patient = relationship("Patient", back_populates="photos")


class Routine(Base):
    __tablename__ = "routines"

    id = Column(String, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    time = Column(String, nullable=False)
    title = Column(String, nullable=False)
    completed = Column(Boolean, default=False)

    patient = relationship("Patient", back_populates="routines")


class EmotionalLog(Base):
    __tablename__ = "emotional_logs"

    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, nullable=False)
    valence = Column(Float, nullable=False)
    detail = Column(Text, nullable=False)

    patient = relationship("Patient", back_populates="emotional_logs")


class VoiceMemo(Base):
    __tablename__ = "voice_memos"

    id = Column(String, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    sender = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    audio_url = Column(String, default="")
    played = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="voice_memos")


class InteractionStat(Base):
    __tablename__ = "interaction_stats"

    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    total_conversations = Column(Integer, default=0)
    successful_reminiscences = Column(Integer, default=0)
    calm_modes_activated = Column(Integer, default=0)
    average_satisfaction_score = Column(Float, default=0.0)

    patient = relationship("Patient", back_populates="stats")
