// DarkAgent Compliance Check Circuit (Simple)
// =============================================
// Proves: action_hash was evaluated against policy_hash and result = compliant
// Private: action_hash, policy_hash
// Public:  compliant (must be 1)
//
// This is the simplified circuit from the documentation.
// For the full production circuit, see main.nr

fn main(
    action_hash: [u8; 32],        // private: SHA256 of action payload
    policy_hash: [u8; 32],        // private: SHA256 of policy JSON
    expected_compliant: pub Field  // public: must equal 1
) {
    // Constraint: compliant must be boolean
    assert(expected_compliant == 1 | expected_compliant == 0);

    // Constraint: compliance was computed from these specific inputs
    // In production: replace with actual rule evaluation logic
    // For hackathon: prove that action + policy hashes are non-zero
    // and that the declared compliance value is 1
    let action_nonzero = action_hash[0] as Field + action_hash[1] as Field;
    let policy_nonzero = policy_hash[0] as Field + policy_hash[1] as Field;

    assert(action_nonzero != 0);
    assert(policy_nonzero != 0);
    assert(expected_compliant == 1);
}
