/**
 * SeniorUI.js - Interfaz del Adulto Mayor (Zero-UI Tablet)
 * Renderiza Pantalla A (Reposo Activo), Pantalla B (Diurna Reminiscente) y Pantalla C (Modo Calma / Crisis).
 */

export class SeniorUI {
  constructor(containerEl, orchestrator) {
    this.container = containerEl;
    this.orchestrator = orchestrator;
    this.clockInterval = null;
  }

  renderStandbyScreen() {
    this.container.className = 'senior-tablet-container theme-standby';
    this.container.innerHTML = `
      <div class="senior-status-bar">
        <div class="senior-wifi-icon">
          <span>📶</span> <span>ECOS Red Segura</span>
        </div>
        <div class="senior-clock-digital" id="digitalClockNav">--:--</div>
      </div>

      <div class="screen-standby">
        <div class="analog-clock">
          <div class="clock-center"></div>
          <div class="clock-hand hand-hour" id="analogHour"></div>
          <div class="clock-hand hand-minute" id="analogMin"></div>
        </div>

        <div class="presence-detector-prompt">
          <div class="pulse-gaze-ring"></div>
          <span>Esperando presencia y mirada sostenida (3s)</span>
        </div>
      </div>
    `;

    this.startClock();
  }

  renderInteractiveScreen(plan) {
    const isCalm = plan.actionType === 'ACTIVATE_CALM_MODE';
    const themeClass = isCalm ? 'theme-calm' : 'theme-daytime';

    const photoUrl = plan.displayPhoto ? plan.displayPhoto.url : 'assets/family_reminiscence_beach.jpg';
    const photoTitle = plan.displayPhoto ? plan.displayPhoto.title : 'Recuerdo Familiar';

    this.container.className = `senior-tablet-container ${themeClass}`;
    this.container.innerHTML = `
      <div class="senior-status-bar">
        <div class="senior-wifi-icon">
          <span>📶</span> <span>${isCalm ? 'Modo Calma Activo' : 'Modo Estimulación'}</span>
        </div>
        <div class="senior-clock-digital" id="digitalClockNav">--:--</div>
      </div>

      <div class="screen-interactive">
        <div class="reminiscence-card-container">
          <img src="${photoUrl}" alt="${photoTitle}" class="reminiscence-img" />
          <div class="reminiscence-overlay-tag">${photoTitle}</div>
        </div>

        <div class="hearing-support-text">
          <p id="speechDisplayText">"${plan.responseText}"</p>
        </div>

        <div class="listening-wave-bar">
          <div class="breathing-pulse-circle"></div>
          <span class="listening-label">Escuchando atentamente... (Sin botones)</span>
        </div>
      </div>
    `;

    this.startClock();
  }

  startClock() {
    if (this.clockInterval) clearInterval(this.clockInterval);

    const updateClocks = () => {
      const now = new Date();
      const digitalEl = this.container.querySelector('#digitalClockNav');
      if (digitalEl) {
        digitalEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      const hourHand = this.container.querySelector('#analogHour');
      const minHand = this.container.querySelector('#analogMin');
      if (hourHand && minHand) {
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        hourHand.style.transform = `rotate(${(hours * 30) + (minutes * 0.5)}deg)`;
        minHand.style.transform = `rotate(${minutes * 6}deg)`;
      }
    };

    updateClocks();
    this.clockInterval = setInterval(updateClocks, 1000);
  }
}
