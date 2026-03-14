function evaluateAction({ action, policy, payload }) {
  const amountUsd = Number(payload.amountUsd ?? action.defaultAmountUsd ?? 0);
  const slippageBps = Number(
    payload.slippageBps ?? action.defaultSlippageBps ?? 100
  );
  const protocol = action.protocol;
  const tokenIn = payload.tokenIn || action.defaultTokens?.tokenIn || "USDC";
  const tokenOut = payload.tokenOut || action.defaultTokens?.tokenOut || "ETH";
  const violations = [];

  if (!policy) {
    violations.push("No ENS policy found for this profile.");
  } else {
    if (policy.active === false) {
      violations.push("agent.active=false");
    }

    if (!policy.allowedProtocols.includes(protocol)) {
      violations.push(`Protocol ${protocol} is not whitelisted.`);
    }

    if (
      policy.allowedTokens.length > 0 &&
      (!policy.allowedTokens.includes(tokenIn) ||
        !policy.allowedTokens.includes(tokenOut))
    ) {
      violations.push(`Token pair ${tokenIn}/${tokenOut} is not allowed.`);
    }

    if (amountUsd > policy.maxSpendUsd) {
      violations.push(
        `Trade size ${amountUsd} USD exceeds maxSpendUsd ${policy.maxSpendUsd} USD.`
      );
    }

    if (policy.dailySpentUsd + amountUsd > policy.dailyLimitUsd) {
      violations.push(
        `Daily budget would exceed ${policy.dailyLimitUsd} USD.`
      );
    }

    if (slippageBps > policy.slippageBps) {
      violations.push(
        `Requested slippage ${slippageBps} bps exceeds policy limit ${policy.slippageBps} bps.`
      );
    }
  }

  return {
    allowed: violations.length === 0,
    amountUsd,
    slippageBps,
    protocol,
    tokenIn,
    tokenOut,
    violations,
    policySnapshot: policy,
    remainingDailyUsd: policy
      ? Math.max(policy.dailyLimitUsd - policy.dailySpentUsd - amountUsd, 0)
      : 0,
  };
}

module.exports = {
  evaluateAction,
};
