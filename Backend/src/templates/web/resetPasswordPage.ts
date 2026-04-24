export const getResetPasswordPage = (token: string) => {
    const colorPrincipal = '#6366f1'; 

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Restablecer Contraseña - Kitchy</title>
        <style>
            * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
            body { 
                font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
                background-color: #f8fafc; 
                margin: 0; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                padding: 20px;
            }
            .card { 
                background: white; 
                padding: 40px 30px; 
                border-radius: 24px; 
                box-shadow: 0 10px 40px rgba(0,0,0,0.04); 
                max-width: 400px; 
                width: 100%; 
                text-align: center; 
            }
            .logo { 
                font-size: 24px; 
                font-weight: 800; 
                color: #1e293b; 
                margin-bottom: 8px; 
                letter-spacing: -0.5px; 
            }
            h1 { 
                font-size: 20px; 
                color: #64748b; 
                margin-bottom: 30px; 
                font-weight: 500;
            }
            .input-group { 
                text-align: left; 
                margin-bottom: 20px; 
            }
            label { 
                display: block; 
                font-size: 13px; 
                font-weight: 600; 
                color: #94a3b8; 
                margin-bottom: 8px; 
                padding-left: 4px;
            }
            input { 
                width: 100%; 
                border: 1.5px solid #f1f5f9; 
                background-color: #f8fafc;
                border-radius: 14px; 
                padding: 14px 18px; 
                font-size: 16px; 
                outline: none; 
                transition: all 0.2s; 
            }
            input:focus { 
                border-color: ${colorPrincipal}; 
                background-color: white;
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
            }
            .submit-btn { 
                background-color: ${colorPrincipal}; 
                color: white; 
                border: none; 
                padding: 16px; 
                border-radius: 14px; 
                font-weight: bold; 
                font-size: 16px; 
                cursor: pointer; 
                width: 100%; 
                margin-top: 10px; 
                box-shadow: 0 4px 12px rgba(99,102,241,0.2); 
                transition: transform 0.1s, opacity 0.2s;
            }
            .submit-btn:active { transform: scale(0.98); }
            .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            
            .success-view { display: none; }
            .error { 
                color: #ef4444; 
                font-size: 12px; 
                margin-top: 8px; 
                display: none; 
                padding-left: 4px;
            }

            @media (max-width: 480px) {
                .card { padding: 30px 20px; }
                .logo { font-size: 22px; }
                h1 { font-size: 18px; }
            }
        </style>
    </head>
    <body>
        <div class="card" id="form-card">
            <div class="logo">KITCHY</div>
            <h1>Nueva Contraseña</h1>
            
            <form id="reset-form">
                <div class="input-group">
                    <label>Contraseña Nueva</label>
                    <input type="password" id="password" required minlength="6" placeholder="Mínimo 6 caracteres" autocomplete="new-password">
                </div>
                <div class="input-group">
                    <label>Confirmar Contraseña</label>
                    <input type="password" id="confirm" required placeholder="Repite la contraseña" autocomplete="new-password">
                    <div id="error-msg" class="error">Las contraseñas no coinciden</div>
                </div>

                <button type="submit" class="submit-btn" id="submit-btn">Cambiar Contraseña</button>
            </form>
        </div>

        <div class="card success-view" id="success-card">
            <div style="font-size: 50px; margin-bottom: 20px;">✅</div>
            <div class="logo">KITCHY</div>
            <h1>Contraseña Cambiada</h1>
            <p style="color: #64748b; line-height: 1.6;">Tu contraseña ha sido actualizada con éxito. Ya puedes volver a la aplicación e iniciar sesión.</p>
        </div>

        <script>
            document.getElementById('reset-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const password = document.getElementById('password').value;
                const confirm = document.getElementById('confirm').value;
                const errorMsg = document.getElementById('error-msg');
                const btn = document.getElementById('submit-btn');

                if (password !== confirm) {
                    errorMsg.style.display = 'block';
                    return;
                }
                errorMsg.style.display = 'none';
                btn.disabled = true;
                btn.innerText = 'Procesando...';

                try {
                    const response = await fetch('/api/auth/reset-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: '${token}', password })
                    });
                    
                    if(response.ok) {
                        document.getElementById('form-card').style.display = 'none';
                        document.getElementById('success-card').style.display = 'block';
                    } else {
                        const err = await response.json();
                        alert(err.message || 'Error al cambiar la contraseña');
                        btn.disabled = false;
                        btn.innerText = 'Cambiar Contraseña';
                    }
                } catch (err) {
                    alert('Error de conexión');
                    btn.disabled = false;
                    btn.innerText = 'Cambiar Contraseña';
                }
            });
        </script>
    </body>
    </html>
    `;
};
