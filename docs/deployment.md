# Deployment Notes

## Docker Compose

Phase 1 standardizes local setup through `docker-compose.yml`.

```powershell
copy .env.example .env
docker compose up --build
```

## Frontend

- Vite app served on `http://localhost:5173`
- Reads chain and HE service config from `.env`

## HE Service

- Docker-first because Concrete ML dependencies are easiest to manage in Linux containers
- Exposes FastAPI on `http://localhost:8000`
- Phase 2 will add real `client.zip` and `server.zip` generation

## Blockchain

- Contracts package is prepared for local Hardhat and Sepolia-style deployment wiring
- Phase 3 will add the real fhEVM ledger deployment flow
