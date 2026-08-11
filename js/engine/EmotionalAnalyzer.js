/**
 * EmotionalAnalyzer.js - Agente de Procesamiento Emocional y Acústico
 * Analiza prosodia, ritmo y vocabulario afectivo para detectar ansiedad, tristeza o agitación.
 */

export class EmotionalAnalyzer {
  static analyzeAffectivity(inputText, speechRate = 1.0, pausesCount = 0) {
    const textLower = inputText.toLowerCase();

    let valence = 0.8; // 1.0 = Alegre, 0.5 = Neutro, 0.0 = Agitado/Ansioso
    let detectedState = 'Estable / Tranquilo';
    let isAgitatedOrDisoriented = false;

    // Palabras clave de ansiedad / tristeza / desorientación
    const anxietyKeywords = ['miedo', 'asustada', 'angustia', 'sola', 'triste', 'perdida', 'dónde', 'donde', 'ayuda'];
    const positiveKeywords = ['lindo', 'alegría', 'gracias', 'hermoso', 'bien', 'contenta', 'te quiero'];

    let matchesAnxiety = 0;
    let matchesPositive = 0;

    anxietyKeywords.forEach(word => {
      if (textLower.includes(word)) matchesAnxiety++;
    });

    positiveKeywords.forEach(word => {
      if (textLower.includes(word)) matchesPositive++;
    });

    if (matchesAnxiety > 0 || speechRate > 1.4 || pausesCount > 3) {
      valence = Math.max(0.2, 0.7 - matchesAnxiety * 0.2);
      detectedState = matchesAnxiety > 1 ? 'Agitación / Desorientación' : 'Leve Ansiedad / Tristeza';
      isAgitatedOrDisoriented = true;
    } else if (matchesPositive > 0) {
      valence = Math.min(1.0, 0.85 + matchesPositive * 0.1);
      detectedState = 'Alegre / Receptivo';
    }

    return {
      valence,
      detectedState,
      isAgitatedOrDisoriented,
      acousticMetrics: {
        speechRate,
        pausesCount,
        intensity: isAgitatedOrDisoriented ? 'Elevada' : 'Normal'
      }
    };
  }
}
