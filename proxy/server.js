// ─────────────────────────────────────────────────────────
// DarkAgent Action Interceptor (Proxy Server)
// Port 8787 — Receives AI agent action payloads,
// evaluates against policy, generates ZK proofs
// ─────────────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { evaluatePolicy } = require('./policy_engine');
const { resolveENSPolicy, setCustomPolicy, listPolicyHandles, getPolicy } = require('./ens_resolver');
const { triggerZKProof, getAllProofs, getProofByTxHash, getProofById } = require('./zk_trigger');

const app = express();
app.use(express.json());
app.use(cors());

// ── Activity log ──────────────────────────────────────────
const activityLog = [];

function logActivity(entry) {
  const record = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry
  };
  activityLog.push(record);
  return record;
}

// ── Hash helpers ──────────────────────────────────────────
function hashAction(action) {
  return crypto.createHash('sha256').update(JSON.stringify(action)).digest('hex');
}

function hashPolicy(policy) {
  return crypto.createHash('sha256').update(JSON.stringify(policy)).digest('hex');
}

// ══════════════════════════════════════════════════════════
// POST /intercept — Core endpoint
// Body: { ens_handle: string, agent_id: string, action: Record<string, any> }
// ══════════════════════════════════════════════════════════
app.post('/intercept', async (req, res) => {
  const { ens_handle, agent_id, action } = req.body;

  if (!ens_handle || !action) {
    return res.status(400).json({ error: 'ens_handle and action are required' });
  }

  console.log(`\n━━━ Intercepted action from agent "${agent_id || 'unknown'}" ━━━`);
  console.log(`   ENS: ${ens_handle}`);
  console.log(`   Action: ${JSON.stringify(action, null, 2)}`);

  // 1. Load policy from ENS
  const policy = await resolveENSPolicy(ens_handle);
  if (!policy) {
    logActivity({
      type: 'error',
      ens_handle,
      agent_id: agent_id || 'unknown',
      message: 'No policy found for ENS handle'
    });
    return res.status(404).json({ error: 'No policy found for ENS handle' });
  }

  console.log(`   Policy domain: ${policy.domain}`);
  console.log(`   Rules: ${policy.rules.length}`);

  // 2. Evaluate action against policy
  const result = evaluatePolicy(action, policy);

  // 3a. BLOCK
  if (!result.compliant) {
    console.log(`   ❌ BLOCKED — Rule ${result.violated_rule}: ${result.reason}`);

    logActivity({
      type: 'block',
      ens_handle,
      agent_id: agent_id || 'unknown',
      domain: policy.domain,
      violated_rule: result.violated_rule,
      reason: result.reason,
      eu_ref: result.eu_ref,
      action_summary: action
    });

    return res.status(403).json({
      status: 'BLOCKED',
      violated_rule: result.violated_rule,
      reason: result.reason,
      eu_ref: result.eu_ref,
      domain: policy.domain,
      agent_id: policy.agent_id
    });
  }

  // 3b. APPROVE + generate ZK proof
  console.log(`   ✅ APPROVED — All ${policy.rules.length} rules passed`);
  console.log(`   🔐 Generating ZK proof...`);

  try {
    const proof = await triggerZKProof({
      agent_id: agent_id || 'unknown',
      action_hash: hashAction(action),
      policy_hash: hashPolicy(policy),
      compliant: true
    });

    logActivity({
      type: 'approve',
      ens_handle,
      agent_id: agent_id || 'unknown',
      domain: policy.domain,
      proof_tx: proof.tx_hash,
      proof_id: proof.id,
      action_summary: action
    });

    return res.status(200).json({
      status: 'APPROVED',
      domain: policy.domain,
      agent_id: policy.agent_id,
      rules_checked: policy.rules.length,
      proof_tx: proof.tx_hash,
      proof_id: proof.id,
      basescan_url: proof.basescan_url,
      chain: proof.chain,
      timestamp: proof.timestamp
    });
  } catch (err) {
    console.error('   ⚠ ZK proof generation failed:', err.message);
    return res.status(500).json({
      status: 'ERROR',
      error: 'ZK proof generation failed',
      message: err.message
    });
  }
});

// ══════════════════════════════════════════════════════════
// GET /policies — List all available ENS policy handles
// ══════════════════════════════════════════════════════════
app.get('/policies', async (req, res) => {
  const handles = listPolicyHandles();
  const policies = {};
  for (const h of handles) {
    policies[h] = await getPolicy(h);
  }
  res.json({ policies });
});

// ══════════════════════════════════════════════════════════
// GET /policies/:ensHandle — Get a specific policy
// ══════════════════════════════════════════════════════════
app.get('/policies/:ensHandle', async (req, res) => {
  const policy = await getPolicy(req.params.ensHandle);
  if (!policy) {
    return res.status(404).json({ error: 'No policy found' });
  }
  res.json({ ens_handle: req.params.ensHandle, policy });
});

// ══════════════════════════════════════════════════════════
// PUT /policies/:ensHandle — Update/create a policy
// ══════════════════════════════════════════════════════════
app.put('/policies/:ensHandle', async (req, res) => {
  const { policy } = req.body;
  if (!policy) {
    return res.status(400).json({ error: 'Policy object is required in body' });
  }
  setCustomPolicy(req.params.ensHandle, policy);

  logActivity({
    type: 'policy_update',
    ens_handle: req.params.ensHandle,
    domain: policy.domain
  });

  res.json({
    message: 'Policy updated',
    ens_handle: req.params.ensHandle,
    policy
  });
});

// ══════════════════════════════════════════════════════════
// GET /proofs — List all ZK proofs
// ══════════════════════════════════════════════════════════
app.get('/proofs', (req, res) => {
  res.json({ proofs: getAllProofs() });
});

// ══════════════════════════════════════════════════════════
// GET /proofs/:id — Get a specific proof
// ══════════════════════════════════════════════════════════
app.get('/proofs/:id', (req, res) => {
  const proof = getProofById(req.params.id) || getProofByTxHash(req.params.id);
  if (!proof) {
    return res.status(404).json({ error: 'Proof not found' });
  }
  res.json(proof);
});

// ══════════════════════════════════════════════════════════
// GET /activity — Get activity log
// ══════════════════════════════════════════════════════════
app.get('/activity', (req, res) => {
  res.json({ activity: activityLog });
});

// ══════════════════════════════════════════════════════════
// GET /health — Health check
// ══════════════════════════════════════════════════════════
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'darkagent-proxy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ══════════════════════════════════════════════════════════
// GET / — Root info
// ══════════════════════════════════════════════════════════
app.get('/', (req, res) => {
  res.json({
    service: 'DarkAgent Action Interceptor',
    version: '1.0.0',
    description: 'ZK Compliance Layer for AI Agents',
    endpoints: {
      intercept: 'POST /intercept',
      policies: 'GET /policies',
      proofs: 'GET /proofs',
      activity: 'GET /activity',
      health: 'GET /health'
    }
  });
});

// ── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║  DarkAgent Proxy running on :${PORT}        ║`);
  console.log(`║  ZK Compliance Layer for AI Agents       ║`);
  console.log(`╚══════════════════════════════════════════╝\n`);
  console.log(`  Endpoints:`);
  console.log(`  ├─ POST /intercept    → Evaluate agent action`);
  console.log(`  ├─ GET  /policies     → List all policies`);
  console.log(`  ├─ GET  /proofs       → List all ZK proofs`);
  console.log(`  ├─ GET  /activity     → Activity log`);
  console.log(`  └─ GET  /health       → Health check\n`);
  console.log(`  Demo ENS handles:`);
  console.log(`  ├─ alice.darkagent.eth  (DeFi policy)`);
  console.log(`  └─ bob.darkagent.eth    (EU AI Act Hiring policy)\n`);
});
