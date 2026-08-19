"""schemas.py - Esquemas Pydantic para requests/responses de la API."""
from typing import List, Optional

from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    role: Optional[str] = None
    name: Optional[str] = None
    message: Optional[str] = None


class PatientOut(BaseModel):
    name: str
    lastName: str
    age: int
    condition: str
    primaryCaregiver: str
    emergencyContact: str


class RoutineOut(BaseModel):
    id: str
    time: str
    title: str
    completed: bool


class EmotionalLogOut(BaseModel):
    timestamp: str
    status: str
    valence: float
    detail: str


class VoiceMemoOut(BaseModel):
    id: str
    sender: str
    text: str
    audioUrl: str
    played: bool
    timestamp: str


class VoiceMemoCreate(BaseModel):
    sender: str
    text: str
    audioUrl: str = ""


class StatsOut(BaseModel):
    totalConversations: int
    successfulReminiscences: int
    calmModesActivated: int
    averageSatisfactionScore: float


class InteractRequest(BaseModel):
    transcript: str  # texto reconocido, o el literal "PRESENCE_TRIGGER"
    hour: Optional[int] = None  # hora local del cliente (para evaluar circadiano); opcional


class AgentLogEntry(BaseModel):
    agent: str
    message: str
    level: str = "info"
    timestamp: str


class PhotoOut(BaseModel):
    id: str
    url: str
    title: str
    description: str
    suggestedQuestion: str


class InteractResponse(BaseModel):
    actionType: str
    reason: str
    responseText: str
    mode: str  # 'DAYTIME' | 'CALM'
    displayPhoto: Optional[PhotoOut] = None
    memo: Optional[VoiceMemoOut] = None
    synthSettings: dict
    steps: List[AgentLogEntry]
