/**
 * AuthUI.js - Componente de Autenticación RBAC
 * Maneja el modal de inicio de sesión y la validación con la API ECOS (backend/)
 */

export class AuthUI {
  constructor(containerEl, apiClient) {
    this.container = containerEl;
    this.api = apiClient;
    this.onLoginSuccess = null;
    this.currentRole = null;
    this.currentUser = null;
  }

  getCurrentRole() {
    return this.currentRole;
  }

  showLoginModal(requiredRoles, callback) {
    this.onLoginSuccess = callback;
    
    // Si ya estamos autenticados y el rol es válido para la vista
    if (this.currentRole && requiredRoles.includes(this.currentRole)) {
      this.onLoginSuccess();
      return;
    }

    this.container.innerHTML = `
      <div class="auth-modal-overlay">
        <div class="auth-modal-box">
          <h2 style="color: #38bdf8; font-family: 'Outfit', sans-serif;">ECOS Secure Login</h2>
          <p style="font-size: 0.9rem; color: #94a3b8; margin-bottom: 1.5rem;">
            Área restringida. Por favor, identifícate.
          </p>
          
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <input type="text" id="authUsername" placeholder="Usuario (ej. familia, doctor, admin)" class="auth-input" />
            <input type="password" id="authPassword" placeholder="Contraseña" class="auth-input" />
            <div id="authErrorMsg" style="color: #fb7185; font-size: 0.8rem; display: none;"></div>
            <button id="authSubmitBtn" class="auth-btn">Acceder</button>
            <button id="authCancelBtn" class="auth-btn cancel">Cancelar (Volver al Inicio)</button>
          </div>
        </div>
      </div>
    `;
    this.container.style.display = 'block';

    const submitBtn = this.container.querySelector('#authSubmitBtn');
    const cancelBtn = this.container.querySelector('#authCancelBtn');
    
    submitBtn.addEventListener('click', () => this.handleLogin(requiredRoles));
    cancelBtn.addEventListener('click', () => {
      this.container.style.display = 'none';
      // Forzar volver a Senior View
      document.getElementById('btnNavSenior').click();
    });
  }

  async handleLogin(requiredRoles) {
    const user = this.container.querySelector('#authUsername').value.trim();
    const pass = this.container.querySelector('#authPassword').value.trim();
    const errorEl = this.container.querySelector('#authErrorMsg');
    
    errorEl.style.display = 'none';

    try {
      const data = await this.api.login(user, pass);

      if (data.success) {
        if (!requiredRoles.includes(data.role)) {
          errorEl.textContent = 'Tu rol no tiene permisos para ver esta sección.';
          errorEl.style.display = 'block';
          return;
        }

        this.api.setToken(data.token);
        this.currentRole = data.role;
        this.currentUser = data.name;
        this.container.style.display = 'none';
        
        console.log(`Sesión iniciada: ${data.name} (Rol: ${data.role})`);
        
        // Optimización de vistas: Ocultar la pestaña del Adulto Mayor (el reloj) siempre que haya alguien logueado (admin, doctor o familia)
        const btnSenior = document.getElementById('btnNavSenior');
        if (btnSenior) {
          btnSenior.style.display = 'none';
        }
        // También ocultar el panel del reloj/adulto mayor
        const seniorView = document.getElementById('seniorView');
        if (seniorView) {
          seniorView.classList.remove('active');
        }

        // Habilitar botón de Salir
        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) {
          btnLogout.style.display = 'flex';
          btnLogout.onclick = () => {
            if(confirm("¿Seguro que deseas cerrar la sesión actual?")) {
              this.api.clearToken();
              window.location.reload();
            }
          };
        }

        if (this.onLoginSuccess) {
          this.onLoginSuccess();
        }
      } else {
        errorEl.textContent = data.message || 'Credenciales inválidas.';
        errorEl.style.display = 'block';
      }
    } catch (err) {
      errorEl.textContent = 'Error de conexión con el backend (API ECOS).';
      errorEl.style.display = 'block';
    }
  }
}
