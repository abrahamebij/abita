export const ABICORE_ABI = [
  // --- Main Escrow & Delivery Functions ---
  "function postJob(address freelancer, string requirements) external payable returns (uint256)",
  "function submitDelivery(uint256 jobId, string deliveryNote) external",
  "function approveDelivery(uint256 jobId) external",

  // --- Dispute Adjudication Functions ---
  "function stakeForDispute(uint256 jobId) external payable",
  "function submitArgument(uint256 jobId, string argument) external",
  "function judgeDispute(uint256 jobId) external",
  "function closeJob(uint256 jobId) external",
  "function retryJob(uint256 jobId) external",

  // --- View/Query Functions ---
  "function getJob(uint256 jobId) external view returns (tuple(address client, address freelancer, uint256 escrowAmount, string requirements, string deliveryNote, string clientArgument, string freelancerArgument, uint8 status, uint8 disputeCount, uint8 freelancerWinStreak, address lastVerdictWinner, uint256 pendingRequestId, bool clientDisputeStaked, bool freelancerDisputeStaked))",
  "function getTotalJobs() external view returns (uint256)",
  
  // --- Event Selectors ---
  "event JobPosted(uint256 indexed jobId, address indexed client, address indexed freelancer, uint256 escrowAmount)",
  "event DeliverySubmitted(uint256 indexed jobId, string deliveryNote)",
  "event JobClosed(uint256 indexed jobId, address indexed recipient, uint256 escrowAmount)",
  "event DisputeStaked(uint256 indexed jobId, address indexed sender)",
  "event ArgumentSubmitted(uint256 indexed jobId, address indexed sender)",
  "event JudgmentRequested(uint256 indexed jobId, uint256 requestId, uint8 disputeCount)",
  "event VerdictForClient(uint256 indexed jobId, uint256 requestId)",
  "event VerdictForFreelancer(uint256 indexed jobId, uint256 requestId)",
  "event FinalVerdict(uint256 indexed jobId, address winner, uint256 escrowAmount)",
  "event JobRetried(uint256 indexed jobId, uint8 disputeCount)"
] as const;
