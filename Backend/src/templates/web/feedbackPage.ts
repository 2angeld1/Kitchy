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
            <p style="font-size: 13px; color: #94a3b8; margin-bottom: 0;">Ya puedes cerrar esta ventana.</p>
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
