// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IDarkAgent
 * @notice The core infrastructure interface for the DarkAgent protocol.
 * @dev Anyone building an AI agent plugs into this instead of building 
 *      their own security layer.
 */
interface IDarkAgent {
    
    struct Proposal {
        address agent;
        address user;
        bytes action;
        bool verified;
        bool executed;
        uint256 timestamp;
    }

    // Agent proposes action
    function propose(
        address agent,
        address user,
        bytes calldata action
    ) external returns (bytes32 proposalId);

    // DarkAgent verifies against user's ENS rules
    function verify(
        bytes32 proposalId
    ) external returns (bool);

    // Only executes if verified
    function execute(
        bytes32 proposalId
    ) external;

    // Anyone can check
    function isVerified(
        bytes32 proposalId
    ) external view returns (bool);

    // Optional: Get full proposal details
    function getProposal(
        bytes32 proposalId
    ) external view returns (Proposal memory);
}
