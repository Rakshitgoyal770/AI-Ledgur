// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.28;

contract AILedger {
    struct Contribution {
        uint256 id;
        address contributor;
        string encryptedBlobUri;
        bytes32 blobHash;
        uint256 modelVersion;
        uint256 createdAt;
    }

    event ContributionRegistered(
        uint256 indexed contributionId,
        address indexed contributor,
        uint256 indexed modelVersion,
        bytes32 blobHash,
        string encryptedBlobUri
    );

    event ModelVersionPublished(
        uint256 indexed modelVersion,
        bytes32 indexed artifactHash,
        string artifactUri,
        uint256 createdAt
    );

    event PredictionRequested(
        uint256 indexed requestId,
        address indexed requester,
        uint256 indexed modelVersion,
        bytes32 requestHash
    );

    uint256 public latestContributionId;
    uint256 public latestPredictionRequestId;
    uint256 public currentModelVersion;

    mapping(uint256 => Contribution) public contributions;
    mapping(uint256 => bytes32) public modelArtifactHashes;
    mapping(uint256 => string) public modelArtifactUris;

    function publishModelVersion(bytes32 artifactHash, string calldata artifactUri) external {
        currentModelVersion += 1;
        modelArtifactHashes[currentModelVersion] = artifactHash;
        modelArtifactUris[currentModelVersion] = artifactUri;
        emit ModelVersionPublished(currentModelVersion, artifactHash, artifactUri, block.timestamp);
    }

    function registerContribution(
        string calldata encryptedBlobUri,
        bytes32 blobHash,
        uint256 modelVersion
    ) external returns (uint256 contributionId) {
        contributionId = ++latestContributionId;
        contributions[contributionId] = Contribution({
            id: contributionId,
            contributor: msg.sender,
            encryptedBlobUri: encryptedBlobUri,
            blobHash: blobHash,
            modelVersion: modelVersion,
            createdAt: block.timestamp
        });
        emit ContributionRegistered(
            contributionId,
            msg.sender,
            modelVersion,
            blobHash,
            encryptedBlobUri
        );
    }

    function logPredictionRequest(
        bytes32 requestHash,
        uint256 modelVersion
    ) external returns (uint256 requestId) {
        requestId = ++latestPredictionRequestId;
        emit PredictionRequested(requestId, msg.sender, modelVersion, requestHash);
    }
}

