import { useEffect, useState } from "react";
import type {
  EncryptedPayload,
  EvaluationKeyRegistrationResponse,
  FheArtifactInfo,
  ModelInfoResponse,
  PredictionResponse
} from "@privacy-ai-ledger/shared";
import { ledgerDemoSummary, privacyPrinciples } from "@privacy-ai-ledger/shared";
import {
  fetchFheArtifacts,
  fetchModelInfo,
  getHeServiceUrl,
  registerEvaluationKeys,
  runEncryptedInference
} from "./lib/api";
import { buildEncryptedPayloadFromLocalInput } from "./lib/payload-builder";

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
};

function decodeBase64(value: string): string {
  try {
    return window.atob(value);
  } catch {
    return "Unable to decode payload";
  }
}

export function App() {
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [artifactInfo, setArtifactInfo] = useState<FheArtifactInfo | null>(null);
  const [modelError, setModelError] = useState<string>("");
  const [flowError, setFlowError] = useState<string>("");
  const [clientKeyId, setClientKeyId] = useState<string>("");
  const [evaluationKeysBase64, setEvaluationKeysBase64] = useState<string>("");
  const [localInputText, setLocalInputText] = useState<string>("");
  const [encryptedPayloadText, setEncryptedPayloadText] = useState<string>("");
  const [registrationResult, setRegistrationResult] =
    useState<EvaluationKeyRegistrationResponse | null>(null);
  const [isPreparingPayload, setIsPreparingPayload] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [encryptedPayload, setEncryptedPayload] = useState<EncryptedPayload | null>(
    null
  );
  const [predictionResult, setPredictionResult] =
    useState<PredictionResponse | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadModelInfo() {
      try {
        const result = await fetchModelInfo();
        if (!isMounted) {
          return;
        }
        setModelInfo(result);
        setModelError("");
        const artifacts = await fetchFheArtifacts();
        if (!isMounted) {
          return;
        }
        setArtifactInfo(artifacts);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setModelError(
          error instanceof Error ? error.message : "Failed to load model info"
        );
      }
    }

    void loadModelInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  const decodedPrediction = predictionResult
    ? decodeBase64(predictionResult.encryptedResult)
    : "";

  function appendActivity(title: string, detail: string) {
    setActivity((current) => [
      {
        id: crypto.randomUUID(),
        title,
        detail,
        timestamp: new Date().toLocaleTimeString()
      },
      ...current
    ]);
  }

  function handleEncryptedPayloadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    void file.text().then((text) => {
      setEncryptedPayloadText(text);
      setFlowError("");
    });
  }

  function parseEncryptedPayload(): EncryptedPayload {
    const parsed = JSON.parse(encryptedPayloadText) as EncryptedPayload;
    if (!parsed.ciphertext || !parsed.publicMetadataHash) {
      throw new Error("Encrypted payload must contain ciphertext and publicMetadataHash.");
    }
    return parsed;
  }

  async function handlePreparePayload() {
    if (!clientKeyId) {
      setFlowError("Provide a client key id before preparing a local encrypted payload.");
      return;
    }

    setIsPreparingPayload(true);
    setFlowError("");

    try {
      const payload = await buildEncryptedPayloadFromLocalInput(
        localInputText,
        clientKeyId
      );
      setEncryptedPayloadText(JSON.stringify(payload, null, 2));
      setEncryptedPayload(payload);
      appendActivity(
        "Local payload prepared",
        "Structured healthcare input was converted to the encrypted submission format in the browser."
      );
    } catch (error) {
      setFlowError(
        error instanceof Error
          ? error.message
          : "Failed to prepare encrypted payload locally."
      );
    } finally {
      setIsPreparingPayload(false);
    }
  }

  async function handleRegisterKeys() {
    if (!clientKeyId || !evaluationKeysBase64) {
      setFlowError("Provide a client key id and serialized evaluation keys.");
      return;
    }

    setIsRegistering(true);
    setFlowError("");
    setPredictionResult(null);

    try {
      const result = await registerEvaluationKeys({
        clientKeyId,
        evaluationKeysBase64
      });
      setRegistrationResult(result);
      appendActivity(
        "Evaluation keys registered",
        `Client ${result.clientKeyId} registered public evaluation keys for server-side FHE execution`
      );
    } catch (error) {
      setFlowError(
        error instanceof Error
          ? error.message
          : "Failed to register evaluation keys."
      );
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleRunPrediction() {
    if (!registrationResult) {
      setFlowError("Register evaluation keys before submitting encrypted inference.");
      return;
    }

    setIsPredicting(true);
    setFlowError("");

    try {
      const parsedPayload = parseEncryptedPayload();
      setEncryptedPayload(parsedPayload);
      const result = await runEncryptedInference({
        encryptedPayload: parsedPayload,
        modelVersion: modelInfo?.latestModelVersion ?? 1,
        evaluationKeyId: registrationResult.clientKeyId
      });

      setPredictionResult(result);
      appendActivity(
        "Encrypted prediction returned",
        `Prediction ${result.predictionId} generated for model v${result.modelVersion}`
      );
    } catch (error) {
      setFlowError(
        error instanceof Error
          ? error.message
          : "Failed to request private prediction."
      );
    } finally {
      setIsPredicting(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Codex Buildathon MVP</p>
        <h1>Privacy-Preserving AI Ledger</h1>
        <p className="lede">
          Encrypted data contributions, immutable ledger history, and private
          inference powered by Concrete ML and fhEVM.
        </p>
      </section>

      <section className="status-strip">
        <div className="status-pill">
          <span>HE Service</span>
          <strong>{getHeServiceUrl()}</strong>
        </div>
        <div className="status-pill">
          <span>Model Status</span>
          <strong>{modelInfo?.status ?? "Loading..."}</strong>
        </div>
        <div className="status-pill">
          <span>Latest Version</span>
          <strong>v{modelInfo?.latestModelVersion ?? "-"}</strong>
        </div>
        <div className="status-pill">
          <span>Artifacts</span>
          <strong>{artifactInfo?.runtimeMode ?? "Loading..."}</strong>
        </div>
      </section>

      <section className="grid">
        <article className="card form-card">
          <h2>HE-Only Inference Flow</h2>
          <p className="card-copy">
            This interface no longer asks for raw patient values. Instead, it
            expects client-generated Concrete ML artifacts: serialized
            evaluation keys and an already encrypted payload.
          </p>

          <label className="field">
            <span>Client Key Id</span>
            <input
              type="text"
              value={clientKeyId}
              onChange={(event) => setClientKeyId(event.target.value)}
              placeholder="patient-device-001"
            />
          </label>

          <label className="field">
            <span>Serialized Evaluation Keys (base64)</span>
            <textarea
              value={evaluationKeysBase64}
              onChange={(event) => setEvaluationKeysBase64(event.target.value)}
              placeholder="Paste FHEModelClient.get_serialized_evaluation_keys() output here"
              rows={5}
            />
          </label>

          <label className="field">
            <span>Local Health Input Builder</span>
            <textarea
              value={localInputText}
              onChange={(event) => setLocalInputText(event.target.value)}
              placeholder={'{"age":54,"bmi":31.5,"blood_pressure":142,"glucose":168}'}
              rows={5}
            />
          </label>

          <div className="action-row">
            <button
              className="secondary-button"
              type="button"
              onClick={handlePreparePayload}
              disabled={isPreparingPayload}
            >
              {isPreparingPayload ? "Preparing..." : "Prepare Payload Locally"}
            </button>
          </div>

          <label className="field">
            <span>Encrypted Payload JSON</span>
            <textarea
              value={encryptedPayloadText}
              onChange={(event) => setEncryptedPayloadText(event.target.value)}
              placeholder='{"ciphertext":"...","publicMetadataHash":"...","clientKeyId":"patient-device-001"}'
              rows={6}
            />
          </label>

          <label className="field">
            <span>Or Upload Encrypted Payload File</span>
            <input type="file" accept=".json" onChange={handleEncryptedPayloadFile} />
          </label>

          <div className="action-row">
            <button
              className="primary-button"
              type="button"
              onClick={handleRegisterKeys}
              disabled={isRegistering}
            >
              {isRegistering ? "Registering..." : "Register Evaluation Keys"}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={handleRunPrediction}
              disabled={!registrationResult || !encryptedPayloadText || isPredicting}
            >
              {isPredicting ? "Running..." : "Run Encrypted Inference"}
            </button>
          </div>

          <p className="helper-text">
            The expected real flow is: `FHEModelClient` generates the secret
            key locally, serializes evaluation keys for the server, encrypts the
            payload locally, and only then sends ciphertext here.
          </p>

          <p className="helper-text">
            The local builder below is a browser-side bridge for this repo. It
            keeps raw input out of the backend, but it is still not full
            Concrete ML ciphertext until `client.zip` artifacts are wired in.
          </p>

          {flowError ? <p className="error-text">{flowError}</p> : null}
          {modelError ? <p className="error-text">{modelError}</p> : null}
        </article>

        <article className="card">
          <h2>MVP Flow</h2>
          <ol>
            {ledgerDemoSummary.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </article>

        <article className="card">
          <h2>Privacy Guarantees</h2>
          <ul>
            {privacyPrinciples.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid">
        <article className="card result-card">
          <h2>Registered HE Input</h2>
          {registrationResult || encryptedPayload ? (
            <>
              {registrationResult ? (
                <div className="result-row">
                  <span>Evaluation Key Id</span>
                  <code>{registrationResult.clientKeyId}</code>
                </div>
              ) : null}
              <div className="result-row">
                <span>Model Version</span>
                <code>v{modelInfo?.latestModelVersion ?? "-"}</code>
              </div>
              {encryptedPayload ? (
                <>
                  <div className="result-row">
                    <span>Client Key</span>
                    <code>{encryptedPayload.clientKeyId ?? "not provided"}</code>
                  </div>
                  <div className="payload-box">
                    <span>Ciphertext</span>
                    <code>{encryptedPayload.ciphertext}</code>
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <p className="empty-state">
              No encrypted artifacts loaded yet. Register keys and paste or upload
              a ciphertext payload.
            </p>
          )}
        </article>

        <article className="card result-card">
          <h2>Private Prediction</h2>
          {predictionResult ? (
            <>
              <div className="result-row">
                <span>Prediction Id</span>
                <code>{predictionResult.predictionId}</code>
              </div>
              <div className="result-row">
                <span>Encrypted Result</span>
                <code>{predictionResult.encryptedResult}</code>
              </div>
              <div className="payload-box">
                <span>Client-side Decrypt Preview</span>
                <code>{decodedPrediction}</code>
              </div>
            </>
          ) : (
            <p className="empty-state">
              No prediction response yet. Register evaluation keys and submit an
              encrypted payload first.
            </p>
          )}
        </article>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Model Metadata</h2>
          {modelInfo ? (
            <div className="meta-list">
              <div className="result-row">
                <span>Model</span>
                <code>{modelInfo.modelName}</code>
              </div>
              <div className="result-row">
                <span>Framework</span>
                <code>{modelInfo.framework}</code>
              </div>
              <div className="result-row">
                <span>Dataset</span>
                <code>{modelInfo.datasetName ?? "n/a"}</code>
              </div>
              <div className="result-row">
                <span>Feature Count</span>
                <code>{modelInfo.supportedFeatureCount}</code>
              </div>
              <div className="result-row">
                <span>Artifacts Ready</span>
                <code>
                  client={String(modelInfo.fheArtifacts?.clientArtifactsReady)} server=
                  {String(modelInfo.fheArtifacts?.serverArtifactsReady)}
                </code>
              </div>
            </div>
          ) : (
            <p className="empty-state">
              Waiting for the HE service to return model metadata.
            </p>
          )}
        </article>

        <article className="card">
          <h2>Ledger Activity Preview</h2>
          {activity.length > 0 ? (
            <div className="activity-list">
              {activity.map((item) => (
                <div className="activity-item" key={item.id}>
                  <p className="activity-title">{item.title}</p>
                  <p className="activity-detail">{item.detail}</p>
                  <p className="activity-time">{item.timestamp}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">
              Activity entries will appear here as you register HE artifacts and
              request encrypted inference.
            </p>
          )}
        </article>
      </section>
    </main>
  );
}
