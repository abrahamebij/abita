// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/ISomniaAgents.sol";

/**
 * @title MockSomniaAgents
 * @notice Mock contract implementing ISomniaAgents to simulate the AI platform
 * during local end-to-end testing and integration dry-runs.
 */
contract MockSomniaAgents is ISomniaAgents {
    uint256 public requestCounter;
    
    // Lowercase hex address of the party we want the AI to declare as the winner
    string public mockWinnerHex;

    /**
     * @notice Set the winning address hex for upcoming callback simulations.
     * @param _winnerHex The lowercase address hex string (e.g. "0x...")
     */
    function setMockWinner(string calldata _winnerHex) external {
        mockWinnerHex = _winnerHex;
    }

    /**
     * @notice Simulates getRequestFee returning 0 for local tests.
     */
    function getRequestFee(uint256, uint8) external pure override returns (uint256) {
        return 0; 
    }

    /**
     * @notice Simulates createRequest and instantly triggers the caller's callback with the mock winner.
     */
    function createRequest(
        uint256,
        address callbackAddress,
        bytes4 callbackSelector,
        bytes calldata
    ) external payable override returns (uint256) {
        requestCounter++;
        uint256 reqId = requestCounter;

        string[] memory responses = new string[](1);
        responses[0] = mockWinnerHex;

        // Perform the low-level asynchronous callback simulation to match handleResponse
        bytes memory data = abi.encodeWithSelector(
            callbackSelector,
            reqId,
            responses,
            uint8(1), // Success status
            bytes("") // Empty details/chain-of-thought
        );

        // Execute the callback callbackAddress
        (bool success, ) = callbackAddress.call(data);
        require(success, "Mock callback execution failed");

        return reqId;
    }
}
