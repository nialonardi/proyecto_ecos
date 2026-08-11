/**
 * Orchestrator.js - Orquestador Central del Ecosistema ECOS
 * Dirige el ciclo de 7 pasos: Observar -> Analizar -> Planificar -> Ejecutar -> Evaluar -> Aprender -> Nueva Observación.
 */
import { MemoryStore } from './MemoryStore.js';
import { SafetyRules } from './SafetyRules.js';
import { CaptureAgent } from './agents/CaptureAgent.js';
import { EmotionalAgent } from './agents/EmotionalAgent.js';
import { MemoryAgent } from './agents/MemoryAgent.js';
import { PlanningAgent } from './agents/PlanningAgent.js';
import { ConversationalAgent } from './agents/ConversationalAgent.js';
import { LearningAgent } from './agents/LearningAgent.js';

export class Orchestrator {
  constructor(uiCallbacks = {}) {
    this.uiCallbacks = uiCallbacks;

    // Instanciar almacén de memoria persistente
    this.memoryStore = new MemoryStore();

    // Instanciar Agentes Especializados
    this.memoryAgent = new MemoryAgent(this.memoryStore);
    this.emotionalAgent = new EmotionalAgent(this.memoryStore);
    this.planningAgent = new PlanningAgent(this.memoryAgent);
    this.conversationalAgent = new ConversationalAgent();
    this.learningAgent = new LearningAgent(this.memoryStore);

    // Estado global de la orquestación
    this.currentMode = 'STANDBY'; // 'STANDBY' | 'DAYTIME' | 'CALM'
    this.activeWorkingAgent = null;

    // Agente de Captura (inicia escucha y sensores)
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

  // PASO 1: OBSERVAR - Detección de Presencia / Mirada
  handlePresenceDetected() {
    this.logAgentActivity('Captura', 'Sensor de presencia activado (>3s mirada sostenida).');
    const context = this.captureAgent.getCurrentContext();

    if (context.isNightOrDusk) {
      this.setMode('CALM');
    } else {
      this.setMode('DAYTIME');
    }

    // Iniciar ciclo conversacional proactivo inicial
    this.runOrchestrationCycle("PRESENCE_TRIGGER");
  }

  // PASO 1: OBSERVAR - Procesamiento de Entrada de Voz
  handleVoiceInput(transcript) {
    this.logAgentActivity('Captura', `Audio recibido del usuario: "${transcript}"`);
    this.runOrchestrationCycle(transcript);
  }

  // CICLO COMPLETO DE ORQUESTACIÓN AGÉNTICA (7 PASOS)
  runOrchestrationCycle(input) {
    const patient = this.memoryStore.getPatientProfile();
    const context = this.captureAgent.getCurrentContext();

    // PASO 2: ANALIZAR (Emocional + Safety Guardrails)
    this.logAgentActivity('Emocional', 'Analizando prosodia y carga afectiva del audio...');
    const emotionalResult = this.emotionalAgent.processInteraction(
      input === "PRESENCE_TRIGGER" ? "Hola ECOS" : input
    );

    this.logAgentActivity('Orquestador', 'Verificando Reglas de Seguridad y Terapia de Validación...');
    const validationResult = SafetyRules.applyValidationTherapy(
      input === "PRESENCE_TRIGGER" ? "" : input,
      patient
    );

    // PASO 3: PLANIFICAR
    this.logAgentActivity('Planificación', 'Formulando la mejor acción y estrategia conversacional...');
    const plan = this.planningAgent.planNextAction(emotionalResult, validationResult, context);

    // Ajustar modo de pantalla según la acción del plan
    if (plan.actionType === 'ACTIVATE_CALM_MODE') {
      this.setMode('CALM');
    } else {
      this.setMode('DAYTIME');
    }

    // PASO 4: EJECUTAR (Renderizado Zero-UI + Voz)
    this.logAgentActivity('Conversacional', `Generando síntesis de voz adaptable: "${plan.responseText}"`);
    if (this.uiCallbacks.onRenderInteractiveScreen) {
      this.uiCallbacks.onRenderInteractiveScreen(plan);
    }

    this.conversationalAgent.speak(plan.responseText, plan.synthSettings);

    // Si era un mensaje de voz familiar inyectado, marcar como leído
    if (plan.actionType === 'INJECT_FAMILY_VOICE_MEMO' && plan.memo) {
      this.memoryAgent.markVoiceMemoAsRead(plan.memo.id);
    }

    // PASOS 5, 6 y 7: EVALUAR, APRENDER Y NUEVA OBSERVACIÓN
    this.logAgentActivity('Aprendizaje', 'Evaluando métricas de satisfacción y actualizando modelo persistente...');
    this.learningAgent.evaluateInteraction(plan.actionType, emotionalResult);

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
