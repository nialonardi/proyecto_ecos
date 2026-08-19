"""main.py - Punto de entrada de la API ECOS (FastAPI).

Reemplaza a server.py: además de servir la API real (auth JWT, orquestación agéntica
server-side, dashboard familiar), sirve el frontend estático para mantener el flujo de
un solo puerto que tenía el prototipo original.
"""
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

load_dotenv()

from routers import auth_router, dashboard_router, orchestrator_router, stats_router  # noqa: E402
from seed import seed_if_empty  # noqa: E402

BASE_DIR = Path(__file__).parent.parent  # raíz del repo (proyecto_ecos/)

app = FastAPI(title="ECOS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    seed_if_empty()


app.include_router(auth_router.router)
app.include_router(orchestrator_router.router)
app.include_router(dashboard_router.router)
app.include_router(stats_router.router)

# Servir el frontend estático (index.html, js/, css/, assets/) desde la raíz del repo.
for folder in ("js", "css", "assets"):
    folder_path = BASE_DIR / folder
    if folder_path.exists():
        app.mount(f"/{folder}", StaticFiles(directory=str(folder_path)), name=folder)


@app.get("/")
def serve_index():
    from fastapi.responses import FileResponse

    return FileResponse(str(BASE_DIR / "index.html"))


@app.get("/presentacion_final.html")
def serve_presentation():
    from fastapi.responses import FileResponse

    return FileResponse(str(BASE_DIR / "presentacion_final.html"))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8085, reload=True)
