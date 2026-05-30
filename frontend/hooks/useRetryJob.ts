import { useWriteContract } from "wagmi";
import { ABICORE_CONTRACT_ADDRESS } from "../lib/config";
import { ABICORE_ABI } from "../lib/abi";

/**
 * @notice Hook to execute client's Retry choice, resetting the job back to Open and clearing arguments.
 */
export function useRetryJob() {
  const { writeContract, isPending, isSuccess, error, data: hash } = useWriteContract();

  const retryJob = (jobId: bigint) => {
    writeContract({
      address: ABICORE_CONTRACT_ADDRESS as `0x${string}`,
      abi: ABICORE_ABI,
      functionName: "retryJob",
      args: [jobId],
    });
  };

  return { retryJob, isPending, isSuccess, error, hash };
}
