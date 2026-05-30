export const ABICORE_ABI = [
  {
    name: "postJob",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "freelancer", type: "address" },
      { name: "requirements", type: "string" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "submitDelivery",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "deliveryNote", type: "string" }
    ],
    outputs: []
  },
  {
    name: "approveDelivery",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: []
  },
  {
    name: "stakeForDispute",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: []
  },
  {
    name: "submitArgument",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "argument", type: "string" }
    ],
    outputs: []
  },
  {
    name: "judgeDispute",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: []
  },
  {
    name: "closeJob",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: []
  },
  {
    name: "retryJob",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: []
  },
  {
    name: "getTotalJobs",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "getJob",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "client", type: "address" },
          { name: "freelancer", type: "address" },
          { name: "escrowAmount", type: "uint256" },
          { name: "requirements", type: "string" },
          { name: "deliveryNote", type: "string" },
          { name: "clientArgument", type: "string" },
          { name: "freelancerArgument", type: "string" },
          { name: "status", type: "uint8" },
          { name: "disputeCount", type: "uint8" },
          { name: "freelancerWinStreak", type: "uint8" },
          { name: "lastVerdictWinner", type: "address" },
          { name: "pendingRequestId", type: "uint256" },
          { name: "clientDisputeStaked", type: "bool" },
          { name: "freelancerDisputeStaked", type: "bool" }
        ]
      }
    ]
  }
] as const;
