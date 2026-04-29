# Kitchy — Ecosistema POS de Próxima Generación 🚀

![Kitchy Hero](https://img.shields.io/badge/Kitchy-Enterprise_POS-rose?style=for-the-badge)

**Kitchy** es una plataforma integral de Punto de Venta (POS) potenciada por Inteligencia Artificial, diseñada específicamente para transformar la gestión de negocios en Panamá. Desde el control de inventario hasta estrategias de mercado generadas por IA, Kitchy es la herramienta definitiva para dueños de negocios modernos.

## 🏗️ Arquitectura del Ecosistema

El proyecto se basa en una arquitectura de microservicios y clientes especializados:

1.  **[Mobile](./Mobile)**: Aplicación nativa construida con **Expo/React Native**. El corazón operativo del negocio.
2.  **[Backend](./Backend)**: Servidor robusto en **Node.js/Express** con MongoDB. Gestiona la lógica de negocio, seguridad y persistencia.
3.  **[Frontend (Landing)](./Frontend)**: Portal web en **Next.js**. Gestión de documentación legal dinámica y captación de clientes.
4.  **[AI Microservice (Caitlyn)](../IonicNotif/ionic-maps-backend)**: Motor de IA en **Python/FastAPI** que procesa datos de mercado (ACODECO, SNE, Merca Panamá) para ofrecer insights estratégicos.

## 🛠️ Stack Tecnológico Global

-   **Mobile:** React Native, Expo, TypeScript, Reanimated.
-   **Web:** Next.js 16, Tailwind CSS, React Markdown.
-   **Backend:** Node.js, Express, MongoDB Atlas, Socket.io.
-   **IA:** Python, FastAPI, Google Gemini API, Cohere.
-   **Infraestructura:** Cloudinary (Imágenes), SendGrid (Correos), OpenWeather (Clima).

## 🚀 Inicio Rápido

Para poner en marcha todo el ecosistema localmente:

1.  **Backend:** `cd Backend && npm install && npm run dev` (Puerto 5000)
2.  **AI:** `cd ../IonicNotif/ionic-maps-backend && pip install -r requirements.txt && python run.py` (Puerto 8000)
3.  **Frontend:** `cd Frontend && npm install && npm run dev` (Puerto 3000)
4.  **Mobile:** `cd Mobile && npm install && npx expo start`

## ⚖️ Marco Legal y Seguridad

Kitchy incluye un sistema de gestión legal automatizado:
-   **Términos y Condiciones / Privacidad:** Renderizados dinámicamente desde Markdown en el Frontend.
-   **Seguridad:** Encriptación bcrypt, tokens JWT y auditoría de datos.

---

### 📩 Contacto y Soporte
Desarrollado por **Gosen Tech**  
📍 Panamá Oeste, República de Panamá  
📧 [adfp21900@gmail.com](mailto:adfp21900@gmail.com)  
📞 +507 6801-4613

© 2026 Kitchy Technologies. Todos los derechos reservados.
