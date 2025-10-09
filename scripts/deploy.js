const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting Aegora deployment on U2U Network Nebulas testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy TokenAEG
  console.log("\n1. Deploying TokenAEG...");
  const TokenAEG = await ethers.getContractFactory("TokenAEG");
  const tokenAEG = await TokenAEG.deploy();
  await tokenAEG.deployed();
  const tokenAEGAddress = tokenAEG.address;
  console.log("TokenAEG deployed to:", tokenAEGAddress);

  // Deploy EscrowContract
  console.log("\n2. Deploying EscrowContract...");
  const EscrowContract = await ethers.getContractFactory("EscrowContract");
  const escrowContract = await EscrowContract.deploy();
  await escrowContract.deployed();
  const escrowContractAddress = escrowContract.address;
  console.log("EscrowContract deployed to:", escrowContractAddress);

  // Deploy DisputeContract
  console.log("\n3. Deploying DisputeContract...");
  const DisputeContract = await ethers.getContractFactory("DisputeContract");
  const disputeContract = await DisputeContract.deploy(tokenAEGAddress);
  await disputeContract.deployed();
  const disputeContractAddress = disputeContract.address;
  console.log("DisputeContract deployed to:", disputeContractAddress);

  // Deploy ReputationContract
  console.log("\n4. Deploying ReputationContract...");
  const ReputationContract = await ethers.getContractFactory("ReputationContract");
  const reputationContract = await ReputationContract.deploy();
  await reputationContract.deployed();
  const reputationContractAddress = reputationContract.address;
  console.log("ReputationContract deployed to:", reputationContractAddress);

  // Deploy TimelockController for governance
  console.log("\n5. Deploying TimelockController...");
  const TimelockController = await ethers.getContractFactory("TimelockController");
  const timelockController = await TimelockController.deploy(
    172800, // 2 days delay
    [deployer.address], // proposers
    [deployer.address], // executors
    deployer.address // admin
  );
  await timelockController.deployed();
  const timelockControllerAddress = timelockController.address;
  console.log("TimelockController deployed to:", timelockControllerAddress);

  // Deploy GovernanceContract
  console.log("\n6. Deploying GovernanceContract...");
  const GovernanceContract = await ethers.getContractFactory("GovernanceContract");
  const governanceContract = await GovernanceContract.deploy(
    tokenAEGAddress,
    timelockControllerAddress,
    1, // voting delay (1 block)
    17280, // voting period (3 days)
    ethers.utils.parseEther("1000000"), // proposal threshold (1M AEG)
    4 // quorum percentage (4%)
  );
  await governanceContract.deployed();
  const governanceContractAddress = governanceContract.address;
  console.log("GovernanceContract deployed to:", governanceContractAddress);

  // Set up permissions
  console.log("\n7. Setting up permissions...");
  
  // Add governance contract as proposer and executor in timelock
  const proposerRole = await timelockController.PROPOSER_ROLE();
  const executorRole = await timelockController.EXECUTOR_ROLE();
  
  await timelockController.grantRole(proposerRole, governanceContractAddress);
  await timelockController.grantRole(executorRole, governanceContractAddress);
  console.log("Granted proposer and executor roles to governance contract");

  // Add deployer as minter for TokenAEG
  await tokenAEG.addMinter(deployer.address);
  console.log("Added deployer as minter for TokenAEG");

  // Add escrow contract as allowed token (for ETH)
  await escrowContract.addAllowedToken(ethers.constants.AddressZero);
  console.log("Added ETH as allowed token in escrow contract");

  // Save deployment info
  const deploymentInfo = {
    network: "u2uMainnet",
    chainId: 39,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      TokenAEG: {
        address: tokenAEGAddress,
        constructorArgs: []
      },
      EscrowContract: {
        address: escrowContractAddress,
        constructorArgs: []
      },
      DisputeContract: {
        address: disputeContractAddress,
        constructorArgs: [tokenAEGAddress]
      },
      ReputationContract: {
        address: reputationContractAddress,
        constructorArgs: []
      },
      TimelockController: {
        address: timelockControllerAddress,
        constructorArgs: [
          172800,
          [deployer.address],
          [deployer.address],
          deployer.address
        ]
      },
      GovernanceContract: {
        address: governanceContractAddress,
        constructorArgs: [
          tokenAEGAddress,
          timelockControllerAddress,
          1,
          17280,
          ethers.utils.parseEther("1000000"),
          4
        ]
      }
    }
  };

  // Save to file
  const deploymentPath = path.join(__dirname, "../deployments/u2u-nebulas-testnet.json");
  const deploymentDir = path.dirname(deploymentPath);
  
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\nDeployment info saved to:", deploymentPath);

  // Create .env file for frontend
  const envContent = `
# Aegora Contract Addresses (U2Umainnet)
NEXT_PUBLIC_TOKEN_AEG_ADDRESS=${tokenAEGAddress}
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=${escrowContractAddress}
NEXT_PUBLIC_DISPUTE_CONTRACT_ADDRESS=${disputeContractAddress}
NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS=${reputationContractAddress}
NEXT_PUBLIC_GOVERNANCE_CONTRACT_ADDRESS=${governanceContractAddress}
NEXT_PUBLIC_TIMELOCK_CONTROLLER_ADDRESS=${timelockControllerAddress}

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=39
NEXT_PUBLIC_RPC_URL=https://rpc-mainnet.u2u.xyz
NEXT_PUBLIC_EXPLORER_URL=https://u2uscan.xyz
`;

  const rootEnvPath = path.join(__dirname, "../.env.local");
  fs.writeFileSync(rootEnvPath, envContent);
  console.log("Environment variables saved to:", rootEnvPath);

  // Also write to frontend/.env.local so Next.js picks up values
  const frontendEnvPath = path.join(__dirname, "../frontend/.env.local");
  fs.writeFileSync(frontendEnvPath, envContent);
  console.log("Environment variables saved to:", frontendEnvPath);

  console.log("\n✅ Deployment completed successfully!");
  console.log("\nContract Addresses:");
  console.log("TokenAEG:", tokenAEGAddress);
  console.log("EscrowContract:", escrowContractAddress);
  console.log("DisputeContract:", disputeContractAddress);
  console.log("ReputationContract:", reputationContractAddress);
  console.log("TimelockController:", timelockControllerAddress);
  console.log("GovernanceContract:", governanceContractAddress);
  
  console.log("\nNext steps:");
  console.log("1. Verify contracts on U2U Network Nebulas testnet explorer");
  console.log("2. Update frontend environment variables");
  console.log("3. Deploy backend API");
  console.log("4. Test the complete system");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
