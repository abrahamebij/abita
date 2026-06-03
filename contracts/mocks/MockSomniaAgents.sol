// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/ISomniaAgents.sol";

/**
 * @title MockSomniaAgents
 * @notice Mock contract implementing ISomniaAgents to simulate the AI platform.
 * Supports manual, multi-transaction callbacks to mimic the asynchronous
 * nature of the real Somnia Network validators.
 */
contract MockSomniaAgents is ISomniaAgents {
    uint256 public requestCounter;
    
    // Lowercase hex address of the party we want the AI to declare as the winner
    string public mockWinnerHex;

    struct SavedRequest {
        address callbackAddress;
        bytes4 callbackSelector;
    }

    // Keep track of requests to allow triggering them in a separate transaction
    mapping(uint256 => SavedRequest) public requests;

    /**
     * @notice Set the winning address hex for upcoming callback simulations.
     * @param _winnerHex The lowercase address hex string (e.g. "0x...")
     */
    function setMockWinner(string calldata _winnerHex) external {
        mockWinnerHex = _winnerHex;
    }

    /**
     * @notice Simulates getRequestDeposit returning 0 for local tests.
     */
    function getRequestDeposit() external pure override returns (uint256) {
        return 0; 
    }

    /**
     * @notice Saves request details and returns a unique request ID.
     */
    function createRequest(
        uint256,
        address callbackAddress,
        bytes4 callbackSelector,
        bytes calldata
    ) external payable override returns (uint256) {
        requestCounter++;
        uint256 reqId = requestCounter;

        requests[reqId] = SavedRequest({
            callbackAddress: callbackAddress,
            callbackSelector: callbackSelector
        });

        return reqId;
    }

    /**
     * @notice Explicitly trigger the callback for a saved request.
     * Simulates the asynchronous Somnia validator callback in a new transaction.
     */
    function triggerCallback(uint256 reqId) external {
        SavedRequest storage req = requests[reqId];
        require(req.callbackAddress != address(0), "Request not found or already triggered");

        string[] memory responses = new string[](1);
        responses[0] = mockWinnerHex;

        bytes memory data = abi.encodeWithSelector(
            req.callbackSelector,
            reqId,
            responses,
            uint8(1), // Success status
            bytes("") // Empty details
        );

        address target = req.callbackAddress;
        
        // Clean up state before the call to prevent re-entrancy issues
        delete requests[reqId];

        (bool success, ) = target.call(data);
        require(success, "Callback execution failed");
    }
}
