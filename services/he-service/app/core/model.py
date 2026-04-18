import base64
import json
from dataclasses import dataclass

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.core.dataset import DATASET_NAME, generate_synthetic_healthcare_dataset
from app.schemas import EncryptedPayload


DEMO_MODEL_NAME = "synthetic-healthcare-logistic-regression"
DEMO_MODEL_VERSION = 1
DEMO_FEATURE_COUNT = 4
DEMO_FRAMEWORK_STATUS = "scaffolded-demo-mode"


@dataclass(frozen=True)
class ModelBundle:
    dataset_name: str
    feature_names: list[str]
    pipeline: Pipeline
    train_sample_count: int
    test_sample_count: int
    evaluation_accuracy: float


def train_demo_model() -> ModelBundle:
    dataset = generate_synthetic_healthcare_dataset()
    pipeline = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("classifier", LogisticRegression(max_iter=500, random_state=42)),
        ]
    )
    pipeline.fit(dataset.x_train, dataset.y_train)
    predictions = pipeline.predict(dataset.x_test)
    accuracy = float(accuracy_score(dataset.y_test, predictions))

    return ModelBundle(
        dataset_name=DATASET_NAME,
        feature_names=dataset.feature_names,
        pipeline=pipeline,
        train_sample_count=int(dataset.x_train.shape[0]),
        test_sample_count=int(dataset.x_test.shape[0]),
        evaluation_accuracy=accuracy,
    )


MODEL_BUNDLE = train_demo_model()


def decode_feature_vector(encrypted_payload: EncryptedPayload) -> np.ndarray:
    decoded = base64.b64decode(encrypted_payload.ciphertext.encode("utf-8")).decode("utf-8")
    payload = json.loads(decoded)
    return np.array(payload["values"], dtype=float).reshape(1, -1)


def run_demo_prediction(encrypted_payload: EncryptedPayload) -> str:
    features = decode_feature_vector(encrypted_payload)
    probability = float(MODEL_BUNDLE.pipeline.predict_proba(features)[0][1])
    label = "high-risk" if probability >= 0.5 else "low-risk"
    return f"{label} (p={probability:.3f})"
