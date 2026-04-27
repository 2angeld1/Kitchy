export const getFeedbackPage = (ventaId: string, negocio: any, stars: any) => {
    const colorPrincipal = '#ec4899'; 

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Tu opinión nos importa - ${negocio.nombre}</title>
        <style>
            * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
            body { 
                font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
                background-color: #fdf2f8; 
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
                max-width: 420px; 
                width: 100%; 
                text-align: center; 
            }
            .logo { 
                max-width: 70px; 
                margin-bottom: 20px; 
                border-radius: 18px; 
                box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
            }
            h1 { 
                font-size: 22px; 
                color: #1f2937; 
                margin-bottom: 8px; 
                font-weight: 700; 
                letter-spacing: -0.5px;
            }
            p { 
                color: #64748b; 
                font-size: 15px; 
                line-height: 1.6; 
                margin: 0 0 30px 0; 
            }
            .stars-container { 
                display: flex; 
                justify-content: center; 
                gap: 10px; 
                margin-bottom: 25px; 
            }
            .star { 
                font-size: 40px; 
                color: #f1f5f9; 
                cursor: pointer; 
                transition: transform 0.2s, color 0.2s; 
            }
            .star.active { color: #fbbf24; }
            .star:active { transform: scale(0.9); }
            
            .input-group { 
                text-align: left; 
                margin-bottom: 15px; 
            }
            label { 
                display: block; 
                font-size: 13px; 
                font-weight: 600; 
                color: #94a3b8; 
                margin-bottom: 6px; 
                padding-left: 4px;
            }
            textarea { 
                width: 100%; 
                border: 1.5px solid #f1f5f9; 
                background-color: #f8fafc;
                border-radius: 14px; 
                padding: 14px 18px; 
                font-size: 15px; 
                resize: none; 
                outline: none; 
                transition: all 0.2s; 
                font-family: inherit;
            }
            textarea:focus { 
                border-color: ${colorPrincipal}; 
                background-color: white;
                box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.1);
            }
            .submit-btn { 
                background-color: ${colorPrincipal}; 
                color: white; 
                border: none; 
                padding: 18px; 
                border-radius: 14px; 
                font-weight: bold; 
                font-size: 16px; 
                cursor: pointer; 
                width: 100%; 
                margin-top: 5px;
                box-shadow: 0 6px 20px rgba(236,72,153,0.25); 
                transition: all 0.2s; 
            }
            .submit-btn:active { transform: scale(0.98); }
            .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            
            .success-view { display: none; }

            @media (max-width: 480px) {
                body { padding: 15px; }
                .card { padding: 30px 20px; }
                h1 { font-size: 20px; }
                .star { font-size: 36px; gap: 6px; }
                .stars-container { gap: 6px; }
            }

            /* Estilos para el Puente de Google */
            .google-bridge {
                margin-top: 25px;
                padding-top: 20px;
                border-top: 1px dashed #e2e8f0;
                display: none;
            }
            .google-btn {
                background: white;
                color: #4285F4;
                border: 2px solid #4285F4;
                padding: 14px;
                border-radius: 12px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                text-decoration: none;
                margin-top: 15px;
                transition: all 0.2s;
            }
            .google-btn:active {
                background: #f8faff;
                transform: scale(0.98);
            }
            .copy-badge {
                background: #4285F4;
                color: white;
                font-size: 10px;
                padding: 2px 8px;
                border-radius: 20px;
                text-transform: uppercase;
                margin-bottom: 5px;
                display: inline-block;
            }
        </style>
    </head>
    <body>
        <div class="card" id="main-card">
            ${negocio.logo ? `<img src="${negocio.logo}" class="logo" alt="Logo">` : ''}
            <h1>¿Cómo te fue hoy?</h1>
            <p>Tu experiencia en <strong>${negocio.nombre}</strong> es lo más importante.</p>
            
            <form id="feedback-form">
                <input type="hidden" id="puntuacion" name="puntuacion" value="${stars || 5}">
                <div class="stars-container">
                    <span class="star" data-value="1">★</span>
                    <span class="star" data-value="2">★</span>
                    <span class="star" data-value="3">★</span>
                    <span class="star" data-value="4">★</span>
                    <span class="star" data-value="5">★</span>
                </div>

                <div class="input-group">
                    <label>¿Qué te pareció?</label>
                    <textarea id="comentario" rows="3" placeholder="Cuéntanos tu experiencia (opcional)"></textarea>
                </div>

                <div class="input-group">
                    <label>Sugerencias</label>
                    <textarea id="sugerencias" rows="2" placeholder="¿Cómo podemos mejorar?"></textarea>
                </div>

                <button type="submit" class="submit-btn" id="submit-btn">Enviar Opinión</button>
            </form>
        </div>

        <div class="card success-view" id="success-card">
            <div style="font-size: 50px; margin-bottom: 20px;">✨</div>
            ${negocio.logo ? `<img src="${negocio.logo}" class="logo" alt="Logo">` : ''}
            <h1>¡Muchas Gracias!</h1>
            <p>Hemos recibido tus comentarios. Valoramos mucho tu tiempo y nos ayuda a mejorar para ti en <strong>${negocio.nombre}</strong>.</p>
            
            ${negocio.googleMapsReviewUrl ? `
            <div id="google-bridge" class="google-bridge">
                <span class="copy-badge">¡Hemos copiado tu opinión!</span>
                <p style="margin-bottom: 15px; color: #1f2937; font-weight: 600;">¿Nos apoyas publicando esto en Google Maps?</p>
                <a href="${negocio.googleMapsReviewUrl}" target="_blank" class="google-btn" id="google-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"/>
                    </svg>
                    Publicar en Google Maps
                </a>
            </div>
            ` : ''}

            <p id="footer-msg" style="font-size: 13px; color: #94a3b8; margin-bottom: 0; margin-top: 20px;">Ya puedes cerrar esta ventana.</p>
        </div>

        <script>
            const starsElements = document.querySelectorAll('.star');
            const puntuacionInput = document.getElementById('puntuacion');
            
            function setStars(val) {
                starsElements.forEach(s => {
                    if(parseInt(s.dataset.value) <= val) s.classList.add('active');
                    else s.classList.remove('active');
                });
                puntuacionInput.value = val;
            }

            setStars(${stars || 5});

            starsElements.forEach(star => {
                star.addEventListener('click', () => setStars(parseInt(star.dataset.value)));
            });

            document.getElementById('feedback-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = document.getElementById('submit-btn');
                btn.disabled = true;
                btn.innerText = 'Enviando...';

                const data = {
                    ventaId: '${ventaId}',
                    negocioId: '${negocio._id}',
                    puntuacion: parseInt(puntuacionInput.value),
                    comentario: document.getElementById('comentario').value,
                    sugerencias: document.getElementById('sugerencias').value
                };

                try {
                    const response = await fetch('/api/feedback/submit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    if(response.ok) {
                        document.getElementById('main-card').style.display = 'none';
                        document.getElementById('success-card').style.display = 'block';

                        // Si la nota fue alta y hay link de Google, mostramos el puente
                        const score = parseInt(puntuacionInput.value);
                        const googleBridge = document.getElementById('google-bridge');
                        const comment = document.getElementById('comentario').value;

                        if (score >= 4 && googleBridge && comment.trim().length > 3) {
                            googleBridge.style.display = 'block';
                            document.getElementById('footer-msg').style.display = 'none';
                            
                            // Copiar al portapapeles automáticamente
                            const textarea = document.createElement('textarea');
                            textarea.value = comment;
                            document.body.appendChild(textarea);
                            textarea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textarea);
                        }
                    }
                } catch (err) {
                    alert('Algo salió mal, por favor intenta de nuevo.');
                    btn.disabled = false;
                    btn.innerText = 'Enviar Opinión';
                }
            });
        </script>
    </body>
    </html>
    `;
};
