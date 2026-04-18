import "@fhevm/hardhat-plugin";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "hardhat-deploy";
import "./tasks/accounts";

import { HardhatUserConfig } from "hardhat/config";

const accounts =
  process.env.SEPOLIA_PRIVATE_KEY && process.env.SEPOLIA_PRIVATE_KEY.length > 0
    ? [process.env.SEPOLIA_PRIVATE_KEY]
    : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  namedAccounts: {
    deployer: {
      default: 0
    }
  },
  paths: {
    sources: "./contracts",
    deployments: "./deployments",
    tests: "./test"
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url:
        process.env.SEPOLIA_RPC_URL ||
        `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY ?? ""}`,
      accounts
    }
  }
};

export default config;

