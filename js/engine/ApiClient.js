/**
 * ApiClient.js - Cliente HTTP delgado hacia el backend ECOS (FastAPI).
 * Centraliza el manejo del token JWT y las llamadas fetch usadas por toda la UI.
 */

const TOKEN_STORAGE_KEY = 'ecos_jwt_token';

export class ApiClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem(TOKEN_STORAGE_KEY) || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }

  clearToken() {
    this.setToken(null);
  }

  async request(path, { method = 'GET', body = null, auth = true } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      // Respuesta sin cuerpo JSON (poco común en esta API)
    }

    if (!response.ok) {
      const message = (data && (data.detail || data.message)) || `Error HTTP ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    return data;
  }

  // --- Autenticación ---
  login(username, password) {
    return this.request('/api/auth/login', { method: 'POST', body: { username, password }, auth: false });
  }

  // --- Orquestación agéntica ---
  interact(transcript, hour = new Date().getHours()) {
    return this.request('/api/orchestrator/interact', { method: 'POST', body: { transcript, hour }, auth: false });
  }

  presence(hour = new Date().getHours()) {
    return this.request(`/api/orchestrator/presence?hour=${hour}`, { method: 'POST', auth: false });
  }

  // --- Dashboard familiar ---
  getPatient() {
    return this.request('/api/patient');
  }

  getRoutines() {
    return this.request('/api/routines');
  }

  completeRoutine(routineId) {
    return this.request(`/api/routines/${routineId}`, { method: 'PATCH' });
  }

  getEmotionalHistory() {
    return this.request('/api/emotional-history');
  }

  getVoiceMemos() {
    return this.request('/api/voice-memos');
  }

  createVoiceMemo(sender, text, audioUrl = '') {
    return this.request('/api/voice-memos', { method: 'POST', body: { sender, text, audioUrl } });
  }

  // --- DevStudio ---
  getStats() {
    return this.request('/api/stats');
  }
}
