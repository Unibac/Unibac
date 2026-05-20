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

## Comandos (desde la raíz del repo)

| Script | Acción |
|--------|--------|
| `npm run db:generate` | Genera el cliente en `src/generated/prisma` |
| `npm run db:pull` | Introspecta tablas existentes en Supabase → `schema.prisma` |
| `npm run db:push` | Aplica el schema sin migraciones (prototipo) |
| `npm run db:migrate` | Crea y aplica migraciones |
| `npm run db:studio` | GUI de datos |

## Cliente en la app

Importar solo en servidor (Route Handlers, Server Actions, scripts):

```ts
import { prisma } from "@/lib/prisma";
```

No usar `prisma` en componentes cliente ni exponer `DIRECT_URL`.
