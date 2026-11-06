# Kit base del frontend — Sprint 0

## Paso a paso

1. Crea el proyecto (en tu máquina, con internet):
   ```bash
   npm create vite@latest frontend -- --template react-ts
   cd frontend
   npm install
   npm install react-router-dom lucide-react
   npm install tailwindcss @tailwindcss/vite
   ```
2. Copia los archivos de este kit encima del proyecto, reemplazando los que ya existen:
   - `index.html`, `vite.config.ts`, `Dockerfile`, `nginx.conf`, `.dockerignore`, `vercel.json`, `.env.example`
   - `src/index.css`, `src/App.tsx`
   - `src/components/Layout.tsx`
   - `src/hooks/usePageTitle.ts`
   - `src/services/api.ts`
   - `src/pages/*`
3. Borra los archivos de plantilla que ya no usas: `src/App.css`, `src/assets/react.svg`.
4. En `src/main.tsx` confirma que importa `./index.css` y renderiza `<App />`.
5. Copia `.env.example` a `.env` y pon la URL de la API de Render.
6. Agrega un `public/favicon.svg` (evita el error 404 en consola).
7. Prueba: `npm run dev`, abre `/base-tecnica` y revisa los 3 estados.

## Estructura

```
frontend/
├─ public/favicon.svg
├─ src/
│  ├─ components/Layout.tsx        # enlace de salto, header, nav, main, footer
│  ├─ hooks/usePageTitle.ts        # título único + foco al h1 al navegar
│  ├─ pages/
│  │  ├─ BaseTecnicaPage.tsx       # carga / error (Reintentar) / éxito
│  │  ├─ NotFoundPage.tsx          # 404
│  │  └─ PaginaPendiente.tsx       # marcador para pantallas de otros sprints
│  ├─ services/api.ts              # única capa que habla con la API
│  ├─ App.tsx                      # todas las rutas del mapa del sitio
│  ├─ index.css                    # tokens de la guía visual
│  └─ main.tsx
├─ Dockerfile  nginx.conf  .dockerignore
├─ vercel.json  .env.example  README.md
└─ package.json
```

## Despliegue en Vercel

1. Importa el repo en Vercel (lo hace quien administra la cuenta).
2. Framework: Vite. Variable de entorno: `VITE_API_URL` con la URL de Render.
3. `vercel.json` ya incluye el rewrite para recargar rutas como `/panel`.
4. Pide al BE Lead que habilite CORS en la API para el dominio de Vercel.

## Probar Docker (para la evidencia del Dockerfile)

```bash
docker build --build-arg VITE_API_URL=https://tu-api.onrender.com -t salon-frontend .
docker run --rm -p 3000:80 salon-frontend
```
Recuerda: el docker-compose se arma junto con el BE Lead. La revisión se hace sobre la URL publicada, no en local.

## Lista antes del corte

- [ ] `lang="es"`, título distinto en cada ruta, enlace «Saltar al contenido» (primer Tab).
- [ ] Foco visible en toda la app, navegación completa con teclado.
- [ ] Estados cargando, error con «Reintentar» y éxito en `/base-tecnica`.
- [ ] Consola del navegador sin errores en la URL publicada.
- [ ] Lighthouse Accesibilidad ≥ 90 en `/base-tecnica` (captura).
- [ ] Sin credenciales en el repo; `.env.example` sin valores reales.
- [ ] README con cómo ejecutar el proyecto.
- [ ] PR por historia (TS-00, TS-04) con capturas y declaración de uso de IA.
