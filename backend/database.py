"""database.py - Configuración del motor SQLAlchemy y sesión de base de datos.

Por defecto usa SQLite en memoria (sin tocar disco), porque el hosting de pruebas
no permite escritura a disco. Se usa una única conexión compartida (StaticPool)
para que los datos sobrevivan entre requests dentro del mismo proceso — con SQLite
en memoria, cada conexión nueva ve una base vacía si no se fija el pool.

Si se define ECOS_DB_URL (por ejemplo para desarrollo local con persistencia real
entre reinicios), se usa esa URL en su lugar con un engine estándar.
"""
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.environ.get("ECOS_DB_URL", "sqlite:///:memory:")

if DATABASE_URL.startswith("sqlite://") and ":memory:" in DATABASE_URL:
    # Conexión única y persistente durante la vida del proceso: evita que cada
    # nueva conexión SQLite en memoria arranque con una base vacía distinta.
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite://") else {}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
