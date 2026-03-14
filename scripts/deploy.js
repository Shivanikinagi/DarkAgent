const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("     🔒 DarkAgent — Deploying to Base Sepolia");
    console.log("═══════════════════════════════════════════════════════════\n");

    const [deployer] = await ethers.getSigners();
    console.log("📍 Deployer:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH\n");

    // Deploy ENS Agent Resolver
    console.log("━━━ Deploying ENS Agent Resolver ━━━");
    const ENSResolver = await ethers.getContractFactory("ENSAgentResolver");
    const ensResolver = await ENSResolver.deploy();
    await ensResolver.waitForDeployment();
    const ensAddress = await ensResolver.getAddress();
    console.log("✅ ENSAgentResolver deployed at:", ensAddress);

    // Deploy DarkAgent Protocol
    console.log("━━━ Deploying DarkAgent Core Protocol ━━━");
    const DarkAgent = await ethers.getContractFactory("DarkAgent");
    const darkAgent = await DarkAgent.deploy(ensAddress);
    await darkAgent.waitForDeployment();
    const darkAgentAddress = await darkAgent.getAddress();
    console.log("✅ DarkAgent deployed at:", darkAgentAddress);

    // Deploy CoinbaseSmartWalletAgent
    console.log("━━━ Deploying CoinbaseSmartWalletAgent ━━━");
    // Mock Coinbase Smart Wallet Factory for testing
    const MockFactory = await ethers.getContractFactory("contracts/interfaces/ICoinbaseSmartWallet.sol:ICoinbaseSmartWalletFactory").catch(() => null);
    
    // We can use a mock address or deploy a mock if needed.
    // For testnet, usually we point to the real factory.
    // Using a placeholder factory address (real one on base sepolia: 0x0BA5ED0c6AA8c49038F819E587E2633c4A9F428a)
    const CB_FACTORY = "0x0BA5ED0c6AA8c49038F819E587E2633c4A9F428a"; 

    const CBAgent = await ethers.getContractFactory("CoinbaseSmartWalletAgent");
    const cbAgent = await CBAgent.deploy(darkAgentAddress, CB_FACTORY);
    await cbAgent.waitForDeployment();
    const cbAgentAddress = await cbAgent.getAddress();
    console.log("✅ CoinbaseSmartWalletAgent deployed at:", cbAgentAddress);

    // Save deployment info for frontend
    const deployment = {
        network: "base_sepolia",
        chainId: 84532,
        deployer: deployer.address,
        contracts: {
            DarkAgent: darkAgentAddress,
            ENSAgentResolver: ensAddress,
            CoinbaseSmartWalletAgent: cbAgentAddress,
            CoinbaseSmartWalletFactory: CB_FACTORY
        },
        agents: {
            demoAgent: {
                address: deployer.address,
                ensName: "voting-agent.eth"
            }
        },
        deployedAt: new Date().toISOString(),
    };

    // Write to frontend config
    const configPath = path.join(__dirname, "..", "frontend", "src", "contracts");
    if (!fs.existsSync(configPath)) {
        fs.mkdirSync(configPath, { recursive: true });
    }
    fs.writeFileSync(
        path.join(configPath, "deployment.json"),
        JSON.stringify(deployment, null, 2)
    );
    console.log("\n✅ Deployment info saved to frontend/src/contracts/deployment.json\n");
    console.log("📝 Add this to your .env:");
    console.log(`   DARKAGENT_PROTOCOL_ADDRESS=${darkAgentAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
