// ─────────────────────────────────────────────────────────
// DarkAgent Policy Engine
// Generic JSON rule evaluator for any domain
// ─────────────────────────────────────────────────────────

/**
 * Supported comparison operators
 * lte       - less than or equal (numeric)
 * gte       - greater than or equal (numeric)
 * eq        - strict equality
 * neq       - strict inequality
 * in        - value is in array
 * not_in    - value is NOT in array
 * contains  - string contains substring
 * not_contains - string does NOT contain substring
 */

function check(fieldVal, op, ruleVal) {
  switch (op) {
    case 'lte':          return Number(fieldVal) <= Number(ruleVal);
    case 'gte':          return Number(fieldVal) >= Number(ruleVal);
    case 'eq':           return fieldVal === ruleVal;
    case 'neq':          return fieldVal !== ruleVal;
    case 'in':           return Array.isArray(ruleVal) && ruleVal.includes(fieldVal);
    case 'not_in':       return Array.isArray(ruleVal) && !ruleVal.includes(fieldVal);
    case 'contains':     return String(fieldVal).includes(String(ruleVal));
    case 'not_contains': return !String(fieldVal).includes(String(ruleVal));
    default:             return false;
  }
}

/**
 * Evaluate an action payload against a policy.
 * Returns first violation found, or compliant: true if all rules pass.
 *
 * @param {Object} payload - The action data from the AI agent
 * @param {Object} policy  - The policy with domain, agent_id, and rules[]
 * @returns {{ compliant: boolean, violated_rule: string|null, action: string|null, eu_ref: string|null, reason: string|null }}
 */
function evaluatePolicy(payload, policy) {
  if (!policy || !policy.rules || !Array.isArray(policy.rules)) {
    return { compliant: false, violated_rule: null, action: 'block', eu_ref: null, reason: 'No valid policy found' };
  }

  for (const rule of policy.rules) {
    const fieldVal = payload[rule.field];
    if (!check(fieldVal, rule.operator, rule.value)) {
      return {
        compliant: false,
        violated_rule: rule.rule_id,
        action: rule.action_on_fail,
        eu_ref: rule.eu_ai_act_ref || null,
        reason: `Field '${rule.field}' value '${fieldVal}' failed ${rule.operator} check against ${JSON.stringify(rule.value)}`
      };
    }
  }

  return { compliant: true, violated_rule: null, action: null, eu_ref: null, reason: null };
}

module.exports = { evaluatePolicy, check };
