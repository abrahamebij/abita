// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ISomniaAgents
 * @notice Interface for interacting with the Somnia on-chain AI agent platform.
 * Allows querying required fees and creating AI inference requests.
 */
interface ISomniaAgents {
    /**
     * @notice Query the required fee in native tokens (STT) for a specific agent execution.
     * @param agentId The unique identifier of the AI agent.
     * @param agentVersion The version of the agent to invoke.
     * @return The fee required in wei.
     */
    function getRequestFee(uint256 agentId, uint8 agentVersion) external view returns (uint256);

    /**
     * @notice Create a non-blocking request to an AI agent.
     * @param agentId The unique identifier of the AI agent.
     * @param callbackAddress The contract address to receive the response callback.
     * @param callbackSelector The function selector of the callback function.
     * @param payload The ABI-encoded parameters for the agent.
     * @return The unique request identifier.
     */
    function createRequest(
        uint256 agentId,
        address callbackAddress,
        bytes4 callbackSelector,
        bytes calldata payload
    ) external payable returns (uint256);
}
