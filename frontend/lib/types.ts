export enum JobStatus {
  Open = 0,
  Delivered = 1,
  Disputed = 2,
  PendingClientChoice = 3,
  Closed = 4,
}

export interface Job {
  client: string;
  freelancer: string;
  escrowAmount: bigint;
  requirements: string;
  deliveryNote: string;
  clientArgument: string;
  freelancerArgument: string;
  status: JobStatus;
  disputeCount: number;
  freelancerWinStreak: number;
  lastVerdictWinner: string;
  pendingRequestId: bigint;
  clientDisputeStaked: boolean;
  freelancerDisputeStaked: boolean;
}
