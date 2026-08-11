/**
 * app.js - Punto de Entrada de la Aplicación ECOS
 * Conecta los módulos agénticos, las vistas de la interfaz y la navegación.
 */

import { Orchestrator } from './engine/Orchestrator.js';
import { SeniorUI } from './components/SeniorUI.js';
import { DashboardUI } from './components/DashboardUI.js';
import { DevStudioUI } from './components/DevStudioUI.js';

document.addEventListener('DOMContentLoaded', () => {
  const seniorViewEl = document.getElementById('seniorView');
  const dashboardViewEl = document.getElementById('dashboardView');
  const devstudioViewEl = document.getElementById('devstudioView');

  // 1. Instanciar Orquestador Agéntico Central
  const orchestrator = new Orchestrator({
    onModeChanged: (mode) => {
      console.log('Orquestador cambió modo a:', mode);
    },
    onRenderInteractiveScreen: (plan) => {
      if (seniorUI) {
        seniorUI.renderInteractiveScreen(plan);
      }
    },
    onStateUpdated: () => {
      if (dashboardUI) dashboardUI.render();
    }
  });

  // 2. Instanciar Vistas de Interfaz
  const seniorUI = new SeniorUI(seniorViewEl, orchestrator);
  const dashboardUI = new DashboardUI(dashboardViewEl, orchestrator);
  const devStudioUI = new DevStudioUI(devstudioViewEl, orchestrator);

  // Renderizar vistas iniciales
  seniorUI.renderStandbyScreen();
  dashboardUI.render();
  devStudioUI.render();

  // 3. Manejo de Navegación por Pestañas
  const navButtons = document.querySelectorAll('.nav-btn');
  const viewPanels = document.querySelectorAll('.view-panel');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      navButtons.forEach(b => b.classList.remove('active'));
      viewPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // Iniciar escucha pasiva de captura de voz
  orchestrator.captureAgent.startListening();

  console.log('Plataforma ECOS inicializada correctamente.');
});
