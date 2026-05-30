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
        // Abraham note: index 7 represents the JobStatus enum inside our Solidity Job struct
        const job = queryData?.state?.data as any;
        const status = job?.[7]; 
        return status === 2 ? 5000 : false;
      },
    },
  });

  // Map the returned Solidity tuple into a clean typed Javascript object
  const job = data ? {
    client: data[0] as string,
    freelancer: data[1] as string,
    escrowAmount: data[2] as bigint,
    requirements: data[3] as string,
    deliveryNote: data[4] as string,
    clientArgument: data[5] as string,
    freelancerArgument: data[6] as string,
    status: data[7] as number,
    disputeCount: data[8] as number,
    freelancerWinStreak: data[9] as number,
    lastVerdictWinner: data[10] as string,
    pendingRequestId: data[11] as bigint,
    clientDisputeStaked: data[12] as boolean,
    freelancerDisputeStaked: data[13] as boolean,
  } : undefined;

  return { job, refetch, isLoading, isError, error };
}
