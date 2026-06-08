import { useReadContract } from "wagmi";
import { ABICORE_CONTRACT_ADDRESS } from "../lib/config";
import { ABICORE_ABI } from "../lib/abi";

/**
 * @notice Hook to fetch job escrow details from the contract.
 * Automatically polls every 5 seconds only when the job status is Disputed (2),
 * ensuring real-time UI updates once the Somnia AI Agent returns the verdict.
 */
export function useJobData(jobId: bigint) {
  const { data, refetch, isLoading, isError, error } = useReadContract({
    address: ABICORE_CONTRACT_ADDRESS as `0x${string}`,
    abi: ABICORE_ABI,
    functionName: "getJob",
    args: [jobId],
    query: {
      refetchInterval: (queryData) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const job = queryData?.state?.data as any;
        const status = job?.[7]; 
        return status === 2 ? 5000 : false;
      },
    },
  });

  // Map the returned Solidity tuple into a clean typed Javascript object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tuple = data as any;
  const job = tuple ? {
    client: (Array.isArray(tuple) ? tuple[0] : tuple.client) as string,
    freelancer: (Array.isArray(tuple) ? tuple[1] : tuple.freelancer) as string,
    escrowAmount: (Array.isArray(tuple) ? tuple[2] : tuple.escrowAmount) as bigint,
    requirements: (Array.isArray(tuple) ? tuple[3] : tuple.requirements) as string,
    deliveryNote: (Array.isArray(tuple) ? tuple[4] : tuple.deliveryNote) as string,
    clientArgument: (Array.isArray(tuple) ? tuple[5] : tuple.clientArgument) as string,
    freelancerArgument: (Array.isArray(tuple) ? tuple[6] : tuple.freelancerArgument) as string,
    status: (Array.isArray(tuple) ? tuple[7] : tuple.status) as number,
    disputeCount: (Array.isArray(tuple) ? tuple[8] : tuple.disputeCount) as number,
    freelancerWinStreak: (Array.isArray(tuple) ? tuple[9] : tuple.freelancerWinStreak) as number,
    lastVerdictWinner: (Array.isArray(tuple) ? tuple[10] : tuple.lastVerdictWinner) as string,
    lastVerdictReason: (Array.isArray(tuple) ? tuple[11] : tuple.lastVerdictReason) as string,
    pendingRequestId: (Array.isArray(tuple) ? tuple[12] : tuple.pendingRequestId) as bigint,
    judgmentRequestIds: (Array.isArray(tuple) ? tuple[13] : tuple.judgmentRequestIds) as readonly bigint[],
    clientDisputeStaked: (Array.isArray(tuple) ? tuple[14] : tuple.clientDisputeStaked) as boolean,
    freelancerDisputeStaked: (Array.isArray(tuple) ? tuple[15] : tuple.freelancerDisputeStaked) as boolean,
  } : undefined;

  return { job, refetch, isLoading, isError, error };
}
