// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ISomniaAgents
 * @notice Interface for interacting with the Somnia on-chain AI agent platform.
 *
 * Plain-English explanation for Abraham:
 * These structs and function signatures come DIRECTLY from the official Somnia docs.
 * If anything here doesn't match exactly, the callback will never fire.
 * Source: https://docs.somnia.network/agents/invoking-agents/from-solidity
 */

enum ConsensusType { Majority, Threshold }

enum ResponseStatus {
    None,       // 0 - Default zero value (uninitialized storage)
    Pending,    // 1 - Awaiting responses
    Success,    // 2 - Consensus reached normally
    Failed,     // 3 - Validators reported failure
    TimedOut    // 4 - Request timed out
}

struct Response {
    address validator;
    bytes result;          // ABI-encoded return value from the agent — decode as (string) for LLM agents
    ResponseStatus status;
    uint256 receipt;
    uint256 timestamp;
    uint256 executionCost;
}

struct AgentRequest {
    uint256 id;
    address requester;
    address callbackAddress;
    bytes4 callbackSelector;
    address[] subcommittee;
    Response[] responses;
    uint256 responseCount;
    uint256 failureCount;
    uint256 threshold;
    uint256 createdAt;
    uint256 deadline;
    ResponseStatus status;
    ConsensusType consensusType;
    uint256 remainingBudget;
    uint256 perAgentBudget;
}

interface ISomniaAgents {
    /**
     * @notice Returns the operations-reserve floor for the default subcommittee size (3).
     * This is minPerAgentDeposit × subcommitteeSize = 0.01 STT × 3 = 0.03 STT.
     *
     * Plain-English explanation for Abraham:
     * This is the MINIMUM the contract will accept — but if you only send this amount,
     * runners see perAgentBudget = 0 and skip your request. It will time out.
     * You must add the per-agent execution reward on top (see judgeDispute).
     */
    function getRequestDeposit() external view returns (uint256);

    /**
     * @notice Create a non-blocking request to an AI agent.
     * The value you send must cover the operations reserve + per-agent execution reward.
     */
    function createRequest(
        uint256 agentId,
        address callbackAddress,
        bytes4 callbackSelector,
        bytes calldata payload
    ) external payable returns (uint256 requestId);
}

/**
 * @notice Interface that YOUR contract must implement to receive callbacks.
 * The function signature must match EXACTLY — the platform encodes the call with these types.
 */
interface IAgentRequesterHandler {
    function handleResponse(
        uint256 requestId,
        Response[] memory responses,
        ResponseStatus status,
        AgentRequest memory details
    ) external;
}
