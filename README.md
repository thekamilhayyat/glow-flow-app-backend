# Glowflow Backend (NestJS + Postgres)

Dockerized NestJS backend aligned to the Glowdesk FE API docs and extended features (public booking, payments/deposits, client portal, notifications, upsells, multi-service/group bookings, waitlist, reporting).

## Quick start (Docker)

```bash
cd docker
docker compose up -d
# API: http://localhost:3000/api/v1/health
# Swagger: http://localhost:3000/api/docs
# Postgres: localhost:5432 (postgres/postgres)
# PgAdmin:  http://localhost:5050 (admin@local.test / admin)
```

## Scripts

```bash
npm run start:dev
npm run build && npm start
npm run migration:generate
npm run migration:run
```

## Notes
- Env vars are read from process environment (see docker-compose). Provide `.env` locally.
- TypeORM synchronize is disabled; use migrations.

