/**
 * DashboardUI.js - Panel Web para Familiares y Cuidadores (PWA)
 * Permite monitoreo no invasivo del bienestar del adulto mayor e inyección de mensajes afectivos de voz.
 */

export class DashboardUI {
  constructor(containerEl, orchestrator) {
    this.container = containerEl;
    this.orchestrator = orchestrator;
  }

  render() {
    const memory = this.orchestrator.memoryStore;
    const patient = memory.getPatientProfile();
    const routines = memory.getRoutines();
    const history = memory.getEmotionalHistory();

    const latestStatus = history[0] ? history[0].status : 'Estable';
    const isCalm = latestStatus.includes('Agitación') || latestStatus.includes('Ansiedad');

    this.container.innerHTML = `
      <div class="dashboard-container">
        <!-- Tarjeta de Perfil y Estado -->
        <div class="dashboard-header-card">
          <div class="patient-profile">
            <div class="patient-avatar">M</div>
            <div class="patient-info">
              <h2>Perfil de ${patient.name} ${patient.lastName} (${patient.age} años)</h2>
              <p>Cuidador Responsable: <strong>${patient.primaryCaregiver}</strong> | ${patient.condition}</p>
            </div>
          </div>
          <div>
            <span class="status-badge ${isCalm ? 'calm' : 'stable'}">
              ${isCalm ? '🟡 Modo Calma Activo' : '🟢 Estado Estable / Alegre'}
            </span>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Columna Izquierda: Biomarcadores & Timeline -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="dash-card">
              <div class="dash-card-title">
                <span>📊 Biomarcadores de Ánimo (Últimas 24 Horas)</span>
                <span style="font-size: 0.85rem; color: #34D399; font-weight: 500;">84% Bienestar</span>
              </div>
              <div class="biomarker-progress-bar">
                <div class="biomarker-fill"></div>
              </div>
              <p style="font-size: 0.85rem; color: #94a3b8;">
                Indicador basado en ritmo de voz, estabilidad prosódica y respuesta a estimulación fotográfica.
              </p>
            </div>

            <div class="dash-card">
              <div class="dash-card-title">
                <span>🕒 Historial de Actividad & Interacciones</span>
              </div>
              <div class="activity-list" id="activityList">
                ${history.map(item => `
                  <div class="activity-item ${item.status.includes('Agitación') ? 'calm-mode' : ''}">
                    <div class="activity-time">${item.timestamp}</div>
                    <div class="activity-desc">
                      <strong>${item.status}</strong> — ${item.detail}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Grabador de Voz & Rutinas -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="dash-card">
              <div class="dash-card-title">
                <span>💌 Enviar Mensaje Afectivo de Voz</span>
              </div>
              <div class="voice-memo-box">
                <p style="font-size: 0.85rem; color: #cbd5e1;">
                  El mensaje se inyectará de forma inteligente cuando la IA detecte el momento óptimo de receptividad.
                </p>
                <input type="text" id="voiceMemoInput" placeholder="Escribí tu mensaje cariñoso..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.3); color: #fff; font-size: 0.9rem;" value="¡Hola Mamá! Te mandamos un beso enorme, esta tarde paso a tomar unos mates." />
                <button class="record-btn" id="sendVoiceMemoBtn">
                  <span>🎙️ Inyectar Mensaje Afectivo</span>
                </button>
              </div>
            </div>

            <div class="dash-card">
              <div class="dash-card-title">
                <span>💊 Rutinas y Medicación</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${routines.map(r => `
                  <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px;">
                    <div>
                      <span style="font-weight: 600; color: #38bdf8; margin-right: 8px;">${r.time}</span>
                      <span style="font-size: 0.9rem;">${r.title}</span>
                    </div>
                    <span style="color: ${r.completed ? '#34D399' : '#FBBF24'}; font-size: 0.8rem; font-weight: 600;">
                      ${r.completed ? '✓ Cumplido' : '⏳ Pendiente'}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listener para el botón de mensaje afectivo
    const sendBtn = this.container.querySelector('#sendVoiceMemoBtn');
    const memoInput = this.container.querySelector('#voiceMemoInput');
    if (sendBtn && memoInput) {
      sendBtn.addEventListener('click', () => {
        const text = memoInput.value.trim();
        if (text) {
          this.orchestrator.memoryStore.addVoiceMemo('Nicolás (Hijo)', text);
          alert('¡Mensaje de voz afectivo encolado exitosamente! El orquestador lo inyectará en la próxima interacción receptiva.');
          memoInput.value = '';
          this.render();
        }
      });
    }
  }
}
