# sabhoy.es

Portal hiperlocal **SAB Hoy** para San Antonio de Benagéber (Camp de Túria, Valencia). Misma arquitectura que lelianahoy.es: Next.js App Router + TypeScript + Tailwind + Prisma (PostgreSQL).

## Stack

- Frontend: Next.js (App Router)
- Backend: API Routes de Next.js
- Base de datos: **PostgreSQL** (Docker con `docker-compose.yml`) + Prisma ORM y migraciones versionadas
- Estilos: Tailwind CSS
- CI/CD: GitHub Actions (CI + deploy por SSH en servidor)

## Base de datos (Docker)

En **produccion** la `DATABASE_URL` apunta a tu Postgres (a menudo `127.0.0.1:5432` o el puerto que use Docker alli).

En **local/producción**, el `docker-compose.yml` mapea el contenedor a **`127.0.0.1:5436`** (en el VPS: 5432 turnodejuego, 5434 lelianahoy, 5435 sermestre).

```bash
cp .env.example .env
make db-up
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

`make db-down` para parar el contenedor. El volumen `sabhoy_pgdata` persiste los datos.

Si el puerto del host aun asi lo tienes pillado, cambia en `docker-compose.yml` el mapeo (p. ej. `127.0.0.1:5437:5432`) y el mismo puerto en `DATABASE_URL` del `.env`.

## Diseno (fase 1)

- Home: heroe editorial (noticia con `isHero` o la mas reciente), accesos rapidos, feed de noticias, carril con actualizaciones y categorias, denuncias y evergreen
- **Categorias de noticias** (enum en Prisma): General, Politica local, Sucesos, Cultura, Deporte — filtros en `/noticias?categoria=...`
- **Tipografia** Source Sans 3 (Google Fonts), estilo local / periodico
- **SEO**: descripcion ampliada, metadatos Open Graph en noticias, JSON-LD `NewsArticle` en el detalle
- Ruta **Eventos** (`/eventos`) de momento informativa (calendario en fase posterior)

## Funcionalidades MVP

- Home con secciones anteriores
- Noticias:
  - Campos: `summary`, `category`, `isHero` (un solo heroe: el API limpia el resto)
  - CRUD por API (`/api/news`)
  - Listado publico con filtros (`/noticias`)
  - Detalle (`/noticias/[slug]`)
- Denuncias:
  - Formulario publico (`/denuncias/nueva`)
  - Flujo de estado (`pending`, `reviewed`, `published`)
  - Listado publico de publicadas (`/denuncias`)
- Informacion util:
  - Paginas evergreen (`/[slug]`)
  - Listado (`/informacion-util`)
  - Edicion desde admin
- Admin:
  - Cuentas con email/contrasena (NextAuth); quien es admin se define con `ADMIN_EMAILS` en `.env` (solo correos, no contrasenas en claro en el entorno)
  - Gestion de noticias, denuncias y paginas evergreen

## Rutas clave

- `/` inicio
- `/noticias`
- `/eventos` (placeholder)
- `/denuncias`
- `/denuncias/nueva`
- `/informacion-util`
- `/cuenta/registro`, `/cuenta/iniciar-sesion`
- `/admin` (solo usuarios con rol admin)

## Variables de entorno

Duplica `.env.example` a `.env` y revisa al menos `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` y `ADMIN_EMAILS` (emails de administradores; ver comentarios en el ejemplo).

### API de noticias (token)

Para **crear, editar o borrar noticias** sin usar el panel (`/admin`), define en `.env` un **`NEWS_API_TOKEN`** (cadena larga, mínimo 16 caracteres). El servidor lo lee en arranque.

**Cabeceras válidas** (una de las dos):

- `Authorization: Bearer <tu-token>`
- `X-API-Key: <tu-token>`

Si `NEWS_API_TOKEN` está vacío o no cumple la longitud mínima, solo seguirá valiendo la **sesión de admin** (cookie).

**Crear artículo (ejemplo):**

```bash
curl -sS -X POST "https://www.sabhoy.es/api/news" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "title": "Titular",
    "content": "Cuerpo del articulo...",
    "summary": "Resumen opcional para cards y SEO",
    "category": "GENERAL",
    "isHero": false,
    "imageUrl": "https://..."
  }'
```

Categorias: `GENERAL`, `POLITICA_LOCAL`, `SUCESOS`, `CULTURA`, `DEPORTE`.

**Listado (GET /api/news)**: ahora es público; si quisieras ocultarlo, se puede añadir el mismo token en otra iteración.

## Arranque local

Con PostgreSQL ya levantado (`make db-up`):

```bash
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

En **produccion** (o CI) se usa `npx prisma migrate deploy` (no `db push`).

Nueva migracion `20250423120000_article_categories_hero` anade categorias y resumen a `Article` (tras pull: `npx prisma migrate deploy` en el server).

## Seed incluido

El seed crea:

- 3 noticias
- 5 denuncias
- 13 paginas evergreen (incluye las rutas solicitadas)

## GitHub Actions

- `.github/workflows/ci.yml`: instala, genera Prisma, lint y build.
- `.github/workflows/deploy-main.yml`: despliegue por SSH al hacer push en `main`, en `/opt/sabhoy.es`.

### Secrets necesarios para deploy

Configura en GitHub:

- `DEPLOY_HOST`: IP o dominio del servidor.
- `DEPLOY_USER`: usuario SSH con permisos en `/opt/sabhoy.es`.
- `DEPLOY_SSH_KEY`: clave privada SSH.
- `DEPLOY_PORT` (opcional): puerto SSH (por defecto `22`).
- `DEPLOY_SERVICE` (opcional): nombre del servicio systemd sin `.service` (por defecto `lelianahoy`).

### Deploy automatico (sin entrar al server)

El workflow remoto ejecuta:

1. `cd /opt/sabhoy.es`
2. `git fetch origin main`, `git clean` (conserva `.env`, `node_modules`, `.next`, `public/media`) y `git checkout -B main origin/main`
3. Cargar `/opt/sabhoy.es/.env` si existe; el script aplica **por defecto** `DATABASE_URL=postgresql://lelianahoy:lelianahoy@127.0.0.1:5432/lelianahoy` (debe coincidir con tu Postgres).
4. Si existe `docker-compose.yml`, **`docker compose up -d`** (así el deploy tira de Postgres sin entrar a mano).
5. `npm ci --include=dev`
6. `npx prisma migrate deploy` (aplica migraciones)
7. `npm run build`
8. `systemctl restart <DEPLOY_SERVICE>.service`

`prisma db seed` **no** va en el deploy automático (sobrescribiria/actualizaria datos de ejemplo en cada push). Ejecutalo a mano una vez en el server si hace falta.

**La primera vez** en el servidor asegúrate de tener `docker compose` y el stack de BBDD (el paso 4 del workflow ya hace `up -d` en cada despliegue). Crea `/opt/sabhoy.es/.env` (y/o `EnvironmentFile` en `systemd`) con la misma `DATABASE_URL` que apunte a ese Postgres, por ejemplo:

```bash
DATABASE_URL="postgresql://lelianahoy:lelianahoy@127.0.0.1:5434/lelianahoy"
NEXT_PUBLIC_SITE_URL="https://www.sabhoy.es"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://www.sabhoy.es"
ADMIN_EMAILS="tu@correo.com"
```

Tras el primer despliegue, puedes cargar datos de ejemplo: `npx prisma db seed` (por SSH una vez, o tarea aparte).

**Node en el server:** el proyecto se ha probado con Node 20+; en el server con Node 18 veras avisos `EBADENGINE` en `npm ci`. Recomendable: instalar Node 20 LTS (nvm o paquetes oficiales).

Con esto, cada push a `main` despliega automaticamente con los **secrets** configurados y, **una sola vez en el servidor**, la unidad systemd cuyo nombre coincide con `DEPLOY_SERVICE` (por defecto `lelianahoy` → `lelianahoy.service`).

### Crear el servicio systemd (una vez)

Con el repositorio ya en `/opt/sabhoy.es` (incluido el fichero `deploy/lelianahoy.service` en el repo):

```bash
sudo cp /opt/sabhoy.es/deploy/lelianahoy.service /etc/systemd/system/lelianahoy.service
# Ajusta User/Group en el .service si el directorio no lo posee root (mismo usuario que el de deploy, recomendable)
sudo systemctl daemon-reload
sudo systemctl enable lelianahoy.service
```

El **primer** `systemctl start` puede fallar hasta que en ese path exista `node_modules` y un build (tras un deploy que ejecute `npm ci` y `npm run build`). A partir de ahí, `systemctl restart lelianahoy.service` en cada deploy deberia funcionar.
