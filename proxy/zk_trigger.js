// ─────────────────────────────────────────────────────────
// DarkAgent ZK Trigger
// Generates a ZK proof and submits to Verifier.sol on Base Sepolia
// For local demo: simulates proof generation with realistic delays
// ─────────────────────────────────────────────────────────

const crypto = require('crypto');

// In-memory proof store for the demo
const proofStore = [];

/**
 * Simulate ZK proof generation using Noir circuit.
 * In production, this would use @noir-lang/noir_js and BarretenbergBackend.
 *
 * @param {Object} inputs
 * @param {string} inputs.agent_id     - ID of the AI agent
 * @param {string} inputs.action_hash  - SHA256 hash of the action payload
 * @param {string} inputs.policy_hash  - SHA256 hash of the policy JSON
 * @param {boolean} inputs.compliant   - Whether the action was compliant
 * @returns {Promise<Object>} Proof result with tx_hash and metadata
 */
async function triggerZKProof(inputs) {
  console.log(`\n🔐 [ZK] Generating proof for agent: ${inputs.agent_id}`);
  console.log(`   Action hash: ${inputs.action_hash.substring(0, 16)}...`);
  console.log(`   Policy hash: ${inputs.policy_hash.substring(0, 16)}...`);
  console.log(`   Compliant: ${inputs.compliant}`);

  // Simulate the proof generation delay (Noir circuit execution)
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

  // Generate a realistic-looking proof
  const proofBytes = crypto.randomBytes(32).toString('hex');
  const publicInputs = inputs.compliant ? '0x01' : '0x00';

  // Simulate on-chain submission tx hash
  const txHash = '0x' + crypto.randomBytes(32).toString('hex');

  const proofRecord = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    agent_id: inputs.agent_id,
    action_hash: inputs.action_hash,
    policy_hash: inputs.policy_hash,
    compliant: inputs.compliant,
    proof: proofBytes,
    public_inputs: publicInputs,
    tx_hash: txHash,
    chain: 'Base Sepolia',
    chain_id: 84532,
    verifier_contract: process.env.VERIFIER_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    basescan_url: `https://sepolia.basescan.org/tx/${txHash}`,
    status: 'verified'
  };

  proofStore.push(proofRecord);

  console.log(`   ✅ Proof generated: ${proofBytes.substring(0, 20)}...`);
  console.log(`   📝 TX Hash: ${txHash.substring(0, 20)}...`);
  console.log(`   🔗 BaseScan: ${proofRecord.basescan_url}\n`);

  return proofRecord;
}

/**
 * Get all proof records.
 */
function getAllProofs() {
  return proofStore;
}

/**
 * Get a proof by its transaction hash.
 */
function getProofByTxHash(txHash) {
  return proofStore.find(p => p.tx_hash === txHash) || null;
}

/**
 * Get a proof by its ID.
 */
function getProofById(id) {
  return proofStore.find(p => p.id === id) || null;
}

module.exports = {
  triggerZKProof,
  getAllProofs,
  getProofByTxHash,
  getProofById
};
