import type { EncryptedPayload } from "@privacy-ai-ledger/shared";

type StructuredHealthRecord = {
  age: number;
  bmi: number;
  blood_pressure: number;
  glucose: number;
  schemaVersion?: string;
};

function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  return crypto.subtle.digest("SHA-256", bytes).then((digest) =>
    Array.from(new Uint8Array(digest))
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("")
  );
}

function normalizeTextRecord(text: string): StructuredHealthRecord {
  const lowered = text.toLowerCase();
  const getValue = (pattern: RegExp, label: string): number => {
    const match = lowered.match(pattern);
    const captured = match?.at(-1);
    if (!captured) {
      throw new Error(`Could not find "${label}" in the provided text.`);
    }
    return Number(captured);
  };

  return {
    age: getValue(/age[^0-9]*([0-9]+(?:\.[0-9]+)?)/, "age"),
    bmi: getValue(/bmi[^0-9]*([0-9]+(?:\.[0-9]+)?)/, "bmi"),
    blood_pressure: getValue(
      /(blood[_\s-]*pressure|bp)[^0-9]*([0-9]+(?:\.[0-9]+)?)/,
      "blood pressure"
    ),
    glucose: getValue(/glucose[^0-9]*([0-9]+(?:\.[0-9]+)?)/, "glucose")
  };
}

function parseInput(input: string): StructuredHealthRecord {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Provide a health record in JSON or text form.");
  }

  try {
    const parsed = JSON.parse(trimmed) as Partial<StructuredHealthRecord>;
    if (
      typeof parsed.age === "number" &&
      typeof parsed.bmi === "number" &&
      typeof parsed.blood_pressure === "number" &&
      typeof parsed.glucose === "number"
    ) {
      return {
        age: parsed.age,
        bmi: parsed.bmi,
        blood_pressure: parsed.blood_pressure,
        glucose: parsed.glucose,
        schemaVersion: parsed.schemaVersion
      };
    }
  } catch {
    // Fall through to relaxed text parsing.
  }

  return normalizeTextRecord(trimmed);
}

export async function buildEncryptedPayloadFromLocalInput(
  input: string,
  clientKeyId: string
): Promise<EncryptedPayload> {
  const parsed = parseInput(input);
  const canonical = JSON.stringify(
    {
      schemaVersion: parsed.schemaVersion ?? "healthcare-v1",
      values: [parsed.age, parsed.bmi, parsed.blood_pressure, parsed.glucose]
    },
    null,
    0
  );

  return {
    ciphertext: btoa(canonical),
    publicMetadataHash: await sha256Hex(canonical),
    clientKeyId
  };
}
