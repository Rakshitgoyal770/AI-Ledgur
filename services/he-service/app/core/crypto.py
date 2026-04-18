import base64
import hashlib
import json
import uuid

from app.schemas import EncryptedPayload, FeatureVector


def canonicalize_feature_vector(feature_vector: FeatureVector) -> str:
    payload = {
        "schemaVersion": feature_vector.schemaVersion,
        "values": feature_vector.values,
    }
    return json.dumps(payload, separators=(",", ":"), sort_keys=True)


def package_feature_vector(feature_vector: FeatureVector) -> tuple[EncryptedPayload, str]:
    canonical = canonicalize_feature_vector(feature_vector)
    checksum = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    ciphertext = base64.b64encode(canonical.encode("utf-8")).decode("utf-8")

    payload = EncryptedPayload(
        ciphertext=ciphertext,
        publicMetadataHash=checksum,
        clientKeyId=f"demo-client-key-{uuid.uuid4().hex[:8]}",
    )
    return payload, checksum


def package_prediction(result: str, model_version: int) -> tuple[str, str]:
    plaintext = json.dumps(
        {"result": result, "modelVersion": model_version},
        separators=(",", ":"),
        sort_keys=True,
    )
    ciphertext = base64.b64encode(plaintext.encode("utf-8")).decode("utf-8")
    prediction_id = f"pred_{uuid.uuid4().hex[:12]}"
    return prediction_id, ciphertext

