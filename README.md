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

## Logo y favicon

El logo de cabecera y los favicons se generan desde `assets/logo-source.png`:

```bash
npm run brand:assets
```

Eso actualiza `public/branding/logo-sabhoy.png`, `public/icons/*`, `public/favicon.ico` y `app/icon.png`. Tras cambiar el logo, commitea esos ficheros y haz push a `main` (el deploy incluye `public/` en el bundle).

En el **servidor**, si hace falta regenerar a mano: `cd /opt/sabhoy.es && npm run brand:assets` (requiere `assets/logo-source.png` y `npm ci`).

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

En **produccion** (o CI) se usa `npm run prisma:deploy` (Prisma **5** del proyecto; no uses `npx prisma` a pelo, que puede instalar Prisma 7).

Nueva migracion `20250423120000_article_categories_hero` anade categorias y resumen a `Article` (tras pull: `npx prisma migrate deploy` en el server).

## Seed incluido

El seed crea:

- 3 noticias
- 5 denuncias
- 13 paginas evergreen (incluye las rutas solicitadas)

## GitHub Actions

- `.github/workflows/ci.yml`: instala, genera Prisma, lint y build.
- `.github/workflows/deploy-main.yml`: despliegue por SSH al hacer push en `main`, en `/opt/sabhoy.es`.

### Git en el servidor (fetch desde GitHub)

El deploy hace `git fetch origin main` en `/opt/sabhoy.es`. El usuario SSH (`DEPLOY_USER`) necesita:

1. **Host de GitHub en `known_hosts`** (el workflow lo añade en cada deploy; también puedes hacerlo una vez a mano):
   ```bash
   ssh-keyscan -t ed25519 github.com >> ~/.ssh/known_hosts
   ```
2. **Clave de solo lectura (deploy key)** si el repo es privado:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_github -N "" -C "sabhoy-vps"
   cat ~/.ssh/id_ed25519_github.pub
   ```
   Añade la pública en GitHub → **Settings** → **Deploy keys** (read-only). Luego `~/.ssh/config`:
   ```
   Host github.com
     HostName github.com
     User git
     IdentityFile ~/.ssh/id_ed25519_github
     IdentitiesOnly yes
   ```
   Comprueba: `ssh -T git@github.com` y `cd /opt/sabhoy.es && git fetch origin main`.

### Secrets necesarios para deploy

Configura en GitHub:

- `DEPLOY_HOST`: IP o dominio del servidor.
- `DEPLOY_USER`: usuario SSH con permisos en `/opt/sabhoy.es`.
- `DEPLOY_SSH_KEY`: clave privada SSH.
- `DEPLOY_PORT` (opcional): puerto SSH (por defecto `22`).
- `DEPLOY_SERVICE` (opcional): nombre del servicio systemd sin `.service` (por defecto `sabhoy`).

### Reinicio sin contraseña sudo (recomendado en el VPS)

Si el deploy de GitHub falla con `sudo: a password is required`, el script intentará reiniciar con `npm run start` en el puerto **3003**. Para usar **systemd** (mejor), crea el servicio y permite `sudo` sin contraseña para el usuario de deploy:

```bash
sudo cp /opt/sabhoy.es/deploy/sabhoy.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable sabhoy.service
sudo visudo -f /etc/sudoers.d/sabhoy-deploy
```

Añade (sustituye `deployuser` por `DEPLOY_USER`):

```
deployuser ALL=(ALL) NOPASSWD: /bin/systemctl reload-or-restart sabhoy.service, /bin/systemctl is-active sabhoy.service, /bin/systemctl stop sabhoy.service
```

Sin esto, el CI sigue funcionando vía reinicio por puerto; asegúrate de que **no** haya otro proceso en el **3003** (el **3001** lo usa sermestre.es en el mismo VPS).

### Caddy (reverse proxy)

Snippet en `deploy/Caddyfile.snippet`. Tras editar `/etc/caddy/Caddyfile`:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

### Puertos HTTP en el VPS (referencia)

| Puerto | Sitio |
|--------|--------|
| 3000 | lelianahoy.es |
| 3001 | sermestre.es |
| 3002 | beterahoy.es |
| **3003** | **sabhoy.es** |

Caddy debe hacer `reverse_proxy` de `www.sabhoy.es` a **`127.0.0.1:3003`**, no al 3001.

### Si redirige a `https://www.sabhoy.es:3001/es` (timeout)

Síntomas: `307` a URL con **`:3001`** y **`/es`** o **`/va`**, cookie `NEXT_LOCALE`, título «Ser Mestre».

**Causa:** Caddy de `www.sabhoy.es` apunta al **3001** (sermestre), no al **3003** (sabhoy).

**Comprobar:**

```bash
ss -tlnp | grep -E ':300[0-3]'
systemctl is-active sabhoy sermestre
curl -sI -H 'Host: www.sabhoy.es' http://127.0.0.1:3003/ | head -5
curl -s http://127.0.0.1:3003/ | grep -o '<title>[^<]*'
```

**Arreglo:** Caddy → `3003`, `systemctl restart sabhoy`, `.env` con URLs sin puerto, redesplegar `main`.

### Deploy automatico (sin entrar al server)

El workflow remoto ejecuta:

1. `cd /opt/sabhoy.es`
2. `git fetch origin main`, `git clean` (conserva `.env`, `node_modules`, `.next`, `public/media`) y `git checkout -B main origin/main`
3. Cargar `/opt/sabhoy.es/.env` si existe; el script aplica por defecto `DATABASE_URL` en el puerto **5436** (ver `docker-compose.yml`).
4. Si existe `docker-compose.yml`, **`docker compose up -d`**.
5. `npm ci --include=dev`
6. `npm run prisma:deploy` (Prisma 5 del lockfile, no `npx prisma` suelto)
7. `npm run build`
8. `systemctl restart <DEPLOY_SERVICE>.service`

`prisma db seed` **no** va en el deploy automático. Ejecutalo a mano **una vez** tras el primer despliegue.

**La primera vez** en el servidor (`/opt/sabhoy.es`):

```bash
cp .env.example .env   # editar: NEXTAUTH_SECRET, ADMIN_EMAILS, contraseñas
# DATABASE_URL con puerto 5436 (5435 = sermestre en este VPS)
docker compose up -d
make db-init           # npm ci + migrate + seeds (o los pasos de abajo)
make deploy            # build + systemd
```

Equivalente manual (siempre **después** de `npm ci`):

```bash
npm ci --include=dev
npm run prisma:deploy
npm run prisma:seed
npm run prisma:seed:evergreen
```

`.env` de ejemplo en producción:

```bash
DATABASE_URL="postgresql://sabhoy:sabhoy@127.0.0.1:5436/sabhoy"
NEXT_PUBLIC_SITE_URL="https://www.sabhoy.es"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://www.sabhoy.es"
ADMIN_EMAILS="tu@correo.com"
```

**No uses** `npx prisma …` sin haber hecho `npm ci`: `npx` puede descargar Prisma 7 y fallará con este schema (Prisma 5).

**Node en el server:** el proyecto se ha probado con Node 20+; en el server con Node 18 veras avisos `EBADENGINE` en `npm ci`. Recomendable: instalar Node 20 LTS (nvm o paquetes oficiales).

Con esto, cada push a `main` despliega automaticamente con los **secrets** configurados y, **una sola vez en el servidor**, la unidad systemd `sabhoy.service`.

### Crear el servicio systemd (una vez)

```bash
sudo cp /opt/sabhoy.es/deploy/sabhoy.service /etc/systemd/system/sabhoy.service
# Ajusta User/Group si hace falta (puerto 3003 por defecto)
sudo systemctl daemon-reload
sudo systemctl enable sabhoy.service
```

El **primer** `systemctl start` puede fallar hasta que existan `node_modules` y `.next` (tras `make deploy` o `make db-init` + build).
