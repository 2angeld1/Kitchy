---
title: Política de Privacidad
---

# POLÍTICA DE PRIVACIDAD

## **Kitchy — Sistema Integral de Punto de Venta con Inteligencia Artificial**

**Última actualización:** 29 de abril de 2026  
**Versión:** 1.0

---

En Kitchy valoramos tu privacidad. Esta Política de Privacidad explica de manera transparente qué datos recopilamos, cómo los usamos, con quién los compartimos, y qué derechos tienes sobre ellos.

Al utilizar Kitchy, aceptas las prácticas descritas en este documento.

---

## 1. ¿Quién es el responsable de tus datos?

**Responsable del tratamiento:**  
Gosen Tech  
Domicilio: Panamá Oeste, República de Panamá  
Correo de contacto: adfp21900@gmail.com

---

## 2. ¿Qué datos recopilamos?

### 2.1. Datos que tú nos proporcionas directamente

| Categoría | Datos | Momento |
|-----------|-------|---------|
| **Registro de cuenta** | Nombre, correo electrónico, contraseña | Al crear tu cuenta |
| **Datos del negocio** | Nombre del negocio, RUC, categoría (Comida/Belleza/Frutería), dirección, teléfono, logo, horarios | Al configurar tu negocio |
| **Productos** | Nombres, descripciones, precios, costos, imágenes, categorías | Al gestionar tu catálogo |
| **Ventas** | Detalle de transacciones, montos, métodos de pago, fecha/hora | Al registrar ventas |
| **Inventario** | Stock, movimientos, costos unitarios, proveedores | Al gestionar inventario |
| **Clientes** | Nombres, teléfonos, historial de compras | Al registrar clientes |
| **Especialistas** | Nombres, turnos, horarios, comisiones | Al gestionar tu equipo |
| **Reservas** | Citas, fechas, servicios, clientes asociados | Al usar el módulo de reservas |
| **Gastos** | Concepto, monto, categoría, fecha | Al registrar gastos |
| **Feedback** | Opiniones y encuestas de tus clientes | Al usar módulos de feedback |
| **Soporte** | Mensajes que nos envías solicitando ayuda | Al contactar soporte |

### 2.2. Datos que recopilamos automáticamente

| Dato | Propósito |
|------|-----------|
| **Dirección IP** | Seguridad y prevención de abuso |
| **Tipo de dispositivo y navegador** | Optimización de la experiencia de usuario |
| **Sistema operativo** | Compatibilidad del servicio |
| **Fecha y hora de acceso** | Registros de actividad (logs) |
| **Versión de la aplicación** | Control de actualizaciones |

### 2.3. Datos de ubicación

Si utilizas funcionalidades basadas en ubicación (como rutas o contexto de mercado local), podemos acceder a tu ubicación geográfica. Este acceso **siempre requiere tu permiso explícito** a través de la configuración de tu dispositivo. Puedes revocar este permiso en cualquier momento.

### 2.4. Datos procesados por la Inteligencia Artificial

Cuando utilizas a **Caitlyn** (nuestro asistente de IA), los siguientes datos pueden ser procesados para generar respuestas:

- Información de tus productos e inventario (para costeo y sugerencias).
- Imágenes que envíes (para análisis de visión por computadora).
- Consultas de texto o voz (para el agente conversacional).
- Tu historial de viajes (para predicción de rutas, si usas esa función).

---

## 3. ¿Para qué usamos tus datos?

| Finalidad | Base legal |
|-----------|-----------|
| Operar el Servicio y todas sus funcionalidades | Ejecución del contrato |
| Procesar tus ventas, inventario y reportes | Ejecución del contrato |
| Autenticarte y proteger tu cuenta | Interés legítimo (seguridad) |
| Generar sugerencias y análisis con IA (Caitlyn) | Ejecución del contrato |
| Enviarte notificaciones del sistema (alertas de stock bajo, actualizaciones) | Ejecución del contrato |
| Enviarte comunicaciones sobre tu cuenta y facturación | Ejecución del contrato |
| Mejorar el Servicio con datos agregados y anónimos | Interés legítimo |
| Cumplir obligaciones legales o regulatorias | Obligación legal |
| Prevenir fraude y abuso | Interés legítimo (seguridad) |

**No vendemos tus datos personales a terceros. Nunca.**

---

## 4. ¿Con quién compartimos tus datos?

Solo compartimos tus datos con los proveedores de servicios estrictamente necesarios para el funcionamiento de Kitchy:

| Proveedor | Servicio | Datos compartidos |
|-----------|----------|-------------------|
| **MongoDB Atlas** | Base de datos en la nube | Todos los datos del negocio (almacenados de forma encriptada) |
| **Cloudinary** | Almacenamiento de imágenes | Fotos de productos que subes |
| **Google (Gemini API)** | Inteligencia Artificial | Consultas a Caitlyn (texto de productos, recetas, inventario) |
| **SendGrid / Nodemailer** | Correo electrónico | Tu correo electrónico y contenido de notificaciones |
| **OpenWeatherMap** | Datos climáticos | Coordenadas de ubicación (si la otorgas) |
| **Cohere** | Búsqueda semántica | Texto de consultas al agente |
| **Vercel / Railway** | Hosting | Datos en tránsito hacia los servidores |
| **OSRM** | Cálculo de rutas | Coordenadas de origen y destino |

**Fuentes públicas consultadas por Caitlyn:**
- **ACODECO** — Precios de la canasta básica y control de precios (Panamá).
- **Merca Panamá / IMA** — Precios de productos frescos.
- **SNE** — Precios de combustibles.

Estas fuentes son de acceso público y no se les envían datos personales del usuario.

### Compartición por obligación legal

Podemos divulgar tus datos si estamos legalmente obligados a hacerlo (orden judicial, solicitud de autoridad competente, o para proteger los derechos y la seguridad de Kitchy y sus usuarios).

---

## 5. ¿Cómo protegemos tus datos?

Implementamos medidas de seguridad técnicas y organizativas, incluyendo:

| Medida | Detalle |
|--------|---------|
| **Encriptación de contraseñas** | Todas las contraseñas se almacenan encriptadas con bcrypt. Ni nosotros podemos ver tu contraseña. |
| **Autenticación por token** | Usamos JSON Web Tokens (JWT) para verificar tu identidad en cada solicitud. |
| **CORS restringido** | Solo los dominios autorizados de Kitchy pueden comunicarse con nuestros servidores. |
| **HTTPS** | Todas las comunicaciones están cifradas en tránsito. |
| **Separación de entornos** | Los entornos de desarrollo y producción están aislados. |
| **Acceso limitado** | Solo el personal autorizado tiene acceso a la infraestructura de producción. |

Ningún sistema es 100% seguro. Si descubrimos una brecha de seguridad que afecte tus datos, te notificaremos en un plazo razonable.

---

## 6. ¿Cuánto tiempo conservamos tus datos?

| Situación | Retención |
|-----------|-----------|
| **Cuenta activa** | Mientras tu cuenta esté activa y vigente |
| **Después de cancelar tu cuenta** | 30 días (para que puedas exportar tus datos) |
| **Datos de facturación** | Según lo requiera la legislación fiscal panameña (mínimo 5 años) |
| **Logs del sistema** | Máximo 90 días |
| **Datos anonimizados y agregados** | Indefinidamente (no te identifican) |

Transcurridos los plazos, tus datos serán eliminados de forma permanente e irreversible.

---

## 7. Tus Derechos

Como usuario, tienes los siguientes derechos sobre tus datos personales:

| Derecho | Descripción |
|---------|-------------|
| **Acceso** | Puedes solicitar una copia de todos los datos que tenemos sobre ti. |
| **Rectificación** | Puedes corregir datos inexactos o incompletos desde la aplicación o solicitándolo por correo. |
| **Eliminación** | Puedes solicitar la eliminación de tu cuenta y todos tus datos personales. |
| **Portabilidad** | Puedes solicitar la exportación de tus datos en formatos estándar (CSV, PDF, Excel). |
| **Oposición** | Puedes oponerte al uso de tus datos para fines no esenciales. |
| **Limitación** | Puedes solicitar que limitemos el procesamiento de tus datos en ciertas circunstancias. |
| **Revocar consentimiento** | Puedes retirar cualquier consentimiento otorgado en cualquier momento. |

Para ejercer cualquiera de estos derechos, escríbenos a: **adfp21900@gmail.com**

Responderemos a tu solicitud en un plazo máximo de **15 días hábiles**.

---

## 8. Menores de Edad

Kitchy está diseñado para ser utilizado por personas mayores de **18 años** o con la mayoría de edad legal en su jurisdicción. No recopilamos intencionalmente datos de menores de edad. Si descubrimos que hemos recopilado datos de un menor, los eliminaremos de inmediato.

---

## 9. Cookies y Almacenamiento Local

La versión web de Kitchy puede utilizar:

| Tecnología | Propósito |
|------------|-----------|
| **AsyncStorage / LocalStorage** | Almacenar tu sesión y preferencias (tema oscuro/claro) localmente en tu dispositivo |
| **Tokens JWT** | Mantener tu sesión activa |

No utilizamos cookies de seguimiento de terceros ni cookies publicitarias.

---

## 10. Transferencias Internacionales de Datos

Tus datos pueden ser procesados en servidores ubicados fuera de Panamá (dependiendo de la ubicación de los servidores de MongoDB Atlas, Vercel, y otros proveedores). Estos proveedores cumplen con estándares de seguridad internacionales.

---

## 11. Cambios a esta Política

Podemos actualizar esta Política de Privacidad periódicamente. Cuando lo hagamos:

- Actualizaremos la fecha de "Última actualización" al inicio del documento.
- Para cambios significativos, te notificaremos por correo electrónico o mediante un aviso dentro de la aplicación con al menos **15 días** de antelación.

---

## 12. Contacto

Si tienes preguntas, dudas o solicitudes sobre tus datos personales, contáctanos:

📧 **Correo:** adfp21900@gmail.com  
📱 **Teléfono:** 68014613  
🌐 **Web:** kitchy-one.vercel.app/privacy  
📍 **Dirección:** Panamá Oeste, República de Panamá

---

*Tu privacidad es importante para nosotros. Gracias por confiar en Kitchy.* 🔒
