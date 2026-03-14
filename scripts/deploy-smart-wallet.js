/**
 * Deploy CoinbaseSmartWalletAgent contract
 *
 * This script deploys the DarkAgent <-> Coinbase Smart Wallet adapter contract.
 * It requires the DarkAgent contract and Coinbase Smart Wallet Factory to be
 * already deployed on the target network.
 *
 * Usage:
 *   npx hardhat run scripts/deploy-smart-wallet.js --network base_sepolia
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Coinbase Smart Wallet Factory - official deployment on Base Sepolia
const COINBASE_SMART_WALLET_FACTORY =
  "0x0BA5ED0c6AA8c49038F819E587E2633c4A9F428a";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying CoinbaseSmartWalletAgent with account:",
    deployer.address,
  );
  console.log(
    "Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH",
  );

  // Load existing deployment config
  const deploymentPath = path.join(
    __dirname,
    "..",
    "frontend",
    "src",
    "contracts",
    "deployment.json",
  );
  let deployment = {};
  try {
    deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  } catch {
    console.log("No existing deployment found, creating new one...");
    deployment = { contracts: {} };
  }

  const darkAgentAddress =
    deployment.contracts?.DarkAgent || process.env.DARKAGENT_CONTRACT;
  if (!darkAgentAddress) {
    throw new Error(
      "DarkAgent contract address not found. Deploy DarkAgent first or set DARKAGENT_CONTRACT env var.",
    );
  }

  console.log("\n--- Deployment Configuration ---");
  console.log("DarkAgent contract:", darkAgentAddress);
  console.log("Coinbase Smart Wallet Factory:", COINBASE_SMART_WALLET_FACTORY);
  console.log("");

  // Deploy CoinbaseSmartWalletAgent
  console.log("Deploying CoinbaseSmartWalletAgent...");
  const CoinbaseSmartWalletAgent = await ethers.getContractFactory(
    "CoinbaseSmartWalletAgent",
  );
  const walletAgent = await CoinbaseSmartWalletAgent.deploy(
    darkAgentAddress,
    COINBASE_SMART_WALLET_FACTORY,
  );
  await walletAgent.waitForDeployment();
  const walletAgentAddress = await walletAgent.getAddress();
  console.log("CoinbaseSmartWalletAgent deployed to:", walletAgentAddress);

  // Update deployment config
  deployment.contracts = deployment.contracts || {};
  deployment.contracts.CoinbaseSmartWalletAgent = walletAgentAddress;
  deployment.contracts.CoinbaseSmartWalletFactory =
    COINBASE_SMART_WALLET_FACTORY;
  deployment.smartWallet = {
    factory: COINBASE_SMART_WALLET_FACTORY,
    agent: walletAgentAddress,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  console.log("\nDeployment config updated at:", deploymentPath);

  console.log("\n=== Deployment Summary ===");
  console.log("CoinbaseSmartWalletAgent:", walletAgentAddress);
  console.log("Factory:", COINBASE_SMART_WALLET_FACTORY);
  console.log("DarkAgent:", darkAgentAddress);
  console.log("\nVerify contract:");
  console.log(
    `npx hardhat verify --network base_sepolia ${walletAgentAddress} ${darkAgentAddress} ${COINBASE_SMART_WALLET_FACTORY}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
