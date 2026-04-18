# HE Service

Phase 1 prepares the FastAPI service for Concrete ML v1.9.0 client/server deployment.

## Planned Endpoints

- `GET /model/info`
- `POST /encrypt`
- `POST /predict`
- `POST /train/encrypted` (stretch)

## Docker First

Concrete ML dependencies are intended to run inside Docker for this monorepo. Phase 2 will wire:

- `FHEModelDev`
- `FHEModelClient`
- `FHEModelServer`
- optional `fit_encrypted=True` training demo
