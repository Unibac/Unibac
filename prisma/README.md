# Prisma + Supabase

## Variables de entorno

Prisma CLI carga **`.env` y luego `.env.local`** (igual que Next.js). Pon las URLs reales en `.env.local` o en `.env`; si ambos existen, gana `.env.local`.

Copia las URLs desde **Supabase → Project Settings → Database**:

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | Pooler (puerto **6543**, `?pgbouncer=true`) — runtime con `PrismaClient` + adapter |
| `DIRECT_URL` | Conexión directa (puerto **5432**) — CLI: migrate, pull, studio |

Ejemplo (sustituye `[project-ref]`, `[password]`, región):

```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

### Supabase Auth (cliente Next.js)

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` o `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública del cliente (`@supabase/ssr`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor (admin API, operaciones privilegiadas) |

### Traiker (uploads de imágenes)

| Variable | Uso |
|----------|-----|
| `TRAIKER_API_BASE_URL` | Base URL del API Traiker |
| `TRAIKER_USR` | Usuario de servicio |
| `TRAIKER_PSW` | Contraseña de servicio |

Sin estas variables, los endpoints de upload responden 503.

## Campo `authUserId`

La tabla `USUARIOS` incluye `AUTH_USER_ID` (`authUserId` en Prisma): UUID opcional y único que enlaza el registro local con el usuario de **Supabase Auth**. Se rellena al registrar o vincular cuentas; permite resolver sesión cookie/JWT → fila `Usuario` para RBAC y datos de dominio.

## Comandos (desde la raíz del repo)

| Script | Acción |
|--------|--------|
| `npm run db:generate` | Genera el cliente en `src/generated/prisma` |
| `npm run db:pull` | Introspecta tablas existentes en Supabase → `schema.prisma` |
| `npm run db:push` | Aplica el schema sin migraciones (prototipo) |
| `npm run db:migrate` | Crea y aplica migraciones |
| `npm run db:studio` | GUI de datos |
| `npm run db:seed` | Catálogo RBAC + usuarios demo en Postgres y Supabase Auth |

### Seed (`npm run db:seed`)

Requiere **`DIRECT_URL`** (o `DATABASE_URL`), **`NEXT_PUBLIC_SUPABASE_URL`** y **`SUPABASE_SERVICE_ROLE_KEY`**.

Crea módulos, acciones, roles, permisos y usuarios con `authUserId` vinculado a Supabase Auth (email interno `usuario@auth.unibac.local`). Credenciales por defecto:

| Usuario | Clave |
|---------|-------|
| `administrador` (o `SEED_ADMIN_USUARIO`) | `admin123` (o `SEED_ADMIN_PASSWORD`) |
| `demo_emprendimiento`, `demo_ferias_interno` | `demo123` (o `SEED_DEMO_PASSWORD`) |

Re-ejecutar el seed es idempotente (upsert + actualización de contraseña en Auth).

## Cliente en la app

Importar solo en servidor (Route Handlers, Server Actions, scripts):

```ts
import { prisma } from "@/lib/prisma";
```

No usar `prisma` en componentes cliente ni exponer `DIRECT_URL`.

## Capa API

Los contratos JSON compartidos entre Route Handlers (`src/app/api/**`) y wrappers del frontend viven en `src/modules/shared/types/api-models.ts`. Los wrappers llaman `/api/*` con `fetchApi`; no hay codegen OpenAPI.
