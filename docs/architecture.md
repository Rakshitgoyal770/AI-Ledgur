# Architecture

## Components

### `apps/web`

React + Vite + TypeScript application for:

- wallet connection
- local encryption and decryption UX
- contribution submission
- ledger event history
- privacy explanations and success banners

### `services/he-service`

Python API that will own:

- synthetic healthcare dataset generation
- 90/10 train-test split management
- model training and evaluation
- Concrete ML artifact generation
- encrypted inference orchestration

### `contracts`

Hardhat + fhEVM workspace using a template-style layout:

- `contracts/` for Solidity
- `deploy/` for deployment scripts
- `tasks/` for custom Hardhat tasks
- `test/` for ledger event tests

### `packages/shared`

Type-safe interfaces shared across:

- the React frontend
- the contracts workspace
- the Python HE service

## Runtime Topology

- `web`: Vite dev server
- `he-service`: FastAPI + Concrete ML container
- `contracts`: Hardhat + fhEVM local/testnet workspace
