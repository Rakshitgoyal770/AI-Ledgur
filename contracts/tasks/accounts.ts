import { task } from "hardhat/config";

task("accounts", "Prints the configured accounts", async (_, hre) => {
  const signers = await hre.ethers.getSigners();
  for (const signer of signers) {
    console.log(signer.address);
  }
});

