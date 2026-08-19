# Proyecto ECOS (Ecosistema Cognitivo de Orquestación Solidaria)

> **Trabajo de Fin de Ciclo — Entrega Final (UTN FRBA 2026)**  
> **Asignatura**: Inteligencia Artificial Aplicada a Organizaciones  
> **Integrantes**: Nicolás Ialonardi, Brisa Perez Eceiza, Emmanuel Posadas  

---

## 📌 Descripción General

**ECOS** es una plataforma inteligente de acompañamiento proactivo para adultos mayores con deterioro cognitivo leve, Alzheimer inicial o aislamiento social. Incorpora **orquestación agéntica en tiempo real, memoria persistente, terapia de validación cognitiva y un diseño Zero-UI circadiano.**

---

## 🎨 Características Principales

1. **Interfaz Zero-UI para el Adulto Mayor**:
   - **Pantalla A (Reposo Activo)**: Reloj analógico minimalista en Gris Neblina (`#E8E8E8`) con sensor de presencia por mirada (>3s).
   - **Pantalla B (Interacción Diurna)**: Azul Teal Clínico (`#1A5F7A`), fotografías de reminiscencia biográfica y texto a gran escala en Blanco Hueso (`#F9F8F6`) >36pt.
   - **Pantalla C (Modo Calma / Crisis)**: Verde Oliva Atenuado (`#4A5D4E`) y Ámbar Cálido (`#E5BA73`), paisajes biofílicos y Terapia de Validación con voz pausada.
2. **Red de 7 Agentes Inteligentes (orquestados server-side)**:
   - `Captura`, `Conversacional`, `Emocional`, `Planificación`, `Memoria`, `Aprendizaje` y `Orquestador Central`.
3. **Dashboard Familiar PWA (Cuidadores)**:
   - Visualización de biomarcadores emocionales de 24hs, control de rutinas médicas e inyección de notas de voz afectivas.
4. **DevStudio**:
   - Consola del Orquestador para monitoreo de la red agéntica y simulación de crisis.

---

## 🛠️ Stack Tecnológico

- **Frontend**: HTML5 Nativo + CSS3 Vanilla + JavaScript ES6 Módulos (cliente delgado, sin lógica de negocio)
- **Backend**: FastAPI (Python) — orquesta server-side el ciclo de 7 pasos y expone la API REST
- **Base de Datos**: SQLite vía SQLAlchemy (reemplaza el `MemoryStore` de `localStorage` del prototipo)
- **Autenticación**: JWT firmado (RBAC por rol: `family`, `health`, `admin`)
- **Voz / Síntesis**: Web Speech API (`SpeechRecognition` / `SpeechSynthesis`) en el navegador
- **Agente Conversacional**: Claude (Anthropic) cuando hay `ANTHROPIC_API_KEY` configurada; si no, respuestas deterministas de respaldo. Los guardrails de seguridad (Terapia de Validación, restricción médica) son siempre deterministas y tienen prioridad sobre el LLM.

---

## 🚀 Cómo Ejecutar Localmente

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/nicolas-ialonardi/proyecto_ecos.git
   cd proyecto_ecos
   ```
2. Instalar las dependencias del backend (recomendado usar un entorno virtual):
   ```bash
   cd backend
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   ```
3. (Opcional) Copiar `.env.example` a `.env` y configurar `ANTHROPIC_API_KEY` si se quiere
   generación de conversación vía LLM real. Sin la key, el sistema funciona igual con
   respuestas deterministas.
4. Levantar el servidor (sirve la API y el frontend en el mismo puerto):
   ```bash
   uvicorn main:app --reload --port 8085
   ```
5. Abrir en el navegador:
   **`http://localhost:8085`**

Usuarios de prueba (RBAC): `familia/123`, `doctor/123`, `admin/admin`.

---

## 📑 Documentación Académica Obligatoria (UTN FRBA)

- 📄 [Documento Completo de Entrega Final (PDF / MD)](./DOCUMENTO_ENTREGA_FINAL_UTN.md)
- 📄 [Informe Técnico de Entorno y Cambios](./INFORME_INSTALACION_Y_CAMBIOS.md)
- 📄 [Reglas del Orquestador (.agents/AGENTS.md)](./.agents/AGENTS.md)
