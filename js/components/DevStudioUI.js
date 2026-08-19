/**
 * DevStudioUI.js - Monitor en Vivo del Orquestador Agéntico y Consola de Pruebas
 * Muestra el grafo de agentes en tiempo real, logs de la red agéntica y controles de disparo simulado.
 */

export class DevStudioUI {
  constructor(containerEl, orchestrator) {
    this.container = containerEl;
    this.orchestrator = orchestrator;
    this.logs = [];

    // Suscribir callback de actividad de agentes
    this.orchestrator.uiCallbacks.onAgentActivity = (logEntry) => {
      this.logs.unshift(logEntry);
      if (this.logs.length > 50) this.logs.pop();
      this.updateActiveAgentCard(logEntry.agent);
      this.renderTerminalLogs();
    };
  }

  render() {
    this.container.innerHTML = `
      <div class="devstudio-container">
        <!-- Título y Estado -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(30,41,59,0.7); padding: 1.25rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
          <div>
            <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.3rem;">🧠 DevStudio: Orquestación Agéntica en Tiempo Real</h2>
            <p style="font-size: 0.85rem; color: #94a3b8; margin-top: 4px;">
              Visualización interactiva del ciclo de 7 pasos: Observar ➔ Analizar ➔ Planificar ➔ Ejecutar ➔ Evaluar ➔ Aprender
            </p>
          </div>
          <span style="background: rgba(56, 189, 248, 0.15); color: #38BDF8; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(56, 189, 248, 0.3);">
            Hub MCP Rust: Conectado (Stateless 2026)
          </span>
        </div>

        <!-- Botones de Disparo y Pruebas Simuladas -->
        <div class="orchestrator-controls">
          <span style="font-weight: 600; font-size: 0.9rem; color: #cbd5e1; margin-right: 8px;">⚡ Disparadores de Prueba:</span>

          <button class="trigger-btn" id="btnSimulatePresence">
            <span>👁️ Simular Presencia (>3s)</span>
          </button>

          <button class="trigger-btn warning" id="btnSimulateDisorientation">
            <span>⚠️ Simular Desorientación ("¿Dónde está mi mamá?")</span>
          </button>

          <button class="trigger-btn" id="btnSimulateSunset">
            <span>🌆 Simular Horario Atardecer (18:00 hs)</span>
          </button>

          <button class="trigger-btn" id="btnSimulateNormalTalk">
            <span>💬 Simular Frase Normal ("Qué lindo día")</span>
          </button>

          <button class="trigger-btn" id="btnConsultTribunal">
            <span>🏛️ Consultar Tribunal MCP (Nvidia/Kimi)</span>
          </button>
        </div>

        <!-- Malla / Red de Nodos Agénticos -->
        <div class="agents-network-grid" id="agentsGrid">
          <div class="agent-node-card" id="agentCard_Captura">
            <div class="agent-header">
              <div class="agent-badge"></div>
              <span>Captura</span>
            </div>
            <div class="agent-status-msg">Entrada STT y presencia</div>
          </div>

          <div class="agent-node-card" id="agentCard_Orquestador">
            <div class="agent-header">
              <div class="agent-badge"></div>
              <span>Orquestador</span>
            </div>
            <div class="agent-status-msg">Coordinador principal</div>
          </div>

          <div class="agent-node-card" id="agentCard_Emocional">
            <div class="agent-header">
              <div class="agent-badge"></div>
              <span>Emocional</span>
            </div>
            <div class="agent-status-msg">Procesamiento de afectividad</div>
          </div>

          <div class="agent-node-card" id="agentCard_Planificación">
            <div class="agent-header">
              <div class="agent-badge"></div>
              <span>Planificación</span>
            </div>
            <div class="agent-status-msg">Formulación de acciones</div>
          </div>

          <div class="agent-node-card" id="agentCard_Conversacional">
            <div class="agent-header">
              <div class="agent-badge"></div>
              <span>Conversacional</span>
            </div>
            <div class="agent-status-msg">Síntesis TTS adaptable</div>
          </div>

          <div class="agent-node-card" id="agentCard_Memoria">
            <div class="agent-header">
              <div class="agent-badge"></div>
              <span>Memoria</span>
            </div>
            <div class="agent-status-msg">Persistencia histórica</div>
          </div>

          <div class="agent-node-card" id="agentCard_Aprendizaje">
            <div class="agent-header">
              <div class="agent-badge"></div>
              <span>Aprendizaje</span>
            </div>
            <div class="agent-status-msg">Optimización continua</div>
          </div>
        </div>

        <!-- Terminal de Logs de Agentes -->
        <div style="background: rgba(30,41,59,0.7); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 1.25rem;">
          <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.05rem; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span>📜 Registro de Eventos Agénticos en Tiempo Real</span>
            <span style="font-size: 0.8rem; font-weight: normal; color: #64748b;">Consola en directo</span>
          </h3>
          <div class="agent-log-terminal" id="agentTerminal">
            <div class="log-line">
              <span class="timestamp">[00:00:00]</span>
              <span class="agent-tag">[Sistema]</span>
              <span>DevStudio listo. Seleccioná un disparador para simular la red agéntica.</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const btnPresence = this.container.querySelector('#btnSimulatePresence');
    const btnDisorientation = this.container.querySelector('#btnSimulateDisorientation');
    const btnSunset = this.container.querySelector('#btnSimulateSunset');
    const btnNormalTalk = this.container.querySelector('#btnSimulateNormalTalk');
    const btnTribunal = this.container.querySelector('#btnConsultTribunal');

    if (btnPresence) {
      btnPresence.addEventListener('click', () => {
        this.orchestrator.startPresenceSimulation();
      });
    }

    if (btnDisorientation) {
      btnDisorientation.addEventListener('click', () => {
        this.orchestrator.handleVoiceInput('¿Dónde está mi mamá? No sé dónde estoy');
      });
    }

    if (btnSunset) {
      btnSunset.addEventListener('click', () => {
        this.orchestrator.runOrchestrationCycle('Atardecer circadiano 18:00', 18);
      });
    }

    if (btnNormalTalk) {
      btnNormalTalk.addEventListener('click', () => {
        this.orchestrator.handleVoiceInput('Qué linda foto del mar, me acuerdo de ese verano');
      });
    }

    if (btnTribunal) {
      btnTribunal.addEventListener('click', () => {
        this.orchestrator.logAgentActivity(
          'Orquestador',
          'Consultando al Tribunal MCP Hub en Rust (Nvidia NIM + Kimi)... Evaluando convergencia de estrategia de validación.',
          'warn'
        );
        setTimeout(() => {
          this.orchestrator.logAgentActivity(
            'Orquestador',
            'Tribunal MCP respondió (Convergencia 100%): "Aprobar Terapia de Validación sin confrontación directa".',
            'info'
          );
        }, 1200);
      });
    }
  }

  updateActiveAgentCard(agentName) {
    const grid = this.container.querySelector('#agentsGrid');
    if (!grid) return;

    grid.querySelectorAll('.agent-node-card').forEach(card => card.classList.remove('active-working'));

    const activeCard = grid.querySelector(`#agentCard_${agentName}`);
    if (activeCard) {
      activeCard.classList.add('active-working');
      setTimeout(() => {
        activeCard.classList.remove('active-working');
      }, 1500);
    }
  }

  renderTerminalLogs() {
    const terminal = this.container.querySelector('#agentTerminal');
    if (!terminal) return;

    terminal.innerHTML = this.logs.map(log => `
      <div class="log-line ${log.level === 'warn' ? 'warn' : ''}">
        <span class="timestamp">[${log.timestamp}]</span>
        <span class="agent-tag">[${log.agent}]</span>
        <span>${log.message}</span>
      </div>
    `).join('');
  }
}
