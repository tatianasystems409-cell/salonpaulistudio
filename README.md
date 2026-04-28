# Paulis Studio - Salón de Belleza

Plataforma interactiva para agendamiento de citas y catálogo de servicios de Paulis Studio en Tunja, Boyacá.

## Características

- Agendamiento de citas en tiempo real con Firebase.
- Catálogo de servicios dinámico.
- Panel de administración para gestionar la configuración del sitio (Hero, Campañas, Logos).
- Integración con Firebase (Firestore & Auth).
- Envío de correos de confirmación vía Resend.
- Diseño responsive y elegante con Tailwind CSS y Framer Motion.

## Tecnologías

- **Frontend:** React + Vite + TypeScript
- **Styling:** Tailwind CSS + Framer Motion
- **Backend:** Node.js + Express (Proxy para API)
- **Base de Datos & Auth:** Firebase
- **Email:** Resend

## Requisitos Previos

- Node.js (v18+)
- Una cuenta de Firebase
- Una API Key de Resend (opcional, para correos)

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repo>
   cd paulis-studio-beauty-salon
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   Copia `.env.example` a `.env` y rellena los valores necesarios.

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

El servidor correrá en `http://localhost:3000`.

## Construcción para Producción

Para generar el build estático y preparar para producción:

```bash
npm run build
npm start
```

## Despliegue en Vercel

Este proyecto es totalmente compatible con Vercel. Sigue estos pasos:

1. Conecta tu repositorio de GitHub a Vercel.
2. Vercel detectará automáticamente la configuración de Vite y usará `vercel.json` para las rutas de la API.
3. Configura las siguientes variables de entorno en el panel de Vercel (Settings > Environment Variables):
   - `RESEND_API_KEY`: Tu clave de API de Resend.
   - `GEMINI_API_KEY`: Tu clave de API de Google Gemini.
   - (Cualquier otra variable necesaria de tu archivo `.env`).

Vercel servirá el frontend de forma estática desde `dist/` y las rutas bajo `/api` se ejecutarán como Serverless Functions usando `api/index.ts`.
