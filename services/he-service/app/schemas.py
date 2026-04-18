from pydantic import BaseModel, Field


class FeatureVector(BaseModel):
    values: list[float] = Field(..., min_length=1)
    schemaVersion: str = "iris-v1"


class EncryptedPayload(BaseModel):
    ciphertext: str
    publicMetadataHash: str
    clientKeyId: str | None = None


class FheArtifactInfo(BaseModel):
    clientArtifactsReady: bool
    serverArtifactsReady: bool
    artifactDirectory: str
    expectedFiles: list[str]
    runtimeMode: str


class EvaluationKeyRegistrationRequest(BaseModel):
    clientKeyId: str
    evaluationKeysBase64: str


class EvaluationKeyRegistrationResponse(BaseModel):
    clientKeyId: str
    registered: bool
    receivedAt: str


class EncryptedInferenceSubmission(BaseModel):
    encryptedPayload: EncryptedPayload
    modelVersion: int = Field(..., ge=1)
    evaluationKeyId: str


class EncryptedPredictionRequest(BaseModel):
    encryptedPayload: EncryptedPayload
    modelVersion: int = Field(..., ge=1)


class PredictionResponse(BaseModel):
    predictionId: str
    encryptedResult: str
    modelVersion: int


class ModelInfoResponse(BaseModel):
    modelName: str
    status: str
    framework: str
    supportedFeatureCount: int
    latestModelVersion: int
    datasetName: str | None = None
    trainSampleCount: int | None = None
    testSampleCount: int | None = None
    featureNames: list[str] | None = None
    evaluationAccuracy: float | None = None
    fheArtifacts: FheArtifactInfo | None = None
