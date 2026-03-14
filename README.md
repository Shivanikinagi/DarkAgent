# DarkAgent Protocol

> *"ENS defines what your agent can do. BitGo makes sure it never does more. Coinbase Smart Wallet gives it a home. DarkAgent connects them all."*

DarkAgent is load-bearing decentralized infrastructure layer for AI agent permissions in DeFi. It solves the exact gap currently restricting institutional and mainstream adoption of autonomous agents: lack of standardized, on-chain, verifiable execution boundaries.

---

## 🏗 The Architecture Flow

Our core pipeline is a single, bulletproof verification flow entirely secured on Base testnet:

```text
alice.eth
(ENSIP-XX permission records)
         ↓
DarkAgent Resolver (ENSAgentResolver.sol)
(reads + parses ENS)
         ↓
Verification Contract (DarkAgent.sol)
(checks every rule dynamically on Base)
         ↓
Coinbase Smart Wallet (ERC-4337)
(executes verified actions via smart wallet)
         ↓
CoinbaseSmartWalletAgent Adapter
(spending limits, session keys, circuit breaker)
         ↓
Execute on Base / Base Sepolia
```

---

## 🔵 Coinbase Smart Wallet Integration

We integrated [Coinbase Smart Wallet](https://github.com/coinbase/smart-wallet) — an ERC-4337 compliant smart contract wallet — as the execution layer for AI agents.

### What We Built

**Smart Contract: `CoinbaseSmartWalletAgent.sol`**
- Bridges Coinbase Smart Wallet with DarkAgent verification protocol
- Agent authorization with per-transaction and daily spending limits
- Session key support for gasless agent transactions
- Emergency circuit breaker (instant wallet freeze)
- Batch execution support

**Frontend: Full Smart Wallet Dashboard**
- Connect via Coinbase Smart Wallet (passkey authentication)
- Register wallet with DarkAgent protocol
- Authorize/revoke AI agents with configurable limits
- Real-time agent authorization status monitoring
- Emergency freeze/unfreeze controls
- Protocol statistics dashboard

**SDK: `sdk/smartwallet.js`**
- Complete JavaScript SDK for smart wallet interactions
- Wallet creation and registration
- Agent authorization management
- Verified execution helpers
- Session key management

### How It Works

```javascript
// 1. User connects via Coinbase Smart Wallet (passkeys)
const wallet = useCoinbaseSmartWallet();

// 2. Register smart wallet with DarkAgent
await walletAgent.registerWallet(smartWalletAddress);

// 3. Authorize an AI agent with spending limits
await walletAgent.authorizeAgent(
  agentAddress,
  parseEther("1"),    // Max 1 ETH per transaction
  parseEther("10"),   // Max 10 ETH per day
  30 * 86400          // 30-day authorization
);

// 4. Agent proposes action → DarkAgent verifies → Smart Wallet executes
await walletAgent.executeVerified(owner, proposalId, target, value, data);
```

### Key Features

| Feature | Description |
|---------|-------------|
| **Passkey Auth** | No seed phrases — authenticate with biometrics |
| **ERC-4337** | Gas-sponsored transactions via account abstraction |
| **Spending Limits** | Per-transaction and daily caps enforced on-chain |
| **Circuit Breaker** | Instant wallet freeze blocks all agent activity |
| **Session Keys** | Temporary keys for gasless agent transactions |
| **Multi-Owner** | Multiple owners via EOA addresses and passkeys |
| **ERC-1271** | Smart contract signature validation |
| **Batch Execution** | Execute multiple verified actions atomically |

---

## 🔵 BitGo Protocol Adapter (What We Built for BitGo)

We didn't just spin up a wallet. We built the first **BitGo Agent Policy Adapter**.

**What it does:**
1. **Reads ENS permissions** directly mapping them to an agent profile.
2. **Automatically creates matching BitGo policies**: Translates `agent.max_spend` into BitGo's enterprise `velocityLimit` engine, and `agent.protocols` into an `addressWhitelist`.
3. Ensures strict **Privacy** by executing via `wallet.createAddress()`—generating a purely fresh un-linkable output address every single time an agent acts.

```javascript
// Excerpt from /sdk/bitgo.js AgentPolicyAdapter
async syncPermissions(ensName, perms) {
   // Generates matching BitGo enterprise policies instantly from ENS
   await wallet.updatePolicyRule({
     type: 'velocityLimit',
     amountString: String(perms.maxSpend),
     timeWindow: 86400 // Daily limit
   });
}

async getExecutionAddress() {
    // $1,200 Privacy Prize criteria hit precisely.
    return await wallet.createAddress({ label: `agent-tx-${Date.now()}` });
}
```

---

## 🪪 ENSIP-XX: Agent Permission Records (What We Built for ENS)

We aren't just calling `getText()`. We are formally proposing **ENSIP-XX** to turn ENS from an identity service into the ultimate decentralized financial policy standard. 

By defining the `agent.*` prefix, *any* protocol can read what limits a user has enforced upon their AI Agents.

*   `agent.max_spend`: Daily cap
*   `agent.slippage`: AMM tolerance
*   `agent.protocols`: Whitelist of DeFi routers (like Uniswap)

The newly deployed `ENSAgentResolver.sol` converts these standards into an easily callable struct that the `DarkAgent.sol` verification contract consumes strictly before any protocol execution state is verified.

---

## 🎯 What We're Pitching

**To Coinbase Judges:**
"We integrated Coinbase Smart Wallet as the execution layer for verified AI agents. Users authenticate with passkeys, agents operate with on-chain spending limits, and a circuit breaker freezes everything instantly if needed."

**To ENS Judges ($2,000 Creative + Pool):**
"We proposed ENSIP-XX. ENS becomes the permission layer for all AI agents. Any protocol reads it using our ENSAgentResolver."

**To BitGo Judges ($2,000 Privacy + DeFi):**
"We built the first agent policy adapter for BitGo. ENS permissions automatically sync to BitGo policies. Agents cannot exceed limits, and every single execution fires from a perfectly fresh, un-linkable address."

**To ETHMumbai / Base Judges:**
"We built the infrastructure layer that every AI agent in DeFi needs. ENS defines the rules. Coinbase Smart Wallet executes them. Nobody can bypass either. It runs entirely on Base."

---

## 📁 Project Structure

```
Oracle/
├── contracts/
│   ├── DarkAgent.sol                    # Core verification protocol
│   ├── ENSAgentResolver.sol             # ENSIP-XX permission records
│   ├── CoinbaseSmartWalletAgent.sol     # Smart Wallet ↔ DarkAgent adapter
│   └── interfaces/
│       ├── IDarkAgent.sol               # Core protocol interface
│       ├── IBitGoWallet.sol             # BitGo wallet interface
│       └── ICoinbaseSmartWallet.sol     # Coinbase Smart Wallet interface
├── frontend/
│   └── src/
│       ├── App.jsx                      # Main app with Smart Wallet nav
│       ├── main.jsx                     # WagmiProvider + React Query setup
│       ├── config/
│       │   └── wagmi.js                 # Wagmi + Coinbase Wallet config
│       ├── hooks/
│       │   ├── useContracts.js          # Legacy MetaMask hook
│       │   └── useSmartWallet.js        # Coinbase Smart Wallet hook
│       ├── pages/
│       │   ├── SmartWallet.jsx          # Smart Wallet dashboard
│       │   ├── Dashboard.jsx            # Protocol activity timeline
│       │   └── Proposer.jsx             # Agent execution simulator
│       └── contracts/
│           ├── abis.js                  # All contract ABIs
│           └── deployment.json          # Deployed addresses
├── sdk/
│   ├── smartwallet.js                   # Smart Wallet SDK
│   ├── bitgo.js                         # BitGo adapter
│   └── darkagent.js                     # DarkAgent SDK
├── scripts/
│   ├── deploy.js                        # Main deployment
│   ├── deploy-smart-wallet.js           # Smart wallet adapter deployment
│   └── ...
└── test/
    ├── DarkAgent.test.js                # Core protocol tests
    └── CoinbaseSmartWalletAgent.test.js # Smart wallet integration tests
```

---

## 🚀 Run the Project

DarkAgent requires minimal setup:

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy smart wallet adapter to Base Sepolia
npx hardhat run scripts/deploy-smart-wallet.js --network base_sepolia

# Run the frontend
cd frontend
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
PRIVATE_KEY=your_deployer_private_key
BASE_SEPOLIA_RPC=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key
DARKAGENT_CONTRACT=0x...  # After deployment
```

### Frontend

The frontend runs on Vite and connects to Base Sepolia. It supports two wallet connection methods:

1. **Coinbase Smart Wallet** (recommended) — Passkey authentication, ERC-4337
2. **MetaMask** — Traditional EOA wallet

Navigate to `http://localhost:5173` after running `npm run dev`.
