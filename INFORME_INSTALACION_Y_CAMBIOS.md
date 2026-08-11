# Informe Detallado de Entorno, Software, Auditoría de `npm` y Acciones del Usuario

**Proyecto**: ECOS (Ecosistema Cognitivo de Orquestación Solidaria) — UTN FRBA  
**Fecha de Auditoría**: Agosto 2026  
**Ubicación del Proyecto**: `/Users/nicolas/Cursos/proyecto_ecos`

---

## 1. Aclaración Explícita sobre Node.js y `npm`

### ¿Se instaló `npm`?
**NO. No se instaló `npm` ni Node.js.**

### Diagnóstico Técnico del Sistema:
Al iniciar el proyecto, se ejecutó la verificación de comandos en la terminal de macOS:
```bash
npm --version
# Resultado: zsh:1: command not found: npm
```
Se realizó una búsqueda en los directorios del sistema, confirmando que Node.js y `npm` no están instalados ni configurados en la variable `$PATH` de esta máquina.

### Decisión de Arquitectura:
Para evitar depender de instalaciones externas o permisos de administrador (`sudo`/`brew`), **se desarrolló ECOS en HTML5 Nativo + CSS3 Vanilla + Módulos JavaScript ES6 Puros + Web Speech API**.
- **Beneficio Directo**: El proyecto no requiere `npm install`, `node_modules` ni scripts de compilación, garantizando ejecución inmediata sin descargas pesadas de paquetes.

---

## 2. Software Utilizado para Ejecutar la Aplicación

Para levantar y probar la plataforma ECOS se utilizó únicamente el entorno nativo de tu sistema:

1. **Python 3.14**: Ubicado en `/Library/Frameworks/Python.framework/Versions/3.14/bin/python3`.
   - *Función*: Servidor web HTTP estático ejecutándose localmente en el puerto `8085` (o `8080`).
   - *Comando*: `python3 -m http.server 8085`
2. **Navegador Web**: (Google Chrome, Microsoft Edge, Safari o Firefox).

---

## 3. Acciones que Requieren Interacción del Usuario

A continuación se listan en detalle las acciones manuales y decisiones requeridas por tu parte:

### 3.1 Acciones Inmediatas para Probar ECOS:
1. **Abrir la Aplicación en tu Navegador**:
   - Ingresar a la URL: **`http://localhost:8085`** (o `http://localhost:8080`).
2. **Conceder Permisos de Micrófono**:
   - Al abrir la pestaña de la pantalla del adulto mayor o DevStudio, el navegador solicitará permiso de acceso al micrófono para el reconocimiento de voz en tiempo real (`SpeechRecognition`). Debes hacer clic en **"Permitir"**.

### 3.2 Acciones de Mantenimiento (Si se reinicia la máquina):
- Si cierras la consola o reinicias la Mac, para volver a levantar el servidor web solo debes abrir una terminal en la carpeta del proyecto y ejecutar:
  ```bash
  python3 -m http.server 8085
  ```

### 3.3 Instalación Opcional de `npm` (Si deseas migrar a React/Vite a futuro):
Si deseas en algún momento instalar `npm` en tu sistema Mac para futuros proyectos con paquetes Node.js, debes seguir uno de estos pasos:
- **Opción A (Instalador Oficial)**: Descargar e instalar el paquete `.pkg` desde [nodejs.org](https://nodejs.org/).
- **Opción B (Gestor Homebrew)**: Ejecutar en tu terminal `brew install node`.

---

## 4. Archivos Creados y Ajustes de Rutas

### 4.1 Configuración de Reglas del Orquestador
- **`.agents/AGENTS.md`**: Directivas de operación del Orquestador Antigravity (co-working, consulta al Tribunal MCP Hub en Rust y feedback riguroso).

### 4.2 Activos Gráficos Generados por IA
- **`assets/family_reminiscence_beach.jpg`**: Fotografía nostálgica de playa (Mar del Plata 1978).
- **`assets/calm_nature_landscape.jpg`**: Paisaje biofílico para el Modo Calma.

### 4.3 Sistema de Diseño y Estilos
- **`css/colors.css`**: Tokens de colores gerontológicos (Azul Teal Clínico `#1A5F7A`, Blanco Hueso `#F9F8F6`, Gris Neblina `#E8E8E8`, Verde Oliva Atenuado `#4A5D4E`, Ámbar `#E5BA73`).
- **`css/style.css`**: Estilos Zero-UI, reloj analógico, apoyo de texto a gran escala, respiración pulsante, Dashboard PWA y consola DevStudio.

### 4.4 Red Multiagente y Motor Lógico (`js/engine/`)
- **`js/engine/MemoryStore.js`**: Persistencia local (perfil de Marta, historial emocional, rutinas, notas de voz).
- **`js/engine/SafetyRules.js`**: Terapia de Validación sin confrontación y reglas éticas.
- **`js/engine/EmotionalAnalyzer.js`**: Analizador prosódico y de carga afectiva.
- **`js/engine/Orchestrator.js`**: Coordinador central del ciclo agéntico de 7 pasos (con corrección de importación relativa `./MemoryStore.js`).
- **`js/engine/agents/`**:
  - `CaptureAgent.js` (Entrada STT y mirada de presencia).
  - `EmotionalAgent.js` (Afectividad).
  - `MemoryAgent.js` (Recuerdos).
  - `PlanningAgent.js` (Planes de acción).
  - `ConversationalAgent.js` (Síntesis TTS).
  - `LearningAgent.js` (Métricas de satisfacción).

### 4.5 Componentes de Interfaz (`js/components/` & Raíz)
- **`js/components/SeniorUI.js`**: Pantallas Zero-UI.
- **`js/components/DashboardUI.js`**: Panel PWA para cuidadores.
- **`js/components/DevStudioUI.js`**: Monitor en tiempo real de agentes.
- **`js/app.js`**: Controlador de navegación.
- **`index.html`**: Estructura accesibilidad HTML5.

---

## 5. Resumen de Permisos y Accesos Solicitados

- **Archivos Locales**: Creación y edición dentro de `/Users/nicolas/Cursos/proyecto_ecos`.
- **Puerto de Red Local**: Escucha en el puerto `8085` de `localhost`.
- **Acceso a Hardware**: Permiso de micrófono en el navegador (otorgado manualmente por el usuario).
