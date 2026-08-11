/**
 * ConversationalAgent.js - Agente Conversacional
 * Responsable de la generación de respuestas naturales y la síntesis de voz adaptable.
 */

export class ConversationalAgent {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.currentUtterance = null;
  }

  speak(text, synthSettings = { pitch: 1.0, rate: 0.9 }) {
    if (!this.synth) {
      console.warn('SpeechSynthesis no está disponible en este navegador.');
      return;
    }

    this.synth.cancel(); // Cancelar síntesis previa si existía

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-AR';
    utterance.pitch = synthSettings.pitch || 1.0;
    utterance.rate = synthSettings.rate || 0.9;

    // Buscar voz en español
    const voices = this.synth.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es'));
    if (esVoice) utterance.voice = esVoice;

    this.synth.speak(utterance);
    this.currentUtterance = utterance;
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}
