import { expect } from "chai";
import hre from "hardhat";

describe("AILedger", function () {
  it("emits a contribution event", async function () {
    const [deployer] = await hre.ethers.getSigners();
    const factory = await hre.ethers.getContractFactory("AILedger");
    const contract = await factory.connect(deployer).deploy();
    await contract.waitForDeployment();

    await expect(
      contract.registerContribution(
        "ipfs://encrypted-blob",
        "0x1111111111111111111111111111111111111111111111111111111111111111",
        1
      )
    ).to.emit(contract, "ContributionRegistered");
  });
});

