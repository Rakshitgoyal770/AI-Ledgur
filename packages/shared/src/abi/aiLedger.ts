export const aiLedgerAbi = [
  {
    type: "event",
    name: "ContributionRegistered",
    inputs: [
      { indexed: true, name: "contributionId", type: "uint256" },
      { indexed: true, name: "contributor", type: "address" },
      { indexed: true, name: "modelVersion", type: "uint256" },
      { indexed: false, name: "blobHash", type: "bytes32" },
      { indexed: false, name: "encryptedBlobUri", type: "string" }
    ]
  },
  {
    type: "event",
    name: "ModelVersionPublished",
    inputs: [
      { indexed: true, name: "modelVersion", type: "uint256" },
      { indexed: true, name: "artifactHash", type: "bytes32" },
      { indexed: false, name: "artifactUri", type: "string" },
      { indexed: false, name: "createdAt", type: "uint256" }
    ]
  },
  {
    type: "event",
    name: "PredictionRequested",
    inputs: [
      { indexed: true, name: "requestId", type: "uint256" },
      { indexed: true, name: "requester", type: "address" },
      { indexed: true, name: "modelVersion", type: "uint256" },
      { indexed: false, name: "requestHash", type: "bytes32" }
    ]
  }
] as const;

