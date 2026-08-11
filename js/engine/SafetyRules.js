/**
 * SafetyRules.js - Reglas de Negocio, Ética y Terapia de Validación
 * Garantiza que la IA nunca confronte recuerdos erróneos ni intente emitir diagnósticos médicos.
 */

export class SafetyRules {
  /**
   * Evalúa la entrada conversacional y aplica la Terapia de Validación
   * @param {string} userInput - Frase recibida del usuario
   * @param {object} patientProfile - Perfil del adulto mayor (Marta)
   */
  static applyValidationTherapy(userInput, patientProfile) {
    const inputLower = userInput.toLowerCase();

    // Detección de patrones comunes de desorientación espacio-temporal o personas ausentes
    const disorientationPatterns = [
      {
        trigger: /dónde está mi mam[áa]|dond[ee] esta mi mam[áa]|quiero a mi mam[áa]/i,
        validationResponse: `${patientProfile.name}, estás segura acá y acompañada. Tu mamá te quería con el alma. ¿Me contás qué les gustaba preparar o cocinar juntas?`,
        redirectTopic: 'Recuerdos de cocina con su madre'
      },
      {
        trigger: /dónde estoy|donde estoy|qu[eé] hago ac[áa]|esta no es mi casa/i,
        validationResponse: `${patientProfile.name}, estás en tu hogar cálido y tranquilo. Nicolás dejó todo listo para que estés cómoda. ¿Te gustaría escuchar un lindo tango?`,
        redirectTopic: 'Música clásica y tranquilidad del hogar'
      },
      {
        trigger: /tengo que ir a trabajar|se me hace tarde para la escuela|tengo que buscar a los chicos/i,
        validationResponse: `Hoy es un día de descanso bien merecido, ${patientProfile.name}. Cumpliste con todo el trabajo. Ahora podemos relajarnos un rato.`,
        redirectTopic: 'Descanso y relajación'
      }
    ];

    for (const pattern of disorientationPatterns) {
      if (pattern.trigger.test(inputLower)) {
        return {
          requiresValidation: true,
          validationText: pattern.validationResponse,
          redirectTopic: pattern.redirectTopic,
          triggerCalmMode: true
        };
      }
    }

    // Regla de no diagnóstico médico ni modificación de tratamientos
    const medicalKeywords = [/diagn[óo]stico/, /enfermedad/, /cu[áa]l es mi remedio/, /cambiar dosis/];
    for (const medKey of medicalKeywords) {
      if (medKey.test(inputLower)) {
        return {
          requiresValidation: false,
          medicalGuardrailTriggered: true,
          validationText: `Para cuestiones médicas o de remedios, Nicolás y tu médico de confianza están al tanto de todo tu plan. Yo te acompaño para que disfrutes tu día.`,
          triggerCalmMode: false
        };
      }
    }

    return { requiresValidation: false, triggerCalmMode: false };
  }

  /**
   * Verifica si la hora actual corresponde a horario circadiano vespertino (17:00 a 08:00 hs)
   */
  static isDuskCircadian(hour) {
    return hour >= 17 || hour < 8;
  }
}
