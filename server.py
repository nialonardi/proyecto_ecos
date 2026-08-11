#!/usr/bin/env python3
import http.server
import socketserver
import json
import urllib.parse
from pathlib import Path

PORT = 8085
DIRECTORY = Path(__file__).parent.resolve()

# Base de datos simulada en memoria
USERS = {
    "familia": {"password": "123", "role": "family", "name": "Familia Ialonardi"},
    "doctor": {"password": "123", "role": "health", "name": "Dr. Pérez"},
    "admin": {"password": "admin", "role": "admin", "name": "DevStudio Admin"}
}

class ECOSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

    def do_POST(self):
        # Enrutador simple para APIs
        parsed_path = urllib.parse.urlparse(self.path)
        
        if parsed_path.path == '/api/login':
            self.handle_login()
        else:
            self.send_error(404, "Endpoint not found")

    def handle_login(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            username = data.get('username', '').lower()
            password = data.get('password', '')
            
            if username in USERS and USERS[username]['password'] == password:
                user_info = USERS[username]
                response = {
                    "success": True,
                    "token": f"token_auth_{username}_2026",
                    "role": user_info['role'],
                    "name": user_info['name']
                }
                status = 200
            else:
                response = {"success": False, "message": "Credenciales inválidas"}
                status = 401
                
        except json.JSONDecodeError:
            response = {"success": False, "message": "Invalid JSON"}
            status = 400

        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        # Habilitar CORS si hiciera falta
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))

# Iniciar Servidor
if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), ECOSRequestHandler) as httpd:
        print(f"🚀 Servidor ECOS (Full-Stack Mode) sirviendo en http://localhost:{PORT}")
        print(f"📁 Directorio raíz: {DIRECTORY}")
        print("🔐 RBAC API activada en /api/login")
        print("Credenciales de prueba:")
        print("  - Familia: familia / 123")
        print("  - Médico: doctor / 123")
        print("  - Admin: admin / admin")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nApagando servidor...")
