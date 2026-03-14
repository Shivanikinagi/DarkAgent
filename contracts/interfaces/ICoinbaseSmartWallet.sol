// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ICoinbaseSmartWallet
 * @notice Interface for Coinbase Smart Wallet (ERC-4337 compliant)
 * @dev Based on https://github.com/coinbase/smart-wallet
 *
 * The Coinbase Smart Wallet supports:
 * - Multiple owners (EOA addresses + passkey public keys)
 * - ERC-4337 UserOperation execution
 * - ERC-1271 signature validation
 * - Cross-chain replay protection
 */
interface ICoinbaseSmartWallet {
    /// @notice Represents a call to make from the smart wallet
    struct Call {
        address target;
        uint256 value;
        bytes data;
    }

    /// @notice Execute a single call from the smart wallet
    /// @param target The target address
    /// @param value The ETH value to send
    /// @param data The calldata
    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external payable;

    /// @notice Execute a batch of calls from the smart wallet
    /// @param calls Array of calls to execute
    function executeBatch(Call[] calldata calls) external payable;

    /// @notice Check if an address is an owner of this wallet
    /// @param account The address to check
    /// @return True if the address is an owner
    function isOwnerAddress(address account) external view returns (bool);

    /// @notice Check if a public key (passkey) is an owner
    /// @param x The x coordinate of the public key
    /// @param y The y coordinate of the public key
    /// @return True if the public key is an owner
    function isOwnerPublicKey(
        bytes32 x,
        bytes32 y
    ) external view returns (bool);

    /// @notice Check if raw bytes are an owner
    /// @param account The raw owner bytes (address or public key)
    /// @return True if the bytes represent an owner
    function isOwnerBytes(bytes calldata account) external view returns (bool);

    /// @notice Add a new owner to this wallet
    /// @param owner The owner bytes to add (abi.encode(address) or abi.encode(x, y))
    function addOwnerAddress(address owner) external;

    /// @notice Add a new passkey owner
    /// @param x The x coordinate of the public key
    /// @param y The y coordinate of the public key
    function addOwnerPublicKey(bytes32 x, bytes32 y) external;

    /// @notice Remove an owner from this wallet
    /// @param index The index of the owner to remove
    /// @param owner The owner bytes to remove
    function removeOwnerAtIndex(uint256 index, bytes calldata owner) external;

    /// @notice Get the number of owners
    /// @return The owner count
    function ownerCount() external view returns (uint256);

    /// @notice Get owner at a specific index
    /// @param index The index
    /// @return The owner bytes
    function ownerAtIndex(uint256 index) external view returns (bytes memory);

    /// @notice Returns the implementation of the wallet
    function implementation() external view returns (address);

    /// @notice ERC-1271: Validate a signature
    /// @param hash The hash that was signed
    /// @param signature The signature to validate
    /// @return magicValue The ERC-1271 magic value if valid
    function isValidSignature(
        bytes32 hash,
        bytes calldata signature
    ) external view returns (bytes4 magicValue);

    /// @notice Get the entry point address used by this wallet
    function entryPoint() external view returns (address);

    /// @notice Returns whether `functionSelector` can be called in `execute` or `executeBatch`
    function canSkipChainIdValidation(
        bytes4 functionSelector
    ) external pure returns (bool);
}

/**
 * @title ICoinbaseSmartWalletFactory
 * @notice Interface for the Coinbase Smart Wallet Factory
 * @dev Creates deterministic smart wallet instances using CREATE2
 */
interface ICoinbaseSmartWalletFactory {
    /// @notice Deploy a new smart wallet with the given owners and nonce
    /// @param owners Array of initial owners (each abi.encoded)
    /// @param nonce The nonce for CREATE2 deterministic deployment
    /// @return account The deployed smart wallet address
    function createAccount(
        bytes[] calldata owners,
        uint256 nonce
    ) external payable returns (address account);

    /// @notice Get the deterministic address for a wallet before deployment
    /// @param owners Array of initial owners (each abi.encoded)
    /// @param nonce The nonce for CREATE2
    /// @return predicted The predicted address
    function getAddress(
        bytes[] calldata owners,
        uint256 nonce
    ) external view returns (address predicted);

    /// @notice The implementation used for new wallets
    function implementation() external view returns (address);
}
