/**
 * DashboardUI.js - Panel Web para Familiares y Cuidadores (PWA)
 * Permite monitoreo no invasivo del bienestar del adulto mayor e inyección de mensajes afectivos de voz.
 * Todos los datos se obtienen del backend vía ApiClient (ya no de localStorage).
 */

export class DashboardUI {
  constructor(containerEl, orchestrator) {
    this.container = containerEl;
    this.orchestrator = orchestrator;
  }

  async render() {
    const auth = this.orchestrator.auth;
    const role = auth ? auth.getCurrentRole() : null;
    const userName = auth && auth.currentUser ? auth.currentUser : 'Visitante';

    if (!role) {
      this.container.innerHTML = `<div class="dashboard-container"><p>Iniciá sesión para ver el panel familiar.</p></div>`;
      return;
    }

    this.container.innerHTML = `<div class="dashboard-container"><p>Cargando datos del paciente...</p></div>`;

    let patient, routines, history;
    try {
      [patient, routines, history] = await Promise.all([
        this.orchestrator.api.getPatient(),
        this.orchestrator.api.getRoutines(),
        this.orchestrator.api.getEmotionalHistory(),
      ]);
    } catch (err) {
      this.container.innerHTML = `<div class="dashboard-container"><p>Error al cargar el dashboard: ${err.message}</p></div>`;
      return;
    }

    const latestStatus = history[0] ? history[0].status : 'Estable';
    const isCalm = latestStatus.includes('Agitación') || latestStatus.includes('Ansiedad');

    this.container.innerHTML = `
      <div class="dashboard-container">
        <!-- Tarjeta de Perfil y Estado -->
        <div class="dashboard-header-card">
          <div class="patient-profile">
            <div class="patient-avatar">${patient.name.charAt(0)}</div>
            <div class="patient-info">
              <h2>Perfil de ${patient.name} ${patient.lastName} (${patient.age} años)</h2>
              <p>Cuidador Responsable: <strong>${patient.primaryCaregiver}</strong> | ${patient.condition}</p>
            </div>
          </div>
          <div style="display: flex; gap: 15px; align-items: center;">
            <div style="color: #94a3b8; font-size: 0.85rem; text-align: right;">
              Sesión activa:<br><strong style="color:#fff;">${userName}</strong>
            </div>
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
                <span style="font-size: 0.85rem; color: #34D399; font-weight: 500;">${Math.round((history[0]?.valence ?? 0.84) * 100)}% Bienestar</span>
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
            ${role === 'family' || role === 'admin' ? `
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
            ` : `
            <div class="dash-card">
              <div class="dash-card-title">
                <span>💌 Mensajes Familiares</span>
              </div>
              <p style="font-size: 0.85rem; color: #94a3b8;">La inyección de mensajes afectivos está reservada para el rol Familia.</p>
            </div>
            `}

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
                      ${(role === 'health' || role === 'admin') && !r.completed ? ` <a href="#" class="complete-routine-link" data-routine-id="${r.id}" style="color:#38BDF8; margin-left: 10px;">(Marcar)</a>` : ''}
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
      sendBtn.addEventListener('click', async () => {
        const text = memoInput.value.trim();
        if (!text) return;
        try {
          await this.orchestrator.api.createVoiceMemo(patient.primaryCaregiver, text);
          alert('¡Mensaje de voz afectivo encolado exitosamente! El orquestador lo inyectará en la próxima interacción receptiva.');
          this.render();
        } catch (err) {
          alert(`No se pudo enviar el mensaje: ${err.message}`);
        }
      });
    }

    // Event listeners para marcar rutinas como cumplidas
    this.container.querySelectorAll('.complete-routine-link').forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        const routineId = link.getAttribute('data-routine-id');
        try {
          await this.orchestrator.api.completeRoutine(routineId);
          this.render();
        } catch (err) {
          alert(`No se pudo actualizar la rutina: ${err.message}`);
        }
      });
    });
  }
}
