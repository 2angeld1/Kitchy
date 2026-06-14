# Vesta Market Mobile 📱 — El POS del Futuro

![Vesta Market Banner](https://img.shields.io/badge/Vesta Market-Mobile-rose?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-000?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**Vesta Market Mobile** es la pieza central del ecosistema Vesta Market. Una aplicación híbrida construida con **Expo** y **React Native**, diseñada para ofrecer una experiencia de usuario fluida, rápida y estéticamente superior para dueños de negocios en Panamá.

## 🚀 Características Principales

- **Multi-Tenant / Multi-Negocio:** Soporte nativo para Comida, Belleza y Fruterías con interfaces adaptativas.
- **Caitlyn AI Core:** Integración directa con nuestro motor de IA para estrategias de ventas y análisis de costos.
- **Dashboard en Tiempo Real:** Visualización de métricas críticas, ventas del día y estado del inventario.
- **Gestión Offline-First:** Arquitectura preparada para el manejo eficiente de datos.
- **Diseño Premium:** Animaciones fluidas con `react-native-reanimated` y modo oscuro nativo.

## 🛠️ Stack Tecnológico

- **Framework:** [Expo](https://expo.dev/) (SDK 50+)
- **Lenguaje:** TypeScript
- **Estilos:** StyleSheet con Sistema de Temas Dinámico
- **Iconografía:** Lucide React Native & Ionicons
- **Comunicación:** Axios & Socket.io-client
- **Legal:** Integración con WebView/Linking para documentación legal dinámica.

## 📦 Instalación y Setup

1. **Clonar e Instalar:**
   ```bash
   cd Mobile
   npm install
   ```

2. **Configurar Variables de Entorno:**
   Crea un archivo `.env` en la raíz de la carpeta `Mobile` con el siguiente formato:
   ```env
   EXPO_PUBLIC_APP_VERSION="1.0.1"
   EXPO_PUBLIC_API_URL="http://TU_IP:5000"
   EXPO_PUBLIC_FRONTEND_URL="http://TU_IP:3000"
   CAITLYN_URL="http://TU_IP:8000"
   ```

3. **Iniciar Proyecto:**
   ```bash
   npx expo start
   ```

## 📂 Estructura de Carpetas

- `/src/screens`: Pantallas principales (Ventas, Inventario, Caitlyn, etc.).
- `/src/components`: Componentes atómicos y moléculas reutilizables.
- `/src/hooks`: Lógica de negocio extraída y reusable.
- `/src/context`: Gestión de estado global (Temas, Auth, etc.).
- `/src/theme`: Tokens de diseño y paletas de colores.

---

Desarrollado con ❤️ por **Gosen Tech** en Panamá Oeste.
