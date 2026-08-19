"""auth_router.py - Login real contra la base de datos, con JWT firmado."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import create_access_token, verify_password
from database import get_db
from models import User
from schemas import LoginRequest, LoginResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    username = payload.username.strip().lower()
    user = db.query(User).filter(User.username == username).first()

    if user is None or not verify_password(payload.password, user.hashed_password):
        return LoginResponse(success=False, message="Credenciales inválidas")

    token = create_access_token(username=user.username, role=user.role, name=user.name)
    return LoginResponse(success=True, token=token, role=user.role, name=user.name)
