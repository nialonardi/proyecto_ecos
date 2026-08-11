/**
 * MemoryAgent.js - Agente de Memoria
 * Interfaz especializada para consultar y actualizar el conocimiento persistente de la plataforma.
 */

export class MemoryAgent {
  constructor(memoryStore) {
    this.memoryStore = memoryStore;
  }

  fetchRelevantReminiscencePhoto() {
    const photos = this.memoryStore.getReminiscencePhotos();
    return photos[0] || null;
  }

  fetchCalmModeLandscape() {
    const photos = this.memoryStore.getReminiscencePhotos();
    return photos.find(p => p.id === 'photo_nature_calm') || photos[1] || photos[0];
  }

  checkForPendingVoiceMemo() {
    return this.memoryStore.getUnplayedVoiceMemo();
  }

  markVoiceMemoAsRead(id) {
    this.memoryStore.markVoiceMemoPlayed(id);
  }

  getPatientName() {
    return this.memoryStore.getPatientProfile().name;
  }
}
