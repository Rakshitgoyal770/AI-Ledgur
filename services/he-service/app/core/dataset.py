from dataclasses import dataclass

import numpy as np
from sklearn.model_selection import train_test_split


FEATURE_NAMES = ["age", "bmi", "blood_pressure", "glucose"]
DATASET_NAME = "synthetic-healthcare-risk-v1"


@dataclass(frozen=True)
class DatasetBundle:
    feature_names: list[str]
    x_train: np.ndarray
    x_test: np.ndarray
    y_train: np.ndarray
    y_test: np.ndarray


def generate_synthetic_healthcare_dataset(
    sample_count: int = 240, random_state: int = 42
) -> DatasetBundle:
    rng = np.random.default_rng(random_state)

    age = rng.integers(21, 81, size=sample_count)
    bmi = rng.normal(loc=28, scale=5.5, size=sample_count).clip(17, 45)
    blood_pressure = rng.normal(loc=128, scale=18, size=sample_count).clip(90, 190)
    glucose = rng.normal(loc=118, scale=32, size=sample_count).clip(65, 260)

    raw_score = (
        0.032 * age
        + 0.09 * bmi
        + 0.018 * blood_pressure
        + 0.028 * glucose
        - 8.7
        + rng.normal(0, 0.85, size=sample_count)
    )
    risk_probability = 1 / (1 + np.exp(-raw_score))
    labels = (risk_probability >= 0.5).astype(int)

    features = np.column_stack([age, bmi, blood_pressure, glucose]).astype(float)
    x_train, x_test, y_train, y_test = train_test_split(
        features,
        labels,
        test_size=0.1,
        random_state=random_state,
        stratify=labels,
    )

    return DatasetBundle(
        feature_names=FEATURE_NAMES,
        x_train=x_train,
        x_test=x_test,
        y_train=y_train,
        y_test=y_test,
    )

