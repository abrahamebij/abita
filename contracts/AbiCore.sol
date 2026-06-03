// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Import OpenZeppelin utility library to convert addresses to hex strings
import "@openzeppelin/contracts/utils/Strings.sol";
// Import our custom Somnia Network Agents platform interface
import "./interfaces/ISomniaAgents.sol";

/**
 * @title AbiCore
 * @notice Core escrow and AI-adjudicated dispute contract for Abita.
 * Enables client-freelancer escrow posting, delivery, staking for dispute,
 * argument submission, and integration with Somnia Network consensus-verified AI agents.
 */
contract AbiCore {
    // We import Strings to convert address values directly into lowercase hexadecimal strings
    using Strings for address;

    // --- State Variables ---

    // The unique ID of the Somnia consensus-verified LLM Inference Agent (Qwen3-30B model)
    uint256 public constant LLM_AGENT_ID = 12847293847561029384;

    // The address of the Somnia platform requester contract
    ISomniaAgents public immutable platform;

    // Address where Abita gathers its 2 STT dispute adjudication fees
    address payable public treasury;

    // Running counter to assign unique, incremental IDs to each posted job
    uint256 public jobCounter;

    // Mapping to store the details of each job by its unique Job ID
    mapping(uint256 => Job) public jobs;

    // Mapping to correlate Somnia's asynchronous request ID to a specific Job ID
    mapping(uint256 => uint256) public requestToJob;

    // --- Custom Types & Enums ---

    // Plain-English explanation for Abraham:
    // Enums are a way to represent a state with readable names.
    // Behind the scenes, Solidity stores these as numbers starting from 0.
    enum JobStatus {
        Open,                // 0: Job posted, awaiting freelancer delivery
        Delivered,           // 1: Freelancer has submitted work, client is reviewing
        Disputed,            // 2: Escrow has been disputed, awaiting AI agent verdict
        PendingClientChoice, // 3: AI ruled for client, client must now choose: close or retry (rounds 1-4 only)
        Closed               // 4: Escrow settled. Payment is either paid out to freelancer or refunded to client
    }

    // Struct definitions gather all data points belonging to a single Job
    struct Job {
        address client;                 // The client who funded the escrow
        address freelancer;             // The freelancer assigned to do the work
        uint256 escrowAmount;           // Escrow size in wei (staked STT payment)
        string requirements;            // Job specifications outlined by the client
        string deliveryNote;            // Delivery details / Figma links posted by freelancer
        string clientArgument;          // The client's arguments submitted for a dispute
        string freelancerArgument;      // The freelancer's arguments submitted for a dispute
        JobStatus status;               // The current state of the job
        uint8 disputeCount;             // Total disputes raised on this job (caps at 5)
        uint8 freelancerWinStreak;      // Consecutive AI wins by the freelancer (resets on client win)
        address lastVerdictWinner;      // Wallet address declared winner in the last dispute round
        uint256 pendingRequestId;       // Active Somnia agent request ID during adjudication
        bool clientDisputeStaked;       // Flag indicating if client has paid the 1 STT dispute fee
        bool freelancerDisputeStaked;   // Flag indicating if freelancer has paid the 1 STT dispute fee
    }

    // --- Events ---
    // Events allow external clients (like our Next.js frontend) to listen for actions on-chain.
    event JobPosted(uint256 indexed jobId, address indexed client, address indexed freelancer, uint256 escrowAmount);
    event DeliverySubmitted(uint256 indexed jobId, string deliveryNote);
    event JobClosed(uint256 indexed jobId, address indexed recipient, uint256 escrowAmount);
    event DisputeStaked(uint256 indexed jobId, address indexed sender);
    event ArgumentSubmitted(uint256 indexed jobId, address indexed sender);
    event JudgmentRequested(uint256 indexed jobId, uint256 requestId, uint8 disputeCount);
    event VerdictForClient(uint256 indexed jobId, uint256 requestId);
    event VerdictForFreelancer(uint256 indexed jobId, uint256 requestId);
    event FinalVerdict(uint256 indexed jobId, address winner, uint256 escrowAmount);
    event JobRetried(uint256 indexed jobId, uint8 disputeCount);

    // --- Constructor ---
    // Runs once upon deployment. Abraham note: we declare the platform address and treasury.
    constructor(address _platform, address payable _treasury) {
        require(_platform != address(0), "Invalid platform address");
        require(_treasury != address(0), "Invalid treasury address");
        platform = ISomniaAgents(_platform);
        treasury = _treasury;
    }

    // --- Main Functions ---

    /**
     * @notice Post a new job, locks the contract payment in escrow.
     * @param freelancer The address of the freelancer selected for the job.
     * @param requirements The description and requirements of the work.
     *
     * Plain-English explanation for Abraham:
     * - 'payable' tells Solidity this function accepts STT tokens (native value).
     * - 'msg.value' contains the amount of native tokens sent with this call.
     * - 'msg.sender' is the person calling the function (the client).
     */
    function postJob(address freelancer, string calldata requirements) external payable returns (uint256) {
        require(msg.value > 0, "Escrow payment must be greater than zero");
        require(freelancer != address(0), "Invalid freelancer address");
        require(freelancer != msg.sender, "Cannot hire yourself");

        // Increment the global counter to mint a new Job ID
        jobCounter++;
        uint256 jobId = jobCounter;

        // Initialize the Job struct inside the jobs mapping
        jobs[jobId] = Job({
            client: msg.sender,
            freelancer: freelancer,
            escrowAmount: msg.value,
            requirements: requirements,
            deliveryNote: "",
            clientArgument: "",
            freelancerArgument: "",
            status: JobStatus.Open,
            disputeCount: 0,
            freelancerWinStreak: 0,
            lastVerdictWinner: address(0),
            pendingRequestId: 0,
            clientDisputeStaked: false,
            freelancerDisputeStaked: false
        });

        // Trigger the JobPosted event so the frontend updates instantly
        emit JobPosted(jobId, msg.sender, freelancer, msg.value);

        return jobId;
    }

    /**
     * @notice Allow the assigned freelancer to submit their delivery notes and work links.
     * @param jobId The unique ID of the job.
     * @param deliveryNote Notes describing the work done, design file links, etc.
     */
    function submitDelivery(uint256 jobId, string calldata deliveryNote) external {
        Job storage job = jobs[jobId];
        
        // Ensure the caller is indeed the assigned freelancer
        require(msg.sender == job.freelancer, "Only the assigned freelancer can submit work");
        // Delivery can only occur when the job status is Open
        require(job.status == JobStatus.Open, "Job is not in Open status");
        // Ensure some delivery proof is provided
        require(bytes(deliveryNote).length > 0, "Delivery note cannot be empty");

        // Save delivery proof and change state
        job.deliveryNote = deliveryNote;
        job.status = JobStatus.Delivered;

        emit DeliverySubmitted(jobId, deliveryNote);
    }

    /**
     * @notice Allow the client to approve the delivery, releasing full escrow funds to the freelancer.
     * @param jobId The unique ID of the job.
     */
    function approveDelivery(uint256 jobId) external {
        Job storage job = jobs[jobId];

        // Ensure only the client who posted the job can approve it
        require(msg.sender == job.client, "Only the client can approve delivery");
        // Approve is only valid while reviewing the delivery
        require(job.status == JobStatus.Delivered, "Job is not in Delivered status");

        uint256 payout = job.escrowAmount;
        
        // Move status to Closed first to prevent re-entrancy attacks
        job.status = JobStatus.Closed;

        // Release the escrow funds to the freelancer
        (bool success, ) = payable(job.freelancer).call{value: payout}("");
        require(success, "STT Transfer to freelancer failed");

        emit JobClosed(jobId, job.freelancer, payout);
    }

    /**
     * @notice Stakes a 1 STT dispute fee. Called by client or freelancer.
     * @param jobId The unique ID of the job.
     *
     * Plain-English explanation for Abraham:
     * - Every dispute requires a 1 STT stake from both parties to cover judgment fees.
     * - Once BOTH have staked, the status flips to Disputed, locking in their interest.
     */
    function stakeForDispute(uint256 jobId) external payable {
        Job storage job = jobs[jobId];

        // Check if maximum dispute threshold has been exceeded
        require(job.disputeCount < 5, "Maximum dispute limit of 5 reached");
        // Ensure dispute fee staked is exactly 1 ether (1 STT)
        require(msg.value == 1 ether, "Must stake exactly 1 STT");
        // Staking can only happen in Open or Delivered states (Delivered for initial dispute, Open after client retries)
        require(
            job.status == JobStatus.Delivered || job.status == JobStatus.Open,
            "Disputes can only be raised on open or delivered jobs"
        );

        if (msg.sender == job.client) {
            require(!job.clientDisputeStaked, "Client has already staked");
            job.clientDisputeStaked = true;
            emit DisputeStaked(jobId, msg.sender);
        } else if (msg.sender == job.freelancer) {
            require(!job.freelancerDisputeStaked, "Freelancer has already staked");
            job.freelancerDisputeStaked = true;
            emit DisputeStaked(jobId, msg.sender);
        } else {
            revert("Only client or freelancer can stake for dispute");
        }

        // If both parties have locked in their 1 STT, move status to Disputed
        if (job.clientDisputeStaked && job.freelancerDisputeStaked) {
            job.status = JobStatus.Disputed;
        }
    }

    /**
     * @notice Submit arguments for a disputed job.
     * @param jobId The unique ID of the job.
     * @param argument Plain text description explaining their claim or proof.
     */
    function submitArgument(uint256 jobId, string calldata argument) external {
        Job storage job = jobs[jobId];

        // Argument submission is only allowed once in Disputed status
        require(job.status == JobStatus.Disputed, "Job is not in Disputed status");
        require(bytes(argument).length > 0, "Argument cannot be empty");

        if (msg.sender == job.client) {
            job.clientArgument = argument;
            emit ArgumentSubmitted(jobId, msg.sender);
        } else if (msg.sender == job.freelancer) {
            job.freelancerArgument = argument;
            emit ArgumentSubmitted(jobId, msg.sender);
        } else {
            revert("Only client or freelancer can submit arguments");
        }
    }

    /**
     * @notice Triggers Somnia L1 decentralized AI inference to judge the dispute.
     * @param jobId The unique ID of the job.
     *
     * Plain-English explanation for Abraham:
     * - This function can be called by anyone once both arguments are submitted.
     * - It automatically fetches the required deposit fee from the Somnia platform.
     * - Then, it encodes the prompts and allowed outcomes, and makes a cross-contract call.
     */
    function judgeDispute(uint256 jobId) external {
        Job storage job = jobs[jobId];

        // Ensure we are in Disputed state
        require(job.status == JobStatus.Disputed, "Job is not in Disputed status");
        // Ensure both arguments have been submitted prior to judgment invocation
        require(bytes(job.clientArgument).length > 0, "Client argument is missing");
        require(bytes(job.freelancerArgument).length > 0, "Freelancer argument is missing");
        // Ensure there is no active request currently pending
        require(job.pendingRequestId == 0, "Judgment request already pending");

        // Increment the dispute count tracking on-chain
        job.disputeCount++;

        // Plain-English explanation for Abraham:
        // System Prompt acts as the AI judge's guidelines.
        // User Prompt supplies all specific evidence: requirements, delivery, arguments, and addresses.
        string memory systemPrompt =
            "You are an impartial arbitrator for a freelance work dispute. "
            "Evaluate whether the freelancer's delivery meets the client's stated requirements. "
            "Consider both arguments carefully. "
            "Return ONLY the Ethereum wallet address of the winning party. Nothing else.";

        bool isFinalRound = (job.disputeCount == 5);

        string memory userPrompt = string(abi.encodePacked(
            isFinalRound ? "FINAL ROUND - This verdict is absolute and cannot be appealed.\n\n" : "",
            "Job requirements: ", job.requirements, "\n\n",
            "Freelancer's delivery: ", job.deliveryNote, "\n\n",
            "Client's argument: ", job.clientArgument, "\n\n",
            "Freelancer's argument: ", job.freelancerArgument, "\n\n",
            "Client wallet: ", job.client.toHexString(), "\n",
            "Freelancer wallet: ", job.freelancer.toHexString()
        ));

        // Constrain the AI's output to strictly either the client's or the freelancer's hex address
        string[] memory allowedValues = new string[](2);
        allowedValues[0] = job.client.toHexString();
        allowedValues[1] = job.freelancer.toHexString();

        // Encode the payload according to Somnia LLM platform selector "inferString(string,string,bool,string[])"
        bytes memory payload = abi.encodeWithSelector(
            bytes4(keccak256("inferString(string,string,bool,string[])")),
            userPrompt,
            systemPrompt,
            true, // chainOfThought = true (audit trail)
            allowedValues
        );

        // Fetch required platform invocation fee
        uint256 fee = platform.getRequestDeposit();

        // Call the Somnia Platform with the required fee to create the request
        uint256 requestId = platform.createRequest{value: fee}(
            LLM_AGENT_ID,
            address(this),
            this.handleResponse.selector,
            payload
        );

        // Map the Somnia request back to this jobId so the callback knows which job to update
        requestToJob[requestId] = jobId;
        job.pendingRequestId = requestId;

        emit JudgmentRequested(jobId, requestId, job.disputeCount);
    }

    /**
     * @notice Asynchronous callback executed by the Somnia platform once the AI Agent and validators finish inference.
     * @param requestId The ID of the completed request.
     * @param responses The string array response containing the parsed verdict.
     */
    function handleResponse(
        uint256 requestId,
        string[] calldata responses,
        uint8 /* status */,
        bytes calldata /* details */
    ) external {
        // Ensure ONLY the Somnia Platform can trigger this callback to prevent cheating
        require(msg.sender == address(platform), "Only the Somnia platform can invoke callback");

        uint256 jobId = requestToJob[requestId];
        require(jobId > 0, "No job associated with request ID");

        Job storage job = jobs[jobId];
        // Ensure this callback matches the pending request
        require(job.pendingRequestId == requestId, "Callback request ID mismatch");

        // Reset pending request status
        job.pendingRequestId = 0;

        // Ensure there is at least one result in the response
        require(responses.length > 0, "Empty response from agent");

        string memory winnerStr = responses[0];
        string memory clientHex = job.client.toHexString();
        string memory freelancerHex = job.freelancer.toHexString();

        address winner;
        // Compare lowering hex formats to establish the winner address
        if (keccak256(abi.encodePacked(winnerStr)) == keccak256(abi.encodePacked(clientHex))) {
            winner = job.client;
        } else if (keccak256(abi.encodePacked(winnerStr)) == keccak256(abi.encodePacked(freelancerHex))) {
            winner = job.freelancer;
        } else {
            // Safe fallback if formatting goes wrong, defaults to freelancer to avoid locking funds forever
            winner = job.freelancer;
        }

        job.lastVerdictWinner = winner;

        // Plain-English explanation for Abraham:
        // The business model: Abita collects a 2 STT dispute fee (1 STT staked from each party).
        // This is transferred immediately to our project's treasury address.
        (bool feeSuccess, ) = treasury.call{value: 2 ether}("");
        require(feeSuccess, "Dispute fee payment to treasury failed");

        // Apply Dispute Adjudication logic based on AGENTS.md rules
        if (job.disputeCount == 5) {
            // Dispute 5: Final and absolute verdict.
            // Escape payout settles here and the job closes forever. No retry.
            job.status = JobStatus.Closed;
            
            (bool success, ) = payable(winner).call{value: job.escrowAmount}("");
            require(success, "Final escrow distribution failed");

            emit FinalVerdict(jobId, winner, job.escrowAmount);
        } else {
            // Disputes 1 to 4
            if (winner == job.client) {
                // Client wins: resets freelancer streak to 0. Client must choose Close or Retry
                job.freelancerWinStreak = 0;
                job.status = JobStatus.PendingClientChoice;
                
                emit VerdictForClient(jobId, requestId);
            } else {
                // Freelancer wins: increment win streak
                job.freelancerWinStreak++;

                if (job.freelancerWinStreak >= 2) {
                    // Freelancer won twice consecutively! Escrow pays out instantly and job closes.
                    job.status = JobStatus.Closed;
                    
                    (bool success, ) = payable(job.freelancer).call{value: job.escrowAmount}("");
                    require(success, "Escrow payout to freelancer failed");

                    emit FinalVerdict(jobId, job.freelancer, job.escrowAmount);
                } else {
                    // Freelancer win count = 1: Client gets exactly one more chance.
                    // The job resets to Open so the client can raise another dispute (incrementing disputeCount).
                    job.status = JobStatus.Open;

                    // Reset dispute stakes and arguments so they can submit fresh claims for the next round
                    job.clientDisputeStaked = false;
                    job.freelancerDisputeStaked = false;
                    job.clientArgument = "";
                    job.freelancerArgument = "";

                    emit VerdictForFreelancer(jobId, requestId);
                }
            }
        }
    }

    /**
     * @notice Executed by the client while in PendingClientChoice. Releases refund to client and closes job.
     * @param jobId The unique ID of the job.
     */
    function closeJob(uint256 jobId) external {
        Job storage job = jobs[jobId];

        // Ensure only the client can close the job
        require(msg.sender == job.client, "Only the client can close job");
        // Can only close if awaiting client's choice after winning a dispute
        require(job.status == JobStatus.PendingClientChoice, "Job is not awaiting client choice");

        uint256 refund = job.escrowAmount;

        // Set status to Closed first to prevent re-entrancy
        job.status = JobStatus.Closed;

        // Refund the locked escrow to the client
        (bool success, ) = payable(job.client).call{value: refund}("");
        require(success, "Refund to client failed");

        emit JobClosed(jobId, job.client, refund);
    }

    /**
     * @notice Executed by the client while in PendingClientChoice. Allows the freelancer to re-deliver.
     * @param jobId The unique ID of the job.
     */
    function retryJob(uint256 jobId) external {
        Job storage job = jobs[jobId];

        // Ensure only the client can trigger a retry
        require(msg.sender == job.client, "Only the client can trigger job retry");
        // Can only retry if awaiting client choice
        require(job.status == JobStatus.PendingClientChoice, "Job is not awaiting client choice");

        // Reset variables to allow re-delivery and a new dispute cycle
        job.status = JobStatus.Open;
        job.deliveryNote = "";
        job.clientArgument = "";
        job.freelancerArgument = "";
        job.freelancerWinStreak = 0;
        job.clientDisputeStaked = false;
        job.freelancerDisputeStaked = false;

        emit JobRetried(jobId, job.disputeCount);
    }

    /**
     * @notice Returns the full job struct.
     * @param jobId The unique ID of the job.
     */
    function getJob(uint256 jobId) external view returns (Job memory) {
        return jobs[jobId];
    }

    /**
     * @notice Returns total jobs created.
     */
    function getTotalJobs() external view returns (uint256) {
        return jobCounter;
    }
}
