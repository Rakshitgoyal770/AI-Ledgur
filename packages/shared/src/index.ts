export type ContributionRecord = {
  id: number;
  contributor: string;
  encryptedBlobUri: string;
  blobHash: string;
  modelVersion: number;
  createdAt: string;
};

export type ModelVersionRecord = {
  version: number;
  artifactHash: string;
  artifactUri: string;
  createdAt: string;
};

export type PredictionAccessRecord = {
  id: number;
  requester: string;
  modelVersion: number;
  requestHash: string;
  createdAt: string;
};

export type PredictionResult = {
  predictionId: string;
  encryptedResult: string;
  modelVersion: number;
};

export type EncryptedPayload = {
  ciphertext: string;
  publicMetadataHash: string;
  clientKeyId?: string;
};

export type FheArtifactInfo = {
  clientArtifactsReady: boolean;
  serverArtifactsReady: boolean;
  artifactDirectory: string;
  expectedFiles: string[];
  runtimeMode: "mocked" | "concrete-ml";
};

export type EvaluationKeyRegistrationRequest = {
  clientKeyId: string;
  evaluationKeysBase64: string;
};

export type EvaluationKeyRegistrationResponse = {
  clientKeyId: string;
  registered: boolean;
  receivedAt: string;
};

export type EncryptedInferenceSubmission = {
  encryptedPayload: EncryptedPayload;
  modelVersion: number;
  evaluationKeyId: string;
};

export type EncryptedPredictionRequest = {
  encryptedPayload: EncryptedPayload;
  modelVersion: number;
};

export type PredictionResponse = PredictionResult;

export type ModelInfoResponse = {
  modelName: string;
  status: string;
  framework: string;
  supportedFeatureCount: number;
  latestModelVersion: number;
  datasetName?: string;
  trainSampleCount?: number;
  testSampleCount?: number;
  featureNames?: string[];
  evaluationAccuracy?: number;
  fheArtifacts?: FheArtifactInfo;
};

export const ledgerDemoSummary = [
  "Client generates HE keys and keeps the private key local.",
  "Client encrypts healthcare data locally with Concrete ML client artifacts.",
  "Server runs inference on ciphertext using evaluation keys and model artifacts.",
  "Prediction access is logged without exposing plaintext."
];

export const privacyPrinciples = [
  "Raw healthcare inputs should never be uploaded in plaintext.",
  "The ledger stores immutable commitments, versions, and access history.",
  "Only the client should decrypt the final prediction payload."
];

export { aiLedgerAbi } from "./abi/aiLedger";
