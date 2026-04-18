from dataclasses import dataclass


@dataclass(slots=True)
class Contribution:
    id: int
    contributor: str
    encrypted_blob_uri: str
    blob_hash: str
    model_version: int
    created_at: str


@dataclass(slots=True)
class ModelVersion:
    version: int
    artifact_hash: str
    artifact_uri: str
    created_at: str


@dataclass(slots=True)
class PredictionResult:
    prediction_id: str
    encrypted_result: str
    model_version: int

