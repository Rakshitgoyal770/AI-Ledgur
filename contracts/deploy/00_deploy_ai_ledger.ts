import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("AILedger", {
    from: deployer,
    log: true,
    args: []
  });
};

export default func;
func.id = "deploy_ai_ledger";
func.tags = ["AILedger"];

