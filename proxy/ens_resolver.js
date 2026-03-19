// ─────────────────────────────────────────────────────────
// DarkAgent ENS Policy Resolver
// Fetches user policy from ENS text records (mock for local demo)
// ─────────────────────────────────────────────────────────

const path = require('path');

// ── Mock policies for local demo ──────────────────────────
const MOCK_POLICIES = {
  'alice.darkagent.eth': {
    domain: 'defi',
    agent_id: 'trading_bot_v1',
    rules: [
      {
        rule_id: 'R01',
        field: 'amount_usdc',
        operator: 'lte',
        value: 300,
        action_on_fail: 'block'
      },
      {
        rule_id: 'R02',
        field: 'token_category',
        operator: 'not_in',
        value: ['meme', 'unverified'],
        action_on_fail: 'block'
      },
      {
        rule_id: 'R03',
        field: 'protocol',
        operator: 'in',
        value: ['uniswap', 'aave', 'compound'],
        action_on_fail: 'block'
      }
    ]
  },
  'bob.darkagent.eth': {
    domain: 'hiring',
    agent_id: 'cv_screener_v1',
    rules: [
      {
        rule_id: 'R01',
        field: 'filter_fields_used',
        operator: 'not_contains',
        value: 'location',
        action_on_fail: 'block',
        eu_ai_act_ref: 'Article 10(5)'
      },
      {
        rule_id: 'R02',
        field: 'filter_fields_used',
        operator: 'not_contains',
        value: 'age',
        action_on_fail: 'block',
        eu_ai_act_ref: 'Article 10(5)'
      },
      {
        rule_id: 'R03',
        field: 'batch_size',
        operator: 'lte',
        value: 500,
        action_on_fail: 'notify'
      }
    ]
  }
};

// Custom policies added at runtime
const customPolicies = {};

/**
 * Mock ENS resolution — returns hardcoded policy for demo.
 * In production, this would fetch from ENS text record 'darkagent.policy'.
 */
async function resolveENSPolicy(ensHandle) {
  // Check custom policies first
  if (customPolicies[ensHandle]) {
    return customPolicies[ensHandle];
  }
  return MOCK_POLICIES[ensHandle] || null;
}

/**
 * Store/update a custom policy for an ENS handle (for the Configure Policy tab).
 */
function setCustomPolicy(ensHandle, policy) {
  customPolicies[ensHandle] = policy;
}

/**
 * Get all available policy handles for listing.
 */
function listPolicyHandles() {
  const allHandles = new Set([
    ...Object.keys(MOCK_POLICIES),
    ...Object.keys(customPolicies)
  ]);
  return Array.from(allHandles);
}

/**
 * Get a specific policy by ENS handle.
 */
async function getPolicy(ensHandle) {
  return await resolveENSPolicy(ensHandle);
}

module.exports = {
  resolveENSPolicy,
  setCustomPolicy,
  listPolicyHandles,
  getPolicy,
  MOCK_POLICIES
};
