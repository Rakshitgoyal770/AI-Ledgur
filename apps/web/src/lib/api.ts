import type {
  EncryptedInferenceSubmission,
  EvaluationKeyRegistrationRequest,
  EvaluationKeyRegistrationResponse,
  FheArtifactInfo,
  ModelInfoResponse,
  PredictionResponse
} from "@privacy-ai-ledger/shared";

const HE_SERVICE_URL =
  import.meta.env.VITE_HE_SERVICE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${HE_SERVICE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export function getHeServiceUrl(): string {
  return HE_SERVICE_URL;
}

export function fetchModelInfo(): Promise<ModelInfoResponse> {
  return requestJson<ModelInfoResponse>("/model/info");
}

export function fetchFheArtifacts(): Promise<FheArtifactInfo> {
  return requestJson<FheArtifactInfo>("/fhe/artifacts");
}

export function registerEvaluationKeys(
  payload: EvaluationKeyRegistrationRequest
): Promise<EvaluationKeyRegistrationResponse> {
  return requestJson<EvaluationKeyRegistrationResponse>("/fhe/keys/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function runEncryptedInference(
  payload: EncryptedInferenceSubmission
): Promise<PredictionResponse> {
  return requestJson<PredictionResponse>("/fhe/inference", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
