/**
 * MemoryStore.js - Motor de Memoria Persistente de ECOS
 * Gestiona el conocimiento estructurado del adulto mayor (Marta, 81 años).
 */

export class MemoryStore {
  constructor() {
    this.storageKey = 'ecos_persistent_memory_v1';
    this.state = this.loadMemory();
  }

  getInitialSeedData() {
    return {
      patient: {
        name: 'Marta',
        lastName: 'Ialonardi',
        age: 81,
        condition: 'Deterioro Cognitivo Leve - Síndrome del Ocaso ocasional',
        primaryCaregiver: 'Nicolás (Hijo)',
        emergencyContact: '+54 9 11 5555-4321'
      },
      preferences: {
        music: ['Tango clásico', 'Carlos Gardel', 'Mercedes Sosa'],
        favoritePlaces: ['Mar del Plata', 'Bariloche', 'Jardín Botánico'],
        hobbies: ['Jardinería', 'Escuchar música de radio', 'Mirar fotos antiguas'],
        favoriteTopics: ['Las vacaciones de 1978', 'Sus nietos', 'Recetas de cocina tradicional']
      },
      reminiscencePhotos: [
        {
          id: 'photo_beach_1978',
          url: 'assets/family_reminiscence_beach.jpg',
          title: 'Mar del Plata, 1978',
          description: 'Playa popular con la familia, el mar radiante y risas compartidas.',
          suggestedQuestion: '¿Te acordás quién viajó con vos ese verano a Mar del Plata?'
        },
        {
          id: 'photo_nature_calm',
          url: 'assets/calm_nature_landscape.jpg',
          title: 'Paisaje Natural Biofílico',
          description: 'Lago sereno al atardecer para momentos de calma neurológica.',
          suggestedQuestion: 'El agua tranquila me trae mucha paz. ¿A vos te gusta escuchar el sonido de la naturaleza?'
        }
      ],
      routines: [
        { id: 'm1', time: '08:30', title: 'Medicación de la mañana (Antihipertensivo)', completed: true },
        { id: 'm2', time: '13:00', title: 'Almuerzo y paseo por el patio', completed: true },
        { id: 'm3', time: '17:30', title: 'Té con galletitas y estimulación musical', completed: false },
        { id: 'm4', time: '20:30', title: 'Cena y medicación vespertina', completed: false }
      ],
      emotionalHistory: [
        { timestamp: '14:20', status: 'Estable / Alegre', valence: 0.85, detail: 'Recordó con alegría las vacaciones de 1978.' },
        { timestamp: '16:45', status: 'Tranquilo', valence: 0.78, detail: 'Escuchó un tango de Carlos Gardel.' }
      ],
      familyVoiceMemos: [
        {
          id: 'memo_nico_1',
          sender: 'Nicolás (Hijo)',
          audioUrl: '',
          textText: '¡Hola mamá! Te mando un abrazo grande, pasé a dejarte las flores esta mañana.',
          played: false,
          timestamp: '11:15 AM'
        }
      ],
      interactionStats: {
        totalConversations: 42,
        successfulReminiscences: 38,
        calmModesActivated: 4,
        averageSatisfactionScore: 0.92
      }
    };
  }

  loadMemory() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('No se pudo cargar memoria local, inicializando seed data:', e);
    }
    const initial = this.getInitialSeedData();
    this.saveMemory(initial);
    return initial;
  }

  saveMemory(data = this.state) {
    this.state = data;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error('Error al guardar memoria persistente:', e);
    }
  }

  getPatientProfile() {
    return this.state.patient;
  }

  getReminiscencePhotos() {
    return this.state.reminiscencePhotos;
  }

  getRoutines() {
    return this.state.routines;
  }

  getEmotionalHistory() {
    return this.state.emotionalHistory;
  }

  addEmotionalLog(status, valence, detail) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.state.emotionalHistory.unshift({ timestamp: timeStr, status, valence, detail });
    if (this.state.emotionalHistory.length > 20) this.state.emotionalHistory.pop();
    this.saveMemory();
  }

  addVoiceMemo(sender, textText, audioUrl = '') {
    const memo = {
      id: 'memo_' + Date.now(),
      sender,
      textText,
      audioUrl,
      played: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.state.familyVoiceMemos.unshift(memo);
    this.saveMemory();
    return memo;
  }

  getUnplayedVoiceMemo() {
    return this.state.familyVoiceMemos.find(m => !m.played);
  }

  markVoiceMemoPlayed(id) {
    const memo = this.state.familyVoiceMemos.find(m => m.id === id);
    if (memo) {
      memo.played = true;
      this.saveMemory();
    }
  }
}
