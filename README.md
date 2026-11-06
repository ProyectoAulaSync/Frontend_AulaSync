# AulaSync · Frontend (Salón de Estudio Colaborativo)

React + TypeScript + Vite + Tailwind CSS. Consume la API (`backend-api`); **nunca** consulta Firestore directamente.

## Requisitos

- Node.js 20+ y npm
- Docker y Docker Compose (opcional)

## Variables de entorno

```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API (local `http://localhost:3001`, producción la URL de Render) |

El archivo `.env` está en `.gitignore`. No subas credenciales al repositorio.

## Ejecutar en desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
```

Otros comandos: `npm run typecheck`, `npm run lint`, `npm run build`, `npm run preview`.

## Ejecutar con Docker

Solo el frontend:

```bash
docker build --build-arg VITE_API_URL=http://localhost:3001 -t aulasync-frontend .
docker run --rm -p 3000:80 aulasync-frontend
```

Todo el sistema (frontend + backend-api + backend-realtime). Requiere `backend_AulaSync` como carpeta hermana y su `backend-api/.env` con las credenciales de Firebase:

```bash
docker compose up --build
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001 (Swagger en `/api-docs`) |
| Realtime | http://localhost:3002/health |

## Rutas

`/` inicio · `/ingreso` · `/registro` · `/panel` · `/perfil` · `/salas/:id` · `/ayuda` · `/terminos` · `/privacidad` · `/accesibilidad` · `/base-tecnica` (prueba extremo a extremo: muestra el dato de Firestore con estados cargando, error con «Reintentar» y éxito) · cualquier otra ruta muestra la página 404.

## Despliegue en Vercel

1. Importa el repositorio, framework **Vite**.
2. Define `VITE_API_URL` con la URL de la API en Render.
3. [vercel.json](vercel.json) incluye el rewrite para recargar rutas como `/panel`.
4. La API debe permitir CORS desde el dominio de Vercel.

## Estructura

```
src/
├─ components/   Layout, Mensaje, ErrorBoundary
├─ hooks/        usePageTitle (título único y foco al h1)
├─ pages/        Inicio, BaseTecnica, NotFound, ErrorPage, PaginaPendiente
├─ services/     api.ts (única capa que habla con la API)
└─ index.css     tokens de la guía visual
```
