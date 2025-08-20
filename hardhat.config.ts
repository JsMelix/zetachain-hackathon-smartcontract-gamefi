import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // ZetaChain Athens 3 Testnet
    zetaTestnet: {
      url: "https://rpc.ankr.com/zeta_testnet_athens_3",
      chainId: 7001,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // ZetaChain Mainnet
    zetaMainnet: {
      url: "https://rpc.ankr.com/zeta",
      chainId: 7000,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Local Hardhat Network
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      zetaTestnet: process.env.ZETASCAN_API_KEY || "",
      zetaMainnet: process.env.ZETASCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "zetaTestnet",
        chainId: 7001,
        urls: {
          apiURL: "https://explorer.athens3.zetachain.com/api",
          browserURL: "https://explorer.athens3.zetachain.com",
        },
      },
      {
        network: "zetaMainnet",
        chainId: 7000,
        urls: {
          apiURL: "https://explorer.zetachain.com/api",
          browserURL: "https://explorer.zetachain.com",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;

