const { randomUUID } = require("crypto");
const { Wallet } = require("ethers");

class BitGoExecutionAdapter {
  constructor({ mode = process.env.DARKAGENT_EXECUTION_MODE || "mock" } = {}) {
    this.mode = mode;
    this.syncedPolicies = new Map();
    this.liveAdapter = null;
    this.liveAdapterError = null;
  }

  async syncPermissions(ensName, policy) {
    this.syncedPolicies.set(ensName, {
      active: policy.active,
      maxSpendUsd: policy.maxSpendUsd,
      dailyLimitUsd: policy.dailyLimitUsd,
      allowedProtocols: [...policy.allowedProtocols],
      syncedAt: new Date().toISOString(),
    });

    if (this.mode !== "live") {
      return {
        mode: this.mode,
        synced: true,
      };
    }

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
      this.mode = "mock";
      return {
        mode: "mock",
        synced: true,
        warning: `Fell back to mock execution because live BitGo sync failed: ${error.message}`,
      };
    }
  }

  async execute({ ensName, action, evaluation, payload }) {
    const syncedPolicy = this.syncedPolicies.get(ensName);
    if (!syncedPolicy || syncedPolicy.active === false) {
      throw new Error("BitGo policy is currently frozen for this ENS profile.");
    }

    const stealthWallet = Wallet.createRandom();

    if (this.mode === "live" && this.liveAdapter) {
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
        stealthAddress: stealthWallet.address,
        settlementNetwork: action.settlementChain,
        receiptUrl: `https://app.bitgo.com/tx/${liveResult.txid}`,
      };
    }

    const txid = `mocktx_${Date.now()}_${randomUUID().slice(0, 8)}`;
    return {
      mode: "mock",
      txid,
      stealthAddress: stealthWallet.address,
      settlementNetwork: action.settlementChain,
      receiptUrl: `https://app.bitgo-test.com/tx/${txid}`,
    };
  }
}

module.exports = {
  BitGoExecutionAdapter,
};
