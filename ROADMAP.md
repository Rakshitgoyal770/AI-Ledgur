# Privacy-Preserving AI Ledger Roadmap

## Vision

Build a demo-ready Proof of Concept where users can:

1. Encrypt feature data locally
2. Record encrypted contributions on a blockchain ledger
3. Run private inference against a homomorphically compatible model
4. Decrypt predictions only on the client side
5. Inspect immutable ledger history for contributions and model versions

## Phase Breakdown

### Phase 1: Foundation

1. Create the full monorepo scaffold
2. Add `docker-compose.yml` for frontend, HE service, and Hardhat
3. Add shared TypeScript and Python contracts
4. Set up Hardhat with an fhEVM-template-style layout

### Phase 2: Concrete ML HE Service

1. Implement `LogisticRegression` client/server deployment with `FHEModelDev`, `FHEModelClient`, and `FHEModelServer`
2. Add `/model/info`, `/encrypt`, and `/predict` endpoints
3. Add a stretch encrypted-training path with `SGDClassifier(fit_encrypted=True)`

### Phase 3: fhEVM Ledger

1. Add the `AILedger.sol` contract
2. Publish model versions on-chain
3. Record encrypted contribution hashes/CIDs and prediction request events

### Phase 4: Frontend

1. Add wallet connection and ledger timeline
2. Add upload/encrypt/decrypt flows with privacy badges and tooltips
3. Render on-chain event history in a polished UI

### Phase 5: End-to-End + Polish

1. Add demo walkthrough docs
2. Add HE inference and contract-event tests
3. Make the Docker Compose path one-command runnable

## Why Logistic Regression Instead of Naive Bayes

For this MVP, `Concrete ML LogisticRegression` is the closest practical replacement for Naive Bayes.

- Logistic regression is directly supported by Concrete ML's scikit-learn-like workflow.
- It is far easier to compile and run for encrypted inference than a custom Naive Bayes implementation.
- It still gives us a simple linear classifier that is easy to explain during a demo.
- We can preserve the same product story: encrypted training assets, encrypted inference, and ledgered model/version history.

Future iteration:

- Explore encrypted retraining with `SGDClassifier` or a custom linear update pipeline if buildathon time allows.

## MVP Scope

### Must Have

1. React + TypeScript frontend
2. Python HE service using Concrete ML
3. fhEVM smart contract for immutable contribution and model metadata logging
4. Sample encrypted contribution flow
5. Private prediction flow
6. Ledger history UI
7. End-to-end setup docs

### Nice to Have

1. IPFS pinning for encrypted payload blobs
2. Model version switching in UI
3. Access log events for private prediction requests
4. Retraining job triggered from contributed encrypted datasets

## Architecture

### Frontend

- React + TypeScript app
- Lets users:
  - enter sample features
  - encrypt locally or via client-side helper flow
  - submit encrypted contributions
  - request private prediction
  - decrypt prediction locally
  - browse ledger events and model versions

### HE Service

- Python FastAPI service
- Uses Concrete ML to:
  - train a demo logistic regression model on a synthetic healthcare dataset
  - quantize/compile the model
  - expose client/server artifacts for encryption and inference
  - return encrypted predictions
- Acts as the off-chain heavy-compute bridge when on-chain HE execution is too expensive for the MVP

### Blockchain Layer

- fhEVM Solidity contract on testnet
- Stores:
  - encrypted or committed contribution references
  - contributor address
  - model version identifiers
  - prediction/access request logs
  - hashes or IPFS CIDs for encrypted blobs

### Storage Layer

- Start with on-chain hashes + local/dev blob storage
- Upgrade path: IPFS for encrypted datasets and client artifacts

## Proposed Project Structure

```text
my-code-limit/
  README.md
  ROADMAP.md
  apps/
    web/
      src/
        components/
        pages/
        hooks/
        lib/
      package.json
      tsconfig.json
      vite.config.ts
  contracts/
    src/
      AILedger.sol
    script/
      DeployAILedger.s.sol
    test/
    package.json
    hardhat.config.ts
  services/
    he-service/
      app/
        api/
        core/
        schemas/
        artifacts/
      requirements.txt
      Dockerfile
      README.md
  packages/
    shared/
      src/
        abi/
        types/
  docs/
    architecture.md
    demo-flow.md
    deployment.md
```

## Build Plan

### Phase 1: Foundation

Goal: create a stable repo layout and shared interfaces.

Tasks:

1. Scaffold frontend, contracts, and Python service folders
2. Define shared data models:
   - contribution record
   - model version
   - prediction request
   - ledger event
3. Add env templates and local configuration docs

Deliverable:

- Repo structure compiles at the file level

### Phase 2: Concrete ML Private Inference

Goal: make encrypted inference work end-to-end off-chain first.

Tasks:

1. Generate a synthetic healthcare dataset and split it 90/10
2. Train logistic regression on the 90% training set
2. Compile model with Concrete ML
3. Export client/server artifacts
4. Create API routes:
   - `/health`
   - `/model/info`
   - `/contributions/encrypt`
   - `/predictions/encrypt`
   - `/predictions/run`
5. Return encrypted prediction payloads that only the client can decrypt

Deliverable:

- Working private inference service with a healthcare-style train/test story and sample ciphertext round-trip

### Phase 3: fhEVM Ledger

Goal: immutably record contributions and model metadata.

Tasks:

1. Create `AILedger.sol`
2. Add structs/events for:
   - contribution registered
   - model version published
   - prediction access logged
3. Store blob hashes, CIDs, encrypted handles, and version numbers
4. Add deployment config for fhEVM testnet

Deliverable:

- Deployable ledger contract with event history

### Phase 4: Frontend Integration

Goal: connect user actions to both the HE service and blockchain.

Tasks:

1. Create contribution form
2. Create private prediction form
3. Add wallet connection
4. Add ledger timeline view
5. Add status banners and privacy tooltips

Deliverable:

- Demo UI showing encrypted contribution and encrypted prediction flows

### Phase 5: End-to-End Demo Flow

Goal: prove the full story works for judges and reviewers.

Tasks:

1. User enters sample data
2. Frontend encrypts or obtains encrypted payload package
3. Contract records contribution metadata
4. User requests encrypted prediction against the trained healthcare-risk model
5. HE service computes over encrypted-compatible artifacts using the 90/10 evaluation framing
6. Ledger logs access event
7. Client decrypts final result

Deliverable:

- Scripted demo flow with screenshots or walkthrough notes

### Phase 6: Stretch Goals

Tasks:

1. IPFS integration
2. Simple model re-training pipeline on contributed encrypted-style data
3. Multiple model versions
4. Role-based access controls
5. Better charts for contributions and predictions

## Step-By-Step Execution Order

1. Scaffold folder structure and config files
2. Implement the Python HE service first
3. Implement and document the Solidity ledger contract
4. Build the React frontend against mocked APIs
5. Replace mocks with real API and chain calls
6. Run a polished demo pass

## Success Criteria

The MVP is successful if:

1. A user can submit a contribution that is recorded on-chain
2. The app can perform a private prediction workflow on healthcare-style inputs without exposing plaintext to the ledger
3. The frontend clearly shows model version, contribution history, and prediction logs
4. The project is runnable with documented setup steps

## Risks and Mitigations

### Concrete ML on Windows

Risk:

- Native installation is limited on Windows

Mitigation:

- Run the HE service in Docker or WSL
- Keep the frontend and contracts runnable independently

### Full On-Chain Training

Risk:

- Training directly on-chain is unlikely to fit buildathon time or cost constraints

Mitigation:

- Log contributions and model versions on-chain
- Perform heavy HE computation off-chain
- Verify/version results on-chain for the MVP

### fhEVM Tooling Drift

Risk:

- APIs and templates may change across releases

Mitigation:

- Use current official templates and isolate blockchain integration behind shared service helpers

## Current Status

Phase 1 is the current target. The repository should be treated as a scaffold until the real Concrete ML artifacts and fhEVM event wiring land in the next phases.
