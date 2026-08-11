/**
 * EmotionalAgent.js - Agente Emocional
 * Monitorea continuamente la afectividad y emite alertas de cambio de estado.
 */
import { EmotionalAnalyzer } from '../EmotionalAnalyzer.js';

export class EmotionalAgent {
  constructor(memoryStore) {
    this.memoryStore = memoryStore;
    this.currentValence = 0.85;
    this.currentMood = 'Estable';
  }

  processInteraction(textInput, speechRate = 1.0) {
    const analysis = EmotionalAnalyzer.analyzeAffectivity(textInput, speechRate);
    this.currentValence = analysis.valence;
    this.currentMood = analysis.detectedState;

    // Registrar en memoria histórica
    this.memoryStore.addEmotionalLog(
      analysis.detectedState,
      analysis.valence,
      `Frase analizada: "${textInput}"`
    );

    return analysis;
  }

  getCurrentMood() {
    return {
      valence: this.currentValence,
      mood: this.currentMood,
      isCrisis: this.currentValence < 0.5
    };
  }
}
