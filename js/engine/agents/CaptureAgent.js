/**
 * CaptureAgent.js - Agente de Captura de Información
 * Responsable de la entrada de datos: Voz (SpeechRecognition), presencia y contexto de tiempo/entorno.
 */

export class CaptureAgent {
  constructor(onSpeechRecognized, onPresenceDetected) {
    this.onSpeechRecognized = onSpeechRecognized;
    this.onPresenceDetected = onPresenceDetected;
    this.recognition = null;
    this.isListening = false;
    this.presenceTimer = null;
    this.gazeSeconds = 0;

    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'es-AR';

      this.recognition.onresult = (event) => {
        const lastIndex = event.results.length - 1;
        const transcript = event.results[lastIndex][0].transcript.trim();
        if (transcript) {
          this.onSpeechRecognized(transcript);
        }
      };

      this.recognition.onerror = (err) => {
        console.warn('Captura de voz STT warning/error:', err.error);
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try { this.recognition.start(); } catch (e) {}
        }
      };
    } else {
      console.warn('SpeechRecognition no está soportado en este navegador. Se usará modo simulación.');
    }
  }

  startListening() {
    this.isListening = true;
    if (this.recognition) {
      try { this.recognition.start(); } catch (e) {}
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
  }

  simulatePresenceGaze(secondsHold = 3) {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count >= secondsHold) {
        clearInterval(interval);
        this.onPresenceDetected();
      }
    }, 1000);
  }

  getCurrentContext() {
    const now = new Date();
    return {
      hour: now.getHours(),
      minute: now.getMinutes(),
      timestampStr: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isNightOrDusk: now.getHours() >= 17 || now.getHours() < 8
    };
  }
}
