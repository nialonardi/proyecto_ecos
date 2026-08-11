/**
 * PlanningAgent.js - Agente de Planificación
 * Decide la mejor acción a ejecutar considerando el contexto actual, la afectividad y la hora del día.
 */

export class PlanningAgent {
  constructor(memoryAgent) {
    this.memoryAgent = memoryAgent;
  }

  planNextAction(emotionalState, validationResult, context) {
    // 1. Prioridad absoluta: Seguridad y Mitigación de Crisis / Terapia de Validación
    if (validationResult.triggerCalmMode || emotionalState.isAgitatedOrDisoriented || context.isNightOrDusk) {
      const landscape = this.memoryAgent.fetchCalmModeLandscape();
      return {
        actionType: 'ACTIVATE_CALM_MODE',
        reason: validationResult.requiresValidation ? 'Terapia de Validación por desorientación' : 'Ajuste circadiano vespertino',
        displayPhoto: landscape,
        responseText: validationResult.validationText || `Marta, estás en tu hogar sereno. Todo está tranquilo y en orden.`,
        synthSettings: { pitch: 0.8, rate: 0.75 } // Voz grave y ralentizada
      };
    }

    // 2. Verificar si hay un mensaje afectivo de voz pendiente enviado por la familia
    const pendingMemo = this.memoryAgent.checkForPendingVoiceMemo();
    if (pendingMemo) {
      return {
        actionType: 'INJECT_FAMILY_VOICE_MEMO',
        reason: 'Inyección oportuna de mensaje afectivo familiar',
        memo: pendingMemo,
        responseText: `Marta, tenés un mensaje cariñoso de ${pendingMemo.sender}: "${pendingMemo.textText}"`,
        synthSettings: { pitch: 1.0, rate: 0.9 }
      };
    }

    // 3. Estimulación Reminiscente Diurna Estándar
    const photo = this.memoryAgent.fetchRelevantReminiscencePhoto();
    return {
      actionType: 'DIURNAL_REMINISCENCE',
      reason: 'Estimulación cognitiva mediante memoria fotográfica',
      displayPhoto: photo,
      responseText: `Marta, mirá qué hermosa foto de Mar del Plata. ¿Te acordás quién viajó con vos ese verano?`,
      synthSettings: { pitch: 1.0, rate: 0.95 }
    };
  }
}
