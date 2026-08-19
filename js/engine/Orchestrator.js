/**
 * Orchestrator.js - Cliente del Orquestador Agéntico Central de ECOS.
 * Ya no ejecuta la lógica de los agentes en el navegador: delega el ciclo completo
 * (Observar -> Analizar -> Planificar -> Ejecutar -> Evaluar -> Aprender) al backend
 * vía ApiClient, y solo se encarga de capturar voz/presencia y reproducir la respuesta.
 */
import { ApiClient } from './ApiClient.js';
import { CaptureAgent } from './agents/CaptureAgent.js';
import { ConversationalAgent } from './agents/ConversationalAgent.js';

export class Orchestrator {
  constructor(uiCallbacks = {}) {
    this.uiCallbacks = uiCallbacks;
    this.api = new ApiClient();

    this.conversationalAgent = new ConversationalAgent();

    // Estado global de la orquestación
    this.currentMode = 'STANDBY'; // 'STANDBY' | 'DAYTIME' | 'CALM'
    this.activeWorkingAgent = null;

    // Captura de voz y sensores (sigue siendo responsabilidad del navegador)
    this.captureAgent = new CaptureAgent(
      (transcript) => this.handleVoiceInput(transcript),
      () => this.handlePresenceDetected()
    );
  }

  logAgentActivity(agentName, message, level = 'info') {
    this.activeWorkingAgent = agentName;
    if (this.uiCallbacks.onAgentActivity) {
      this.uiCallbacks.onAgentActivity({
        agent: agentName,
        message,
        level,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  }

  replayStepsFromBackend(steps = []) {
    steps.forEach(step => this.logAgentActivity(step.agent, step.message, step.level));
  }

  async handlePresenceDetected() {
    this.logAgentActivity('Captura', 'Sensor de presencia activado (>3s mirada sostenida).');
    try {
      const plan = await this.api.presence();
      this.applyPlan(plan);
    } catch (err) {
      this.logAgentActivity('Orquestador', `Error al consultar el backend: ${err.message}`, 'warn');
    }
  }

  async handleVoiceInput(transcript) {
    this.logAgentActivity('Captura', `Audio recibido del usuario: "${transcript}"`);
    await this.runOrchestrationCycle(transcript);
  }

  // Corre el ciclo completo de orquestación agéntica (server-side) y renderiza el resultado.
  async runOrchestrationCycle(input, hourOverride = undefined) {
    try {
      const plan = hourOverride === undefined
        ? await this.api.interact(input)
        : await this.api.interact(input, hourOverride);
      this.applyPlan(plan);
    } catch (err) {
      this.logAgentActivity('Orquestador', `Error al consultar el backend: ${err.message}`, 'warn');
    }
  }

  applyPlan(plan) {
    // Reproducir en el DevStudio el log real de pasos que ejecutó el backend.
    this.replayStepsFromBackend(plan.steps);

    this.setMode(plan.mode === 'CALM' ? 'CALM' : 'DAYTIME');

    if (this.uiCallbacks.onRenderInteractiveScreen) {
      this.uiCallbacks.onRenderInteractiveScreen(plan);
    }

    this.conversationalAgent.speak(plan.responseText, plan.synthSettings);

    if (this.uiCallbacks.onStateUpdated) {
      this.uiCallbacks.onStateUpdated();
    }
  }

  setMode(mode) {
    this.currentMode = mode;
    if (this.uiCallbacks.onModeChanged) {
      this.uiCallbacks.onModeChanged(mode);
    }
  }

  startPresenceSimulation() {
    this.captureAgent.simulatePresenceGaze(3);
  }
}
