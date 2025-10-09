require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
        details: {
          yul: true,
          yulDetails: {
            stackAllocation: true
          }
        }
      },
      viaIR: true
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    u2u: {
      url: "rpc-mainnet.u2u.xyz",
      chainId: 39,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
    u2uTestnet: {
      url: "https://rpc.u2u.xyz/testnet",
      chainId: 248,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
    u2uNebulasTestnet: {
      url: "https://rpc-nebulas-testnet.u2u.xyz",
      chainId: 2484,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
  },
  etherscan: {
    apiKey: {
      u2u: process.env.U2U_API_KEY || "",
    },
    customChains: [
      {
        network: "u2u",
        chainId: 39,
        urls: {
          apiURL: "https://explorer.u2u.xyz/api",
          browserURL: "https://explorer.u2u.xyz",
        },
      },
      {
        network: "u2uTestnet",
        chainId: 248,
        urls: {
          apiURL: "https://testnet-explorer.u2u.xyz/api",
          browserURL: "https://testnet-explorer.u2u.xyz",
        },
      },
      {
        network: "u2uNebulasTestnet",
        chainId: 2484,
        urls: {
          apiURL: "https://nebulas-testnet-explorer.u2u.xyz/api",
          browserURL: "https://nebulas-testnet-explorer.u2u.xyz",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
