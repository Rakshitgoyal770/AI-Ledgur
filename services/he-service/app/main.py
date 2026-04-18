from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.core.crypto import package_prediction
from app.core.model import (
    DEMO_FRAMEWORK_STATUS,
    DEMO_FEATURE_COUNT,
    DEMO_MODEL_NAME,
    DEMO_MODEL_VERSION,
    MODEL_BUNDLE,
    run_demo_prediction,
)
from app.schemas import (
    EncryptedInferenceSubmission,
    EncryptedPredictionRequest,
    EvaluationKeyRegistrationRequest,
    EvaluationKeyRegistrationResponse,
    FheArtifactInfo,
    ModelInfoResponse,
    PredictionResponse,
)
from app.state import runtime_state

ARTIFACT_DIR = Path(__file__).resolve().parent / "artifacts"
EXPECTED_ARTIFACT_FILES = ["client.zip", "server.zip"]

app = FastAPI(title="Privacy-Preserving AI Ledger HE Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/model/info", response_model=ModelInfoResponse)
def model_info() -> ModelInfoResponse:
    return ModelInfoResponse(
        modelName=DEMO_MODEL_NAME,
        status=DEMO_FRAMEWORK_STATUS,
        framework="Concrete ML (integration pending)",
        supportedFeatureCount=DEMO_FEATURE_COUNT,
        latestModelVersion=DEMO_MODEL_VERSION,
        datasetName=MODEL_BUNDLE.dataset_name,
        trainSampleCount=MODEL_BUNDLE.train_sample_count,
        testSampleCount=MODEL_BUNDLE.test_sample_count,
        featureNames=MODEL_BUNDLE.feature_names,
        evaluationAccuracy=MODEL_BUNDLE.evaluation_accuracy,
        fheArtifacts=FheArtifactInfo(
            clientArtifactsReady=(ARTIFACT_DIR / "client.zip").exists(),
            serverArtifactsReady=(ARTIFACT_DIR / "server.zip").exists(),
            artifactDirectory=str(ARTIFACT_DIR),
            expectedFiles=EXPECTED_ARTIFACT_FILES,
            runtimeMode="mocked",
        ),
    )


@app.get("/fhe/artifacts", response_model=FheArtifactInfo)
def fhe_artifacts() -> FheArtifactInfo:
    return FheArtifactInfo(
        clientArtifactsReady=(ARTIFACT_DIR / "client.zip").exists(),
        serverArtifactsReady=(ARTIFACT_DIR / "server.zip").exists(),
        artifactDirectory=str(ARTIFACT_DIR),
        expectedFiles=EXPECTED_ARTIFACT_FILES,
        runtimeMode="mocked",
    )


@app.post("/fhe/keys/register", response_model=EvaluationKeyRegistrationResponse)
def register_evaluation_keys(
    request: EvaluationKeyRegistrationRequest,
) -> EvaluationKeyRegistrationResponse:
    runtime_state.registered_evaluation_keys[request.clientKeyId] = (
        request.evaluationKeysBase64
    )
    return EvaluationKeyRegistrationResponse(
        clientKeyId=request.clientKeyId,
        registered=True,
        receivedAt=datetime.now(timezone.utc).isoformat(),
    )


@app.post("/fhe/inference", response_model=PredictionResponse)
def run_fhe_inference(request: EncryptedInferenceSubmission) -> PredictionResponse:
    if request.evaluationKeyId not in runtime_state.registered_evaluation_keys:
        raise HTTPException(
            status_code=400,
            detail="Evaluation key is not registered for this client.",
        )

    label = run_demo_prediction(request.encryptedPayload)
    prediction_id, encrypted_result = package_prediction(label, request.modelVersion)

    return PredictionResponse(
        predictionId=prediction_id,
        encryptedResult=encrypted_result,
        modelVersion=request.modelVersion,
    )


@app.post("/predictions/run", response_model=PredictionResponse)
def run_prediction(request: EncryptedPredictionRequest) -> PredictionResponse:
    label = run_demo_prediction(request.encryptedPayload)
    prediction_id, encrypted_result = package_prediction(label, request.modelVersion)

    return PredictionResponse(
        predictionId=prediction_id,
        encryptedResult=encrypted_result,
        modelVersion=request.modelVersion,
    )
