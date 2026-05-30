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
  const tuple = data as any[] | undefined;
  const job = tuple ? {
    client: tuple[0] as string,
    freelancer: tuple[1] as string,
    escrowAmount: tuple[2] as bigint,
    requirements: tuple[3] as string,
    deliveryNote: tuple[4] as string,
    clientArgument: tuple[5] as string,
    freelancerArgument: tuple[6] as string,
    status: tuple[7] as number,
    disputeCount: tuple[8] as number,
    freelancerWinStreak: tuple[9] as number,
    lastVerdictWinner: tuple[10] as string,
    pendingRequestId: tuple[11] as bigint,
    clientDisputeStaked: tuple[12] as boolean,
    freelancerDisputeStaked: tuple[13] as boolean,
  } : undefined;

  return { job, refetch, isLoading, isError, error };
}
