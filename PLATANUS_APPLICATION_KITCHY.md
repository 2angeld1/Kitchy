# 🚀 Platanus Ventures — Aplicación Kitchy (Batch 2026-1)

> **Deadline: 21 de Mayo de 2026 (Postulación Tardía)**
> **Programa: Junio - Septiembre 2026**
> **Inversión: USD $200,000 por 7%**

---

## 👤 Fundador

| Campo | Detalle |
|-------|---------|
| **Nombre** | Angel Fernandez |
| **Empresa** | Gosen Tech |
| **Ubicación** | Panamá Oeste, República de Panamá |
| **Rol** | Solo Founder / CTO / Full-Stack Developer |
| **Contacto** | adfp21900@gmail.com · +507 6801-4613 |

### ¿Por qué soy el equipo correcto?
Soy el fundador técnico que Platanus busca: **yo escribo cada línea de código**. No dependo de terceros, agencias ni freelancers. He construido 3 productos funcionales en paralelo (Kitchy, Muelle, AgroLink), todos desde cero, con arquitectura profesional (SOLID, Clean Architecture, microservicios).

**Stack que domino:**
- Mobile: React Native + Expo + TypeScript
- Backend: Node.js + Express + MongoDB Atlas
- Web: Next.js 16
- IA: Python + FastAPI + Google Gemini API + Cohere
- Infraestructura: Cloudinary, SendGrid, Socket.io (Real-time)

---

## 🍽️ ¿Qué es Kitchy?

**Kitchy es un sistema POS (Punto de Venta) potenciado por IA, diseñado para automatizar la gestión de negocios tradicionales en Latinoamérica** — restaurantes, barberías, fruterías, salones de belleza — que hoy operan con cuadernos, calculadoras y WhatsApp.

### El Problema (¿Por qué existe Kitchy?)

En Latinoamérica, la falta de **orden y control** es un mal endémico que afecta a negocios de todos los tamaños: desde el food truck de la esquina hasta empresas con múltiples sucursales. Sin datos en tiempo real, el dueño es ciego.

- **Micro y Pequeñas:** Mueren por falta de orden (confunden caja con ganancia).
- **Medianas y Grandes:** Se estancan o pierden millones por falta de control sobre sus inventarios, mermas y costos variables.

Kitchy soluciona esto para todos. No es solo un software de ventas; es un **sistema operativo empresarial** que devuelve el control al dueño a través de la automatización y la IA.

### La Solución: Kitchy + Caitlyn (IA)

Kitchy no es "otro POS". Es un **ecosistema completo de gestión** con un cerebro de IA llamado **Caitlyn** que transforma datos crudos en decisiones de negocio.

---

## 🧠 Caitlyn: El Motor de IA (Nuestra Ventaja Competitiva)

Caitlyn es un microservicio en **Python/FastAPI** que hace algo que ningún POS en Latinoamérica hace:

### Sistema de Costeo Inteligente de 3 Niveles:
1. **Nivel 1 — Inventario Real:** Usa el costo unitario que el dueño registró en su inventario.
2. **Nivel 2 — Datos de Mercado en Tiempo Real:** Si no hay stock registrado, Caitlyn busca automáticamente los precios en:
   - **ACODECO** (Autoridad de Protección al Consumidor — precios de control).
   - **Merca Panamá / IMA** (precios de productos frescos del mercado mayorista).
   - **SNE** (precios de combustible para calcular costos de transporte).
3. **Nivel 3 — Estimación por IA:** Como último recurso, Caitlyn usa Google Gemini para estimar costos basados en su conocimiento local. Nunca devuelve $0.00.

### Capacidades adicionales:
- **Sugerencia de Recetas con Costeo:** Le dices "quiero hacer ceviche" y Caitlyn te dice exactamente cuánto te cuesta producirlo, de dónde sacó cada precio, y cuánto deberías cobrar.
- **Análisis de Imágenes (Visión Computacional):** Toma foto de un producto y Caitlyn lo identifica.
- **Agente Conversacional:** Interacción por texto y voz para dueños que no son "tech-savvy".
- **Predicción con ML:** Modelo de Machine Learning entrenado con los datos del propio negocio.

---

## 📱 El Producto: Lo que YA está Construido (No es un mockup)

### Arquitectura de Microservicios:
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Mobile App     │────▶│  Backend API     │────▶│  Caitlyn (IA)   │
│  React Native   │     │  Node/Express    │     │  Python/FastAPI  │
│  Expo + TS      │     │  MongoDB Atlas   │     │  Gemini + Cohere │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│  Frontend Web   │     │  Servicios Cloud │
│  Next.js 16     │     │  Cloudinary      │
│  Landing/Legal  │     │  SendGrid        │
└─────────────────┘     └──────────────────┘
```

### Módulos Operativos (18 controladores, 15 modelos de datos, 18 hooks):

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| **Punto de Venta (POS)** | ✅ Funcional | Carrito, ITBMS, cierre de caja, historial |
| **Inventario** | ✅ Funcional | Stock, movimientos, alertas, importación CSV, reportes PDF/Excel |
| **Productos** | ✅ Funcional | Catálogo con imágenes en la nube, precios, costos, categorías |
| **Dashboard** | ✅ Funcional | Estadísticas en tiempo real con gráficos y actualización automática |
| **Gastos** | ✅ Funcional | Registro y categorización de gastos operativos |
| **Finanzas** | ✅ Funcional | Vista consolidada de ingresos, egresos y rentabilidad |
| **Usuarios y Roles** | ✅ Funcional | Empleados con roles y permisos personalizados |
| **Especialistas** | ✅ Funcional | Turnos, horarios, calendario de citas |
| **Comisiones** | ✅ Funcional | Sistema fijo/escalonado + bonos + comisión por reventa |
| **Reservas** | ✅ Funcional | Agenda y sistema de citas con calendario |
| **Clientes** | ✅ Funcional | Base de datos de clientes del negocio |
| **Encuestas/Feedback** | ✅ Funcional | NPS y recopilación de opiniones |
| **Marketing** | ✅ Funcional | Herramientas de estrategia |
| **Presupuestario** | ✅ Funcional | Planificación financiera |
| **Modo Belleza** | ✅ Funcional | Dashboard, resumen y ventas especializadas para salones |
| **Caitlyn IA** | ✅ Funcional | Costeo inteligente, recetas, visión, agente conversacional |
| **Menú Configurable** | ✅ Funcional | Cada negocio personaliza su interfaz |
| **Soporte** | ✅ Funcional | Canal directo de comunicación |

---

## 📊 Tracción y Métricas

| Métrica | Dato |
|---------|------|
| **Pilotos Activos** | 2 beta testers activos (validando valor) |
| **Prospectos (Pipeline)** | 7 clientes potenciales en espera |
| **Categorías Validadas** | Restaurantes, Barberías/Salones de Belleza, Fruterías |
| **Precio Piloto** | $35/año (tarifa especial — no refleja precio de mercado) |
| **Módulos Construidos** | 18 módulos funcionales |
| **Líneas de Código** | ~500K+ (Mobile + Backend + IA + Web) |
| **Marco Legal** | Contratos de licenciamiento, Términos de Servicio, Política de Privacidad |

### Estado Actual: Pre-Revenue (Validación Estratégica)

Actualmente, Kitchy opera con **beta testers seleccionados** bajo un modelo de "feedback por uso". No hemos escalado el cobro aún por dos razones estratégicas:

1. **Validación de Impacto Social:** Uno de nuestros pilotos es un negocio vinculado a una organización sin fines de lucro (Iglesia), donde estamos validando cómo Kitchy ayuda a la transparencia y orden en entidades comunitarias.
2. **Búsqueda de Product-Market Fit "en frío":** Mi enfoque actual es captar más restaurantes independientes que no tengan relación previa conmigo. Necesito validar que el valor del **orden y control** es tan alto que un dueño de restaurante desconocido esté dispuesto a pagar el precio Full desde el día 1.

Estamos a una "conversación de valor" de convertir los testers actuales en clientes pagados, pero preferimos priorizar la robustez del software y la captación de nuevos nichos antes de cerrar la fase beta.

---

## 💰 Modelo de Negocio: SaaS B2B

| Plan | Precio Mensual | Público Objetivo |
|------|---------------|-----------------|
| **Básico** | $15-25/mes | Negocios pequeños (1-3 empleados) |
| **Pro** | $45-65/mes | Negocios medianos con especialistas y comisiones |
| **Enterprise** | $99+/mes | Cadenas y franquicias con múltiples sucursales |
| **Caitlyn Premium** | +$20/mes (Add-on) | Acceso completo a IA (costeo, recetas, predicción) |

### Mercado Objetivo (TAM → SAM → SOM):

- **TAM (Total):** 2.1M de micro/pequeños negocios en Centroamérica y el Caribe.
- **SAM (Serviceable):** 180K negocios de comida, belleza y retail en Panamá, Costa Rica y Colombia.
- **SOM (Obtainable, Año 1-2):** 500 negocios en Panamá pagando un promedio de $35/mes = **$210,000 ARR**.

---

## 🗺️ Roadmap de Ejecución (Próximos 12 meses)

Mi plan con los $200,000 es extremadamente eficiente. No busco quemar dinero en burocracia, sino en **enfocarme y vender**:

## 🗺️ Roadmap de Ejecución (Estrategia de Paralelo)

Mi plan con los $200,000 es activar una **fuerza de choque** inmediata para dominar el mercado local mientras preparo el salto regional. Todo se ejecuta en paralelo desde el Mes 1:

| Acción | Objetivo Estratégico | Equipo |
|---------|-----------------------|--------|
| **Foco 24/7** | Dedicar el 100% de mi capacidad técnica a robustecer Caitlyn e infraestructura. | Founder (CTO/CEO) |
| **Venta Masiva** | Captar 20-30 nuevos comercios por mes mediante venta directa y digital. | 2 Vendedores B2B |
| **Calidad Total** | Cero bugs. Cada nueva feature se valida antes de llegar al cliente. | 1 QA / Tester |
| **Orden Administrativo** | Gestión fiscal, nómina y cumplimiento legal en Panamá y Delaware. | 1 Contador (Part-time) |

### Hitos de Tracción (Mes 1 - 12):
- **Q1:** Independencia del Founder + Contratación del equipo base + Setup en Delaware.
- **Q2:** Alcanzar las primeras 100 licencias pagadas en Panamá.
- **Q3:** Optimización de Caitlyn basada en datos reales de 100+ negocios.
- **Q4:** Preparación de expansión a Costa Rica/Colombia (Mercados con alta densidad de PYMES).

### Distribución del Capital:
- **70% - Operación y Ventas:** Salarios del equipo (Sales, QA, Admin) y mi subsistencia.
- **15% - Crecimiento:** Presupuesto para pauta digital y adquisición de leads.
- **15% - Infraestructura:** AWS/MongoDB Atlas y reserva técnica.

---

## 🏆 ¿Por qué Kitchy? (Ventaja Competitiva)

1. **IA que entiende Latinoamérica:** Caitlyn no es ChatGPT con un wrapper. Es un sistema que sabe cuánto cuesta el tomate en Merca Panamá HOY, y te dice si tu ceviche es rentable o si estás perdiendo plata.

2. **Multi-vertical:** Kitchy ya funciona para comida, belleza y fruterías. El "Modo Belleza" con comisiones por especialista no lo tiene ningún POS en la región a este precio.

3. **Solo Founder Técnico:** Cada dólar va a producto, no a pagar una agencia de desarrollo. Yo soy el que programa, diseña la arquitectura y habla con los clientes.

4. **Contratos Legales desde el Día 1:** Mientras otros startups en etapa temprana operan "de palabra", Kitchy ya tiene contratos de licenciamiento profesionales con cláusulas de IP, confidencialidad y limitación de responsabilidad.

5. **Data Moat (Foso de Datos):** Cada negocio que usa Kitchy alimenta a Caitlyn con datos reales de costos, ventas y márgenes. Entre más negocios usen Kitchy, más inteligente se vuelve Caitlyn para todos. **Efecto de red.**

---

## 🎯 Pregunta para Platanus

**¿Qué necesito de ustedes además del capital?**

1. **Red de distribución en México y Chile:** Kitchy es "plug & play" para cualquier mercado hispanohablante. Solo necesito adaptar las fuentes de datos de precios (de ACODECO a PROFECO en México, por ejemplo).
2. **Mentoría en Growth/Sales:** Sé programar como un animal, pero necesito aprender a vender como uno. Mi debilidad es el go-to-market.
3. **Estructura corporativa en Delaware:** Para estar listo cuando llegue la ronda Seed de inversionistas más grandes.

---

## 📎 Materiales Adicionales

- **Demo en vivo:** Disponible en cualquier momento (la app corre en mi celular, no dependo de Wi-Fi).
- **Repositorio privado:** Puedo dar acceso al código para due diligence técnica.
- **Contrato de Piloto (muestra):** Disponible como ejemplo de formalización legal.

---

> *"Kitchy nació en la calle. Yo tenía un food truck y sufría cada noche sumando cuadernos de ventas y cuadrando inventarios que nunca daban. Mi cuñada manejaba la operación y yo necesitaba ver en vivo qué pasaba con mi negocio. Como programador y dueño, me di cuenta de que un POS manual no era suficiente; necesitaba automatización real. Hoy, Kitchy es el cerebro que me hubiera salvado el negocio a mí, y que ya está ayudando a mis primeros beta testers en sectores de comida, belleza y retail."*
>
> — Angel Fernandez, Founder de Kitchy

---

**Aplicar en:** [platan.us/postular](https://platan.us/postular)
**Deadline:** 21 de Mayo de 2026
