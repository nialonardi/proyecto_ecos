/**
 * LearningAgent.js - Agente de Aprendizaje
 * Analiza resultados de cada interacción (duración, respuestas emocionales, aceptación) para optimizar estrategias futuras.
 */

export class LearningAgent {
  constructor(memoryStore) {
    this.memoryStore = memoryStore;
  }

  evaluateInteraction(actionType, emotionalResult) {
    const stats = this.memoryStore.state.interactionStats;
    stats.totalConversations++;

    if (emotionalResult.valence >= 0.7) {
      stats.successfulReminiscences++;
    }

    if (actionType === 'ACTIVATE_CALM_MODE') {
      stats.calmModesActivated++;
    }

    // Recalcular puntuación de satisfacción estimada
    stats.averageSatisfactionScore = Math.min(
      0.99,
      (stats.successfulReminiscences / stats.totalConversations).toFixed(2)
    );

    this.memoryStore.saveMemory();
    return stats;
  }
}
