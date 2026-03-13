// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IDarkAgent.sol";

/**
 * @title DarkAgent
 * @author DarkAgent Protocol
 * @notice The core verification infrastructure for AI agents in DeFi.
 * @dev Replaces the old reactive "circuit breaker" paradigm with a proactive
 *      "propose -> verify -> execute" standard.
 */
contract DarkAgent is IDarkAgent {
    // ===============================================================
    //                       CUSTOM ERRORS
    // ===============================================================
    error ProposalNotFound(bytes32 proposalId);
    error AlreadyVerified(bytes32 proposalId);
    error NotVerifiedYet(bytes32 proposalId);
    error AlreadyExecuted(bytes32 proposalId);
    error VerificationFailed();

    // ===============================================================
    //                        STATE VARIABLES
    // ===============================================================
    mapping(bytes32 => Proposal) public proposals;
    uint256 public totalProposals;

    // ===============================================================
    //                          EVENTS
    // ===============================================================
    event ActionProposed(bytes32 indexed proposalId, address indexed agent, address indexed user);
    event ActionVerified(bytes32 indexed proposalId);
    event ActionExecuted(bytes32 indexed proposalId);

    // ===============================================================
    //                     CORE PROTOCOL FUNCTIONS
    // ===============================================================

    /**
     * @notice Agent proposes an action before doing anything
     * @param agent Address of the AI agent
     * @param user Address of the user (or ENS owner) authorzing the agent
     * @param action Call data or description of the action
     */
    function propose(
        address agent,
        address user,
        bytes calldata action
    ) external override returns (bytes32 proposalId) {
        proposalId = keccak256(abi.encodePacked(
            agent, user, action, block.timestamp, totalProposals
        ));

        proposals[proposalId] = Proposal({
            agent: agent,
            user: user,
            action: action,
            verified: false,
            executed: false,
            timestamp: block.timestamp
        });

        totalProposals++;
        
        emit ActionProposed(proposalId, agent, user);
        return proposalId;
    }

    /**
     * @notice DarkAgent verifies the proposal against the user's ENS rules
     * @dev In a production environment, this would securely read the ENS text record
     *      (e.g. via an oracle like CCIP) or use ZK-Proofs of the rule evaluation.
     *      For this standard interface, agents submit the verification payload.
     */
    function verify(
        bytes32 proposalId
    ) external override returns (bool) {
        Proposal storage p = proposals[proposalId];
        if (p.agent == address(0)) revert ProposalNotFound(proposalId);
        if (p.verified) revert AlreadyVerified(proposalId);
        if (p.executed) revert AlreadyExecuted(proposalId);

        // Here the protocol enforces the logic:
        // 1. Resolve ENS text record for user
        // 2. Decode standard `agent.permissions` JSON
        // 3. Match `p.action` constraints against permissions
        // (Simulated as passing for the protocol architecture)
        
        // Mark as verified
        p.verified = true;
        
        emit ActionVerified(proposalId);
        return true;
    }

    /**
     * @notice Executes the action ONLY IF verification passed
     */
    function execute(
        bytes32 proposalId
    ) external override {
        Proposal storage p = proposals[proposalId];
        if (p.agent == address(0)) revert ProposalNotFound(proposalId);
        if (!p.verified) revert NotVerifiedYet(proposalId);
        if (p.executed) revert AlreadyExecuted(proposalId);

        p.executed = true;

        // Perform the actual external call or unblock the agent
        // Example: logic to execute `p.action` on behalf of `p.user`

        emit ActionExecuted(proposalId);
    }

    /**
     * @notice Check if a proposal is verified
     */
    function isVerified(
        bytes32 proposalId
    ) external view override returns (bool) {
        return proposals[proposalId].verified;
    }

    /**
     * @notice Retrieve full proposal details
     */
    function getProposal(
        bytes32 proposalId
    ) external view override returns (Proposal memory) {
        return proposals[proposalId];
    }
}
