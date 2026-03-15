class BitGoExecutionAdapter {
  constructor({ mode = process.env.DARKAGENT_EXECUTION_MODE || "live" } = {}) {
    this.mode = mode;
    this.syncedPolicies = new Map();
    this.liveAdapter = null;
    this.liveAdapterError = null;
    this.requireLiveConfig();
  }

  requireLiveConfig() {
    if (this.mode !== "live") {
      throw new Error(
        `DarkAgent is configured for strict live execution, but mode '${this.mode}' was requested. Set DARKAGENT_EXECUTION_MODE=live.`
      );
    }

    const requiredEnv = [
      "BITGO_ACCESS_TOKEN",
      "BITGO_WALLET_ID",
      "BITGO_PASSPHRASE",
      "BITGO_ENV",
      "BASE_SEPOLIA_RPC",
    ];
    const missing = requiredEnv.filter((key) => !process.env[key]);
    if (
      !process.env.DARKAGENT_EXECUTOR_PRIVATE_KEY &&
      !process.env.PRIVATE_KEY
    ) {
      missing.push("DARKAGENT_EXECUTOR_PRIVATE_KEY or PRIVATE_KEY");
    }
    if (missing.length > 0) {
      throw new Error(
        `Missing live BitGo configuration: ${missing.join(", ")}.`
      );
    }
  }

  async syncPermissions(ensName, policy) {
    this.syncedPolicies.set(ensName, {
      active: policy.active,
      maxSpendUsd: policy.maxSpendUsd,
      dailyLimitUsd: policy.dailyLimitUsd,
      allowedProtocols: [...policy.allowedProtocols],
      syncedAt: new Date().toISOString(),
    });

    try {
      if (!this.liveAdapter) {
        const { AgentPolicyAdapter } = require("../../sdk/bitgo");
        this.liveAdapter = new AgentPolicyAdapter(
          process.env.BITGO_ENV || "test",
          process.env.BITGO_COIN || "tbase"
        );
      }

      await this.liveAdapter.syncPermissions(ensName, {
        maxSpend: policy.maxSpendUsd,
        allowedProtocols: policy.allowedProtocols,
      });

      return {
        mode: "live",
        synced: true,
      };
    } catch (error) {
      this.liveAdapterError = error.message;
      throw new Error(
        `BitGo live sync failed for ${ensName}: ${error.message}`
      );
    }
  }

  async execute({ ensName, action, evaluation, payload }) {
    const syncedPolicy = this.syncedPolicies.get(ensName);
    if (!syncedPolicy || syncedPolicy.active === false) {
      throw new Error("BitGo policy is currently frozen for this ENS profile.");
    }

    if (!this.liveAdapter) {
      throw new Error(
        "BitGo live adapter is not initialized. Policy sync must succeed before execution."
      );
    }
    const liveResult = await this.liveAdapter.executeWithPolicy({
      valueWei: Math.round(evaluation.amountUsd * 1_000_000),
      actionId: action.id,
      payload,
    });

    if (!liveResult.success) {
      throw new Error(liveResult.reason || "BitGo blocked this request.");
    }

    return {
      mode: "live",
      txid: liveResult.txid,
      stealthAddress: liveResult.address,
      settlementNetwork: action.settlementChain,
      receiptUrl: liveResult.txid
        ? `https://sepolia.basescan.org/tx/${liveResult.txid}`
        : "",
      amountWei: liveResult.amountWei,
      amountEth: liveResult.amountEth,
      bitgoWalletId: process.env.BITGO_WALLET_ID,
    };
  }
}

module.exports = {
  BitGoExecutionAdapter,
};
