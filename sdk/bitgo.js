require("dotenv").config();

const { JsonRpcProvider, Wallet, formatEther } = require("ethers");

const BITGO_ENVIRONMENTS = {
  prod: "https://app.bitgo.com",
  production: "https://app.bitgo.com",
  test: "https://app.bitgo-test.com",
  testnet: "https://app.bitgo-test.com",
  dev: "https://app.bitgo-dev.com",
  staging: "https://app.bitgo-staging.com",
};

function resolveBitGoBaseUrl(env) {
  const key = String(env || "test").toLowerCase();
  return BITGO_ENVIRONMENTS[key] || BITGO_ENVIRONMENTS.test;
}

function resolveExecutionPrivateKey() {
  return (
    process.env.DARKAGENT_EXECUTOR_PRIVATE_KEY ||
    process.env.PRIVATE_KEY ||
    null
  );
}

function buildHeaders(accessToken) {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

function buildApiUrl(baseUrl, coin, walletId, suffix = "") {
  return `${baseUrl}/api/v2/${coin}/wallet/${walletId}${suffix}`;
}

async function parseBitGoResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      (body && typeof body === "object" && (body.message || body.error)) ||
      response.statusText ||
      "BitGo request failed";
    const error = new Error(message);
    error.status = response.status;
    error.payload = body;
    throw error;
  }

  return body;
}

class AgentPolicyAdapter {
  constructor(env = "test", coin = "tbase") {
    this.env = env;
    this.coin = coin;
    this.accessToken = process.env.BITGO_ACCESS_TOKEN;
    this.walletId = process.env.BITGO_WALLET_ID;
    this.baseUrl = resolveBitGoBaseUrl(env);
    this.walletPassphrase = process.env.BITGO_PASSPHRASE;
    this.baseSepoliaRpc = process.env.BASE_SEPOLIA_RPC;
    this.executionPrivateKey = resolveExecutionPrivateKey();
    this.provider = this.baseSepoliaRpc
      ? new JsonRpcProvider(this.baseSepoliaRpc)
      : null;
    this.executionSigner =
      this.provider && this.executionPrivateKey
        ? new Wallet(this.executionPrivateKey, this.provider)
        : null;

    if (!this.accessToken) throw new Error("BITGO_ACCESS_TOKEN not set");
    if (!this.walletId) throw new Error("BITGO_WALLET_ID not set");
    if (!this.walletPassphrase) throw new Error("BITGO_PASSPHRASE not set");
    if (!this.baseSepoliaRpc) throw new Error("BASE_SEPOLIA_RPC not set");
    if (!this.executionPrivateKey) {
      throw new Error(
        "DARKAGENT_EXECUTOR_PRIVATE_KEY or PRIVATE_KEY must be set"
      );
    }
  }

  async request(method, suffix = "", body) {
    const response = await fetch(buildApiUrl(this.baseUrl, this.coin, this.walletId, suffix), {
      method,
      headers: buildHeaders(this.accessToken),
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    return parseBitGoResponse(response);
  }

  async getWallet() {
    return this.request("GET");
  }

  async setPolicyRule(rule) {
    return this.request("PUT", "/policy/rule", rule);
  }

  async createPolicyRule(rule) {
    return this.request("POST", "/policy/rule", rule);
  }

  async upsertPolicyRule(rule) {
    try {
      return await this.setPolicyRule(rule);
    } catch (error) {
      if (error.status === 404 || error.status === 400) {
        return this.createPolicyRule(rule);
      }

      throw error;
    }
  }

  async syncPermissions(ensName, perms) {
    if (perms.maxSpend) {
      const amountString = String(Math.round(Number(perms.maxSpend) * 1e18));
      await this.upsertPolicyRule({
        id: `agent-limit-${ensName}`,
        type: "velocityLimit",
        action: { type: "deny" },
        condition: {
          amountString,
          timeWindow: 86400,
          groupTags: [],
          excludeTags: [],
        },
      });
    }

    if (Array.isArray(perms.allowedProtocols) && perms.allowedProtocols.length > 0) {
      await this.upsertPolicyRule({
        id: `agent-whitelist-${ensName}`,
        type: "allowanddeny",
        action: { type: "deny" },
        condition: {
          add: perms.allowedProtocols,
        },
      });
    }

    return { success: true };
  }

  async getExecutionAddress() {
    const result = await this.request("POST", "/address", {
      label: `agent-tx-${Date.now()}`,
    });

    if (!result?.address) {
      throw new Error("BitGo did not return an execution address");
    }

    return result.address;
  }

  scaleSettlementAmount(valueWeiLike) {
    const baseUnits = BigInt(String(valueWeiLike || 0));
    const minimumSettlement = 1000000000000n;
    const scaled = baseUnits * 1000000n;
    return scaled > minimumSettlement ? scaled : minimumSettlement;
  }

  async executeWithPolicy(proposal) {
    const address = await this.getExecutionAddress();
    const settlementValue = this.scaleSettlementAmount(proposal.valueWei);

    try {
      const tx = await this.executionSigner.sendTransaction({
        to: address,
        value: settlementValue,
      });
      const receipt = await tx.wait();

      return {
        success: true,
        txid: tx.hash,
        address,
        amountWei: settlementValue.toString(),
        amountEth: formatEther(settlementValue),
        blockNumber: receipt?.blockNumber ?? null,
      };
    } catch (error) {
      return {
        success: false,
        reason: error.message,
        address,
      };
    }
  }
}

module.exports = { AgentPolicyAdapter };
