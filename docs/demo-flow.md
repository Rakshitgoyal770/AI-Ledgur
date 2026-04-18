# Demo Flow

1. Frontend loads model metadata and ledger history
2. Client prepares encrypted input locally
3. Evaluation keys are registered with the HE service
4. HE service runs private inference
5. Ledger records contribution and prediction request metadata
6. Client decrypts the returned prediction locally
