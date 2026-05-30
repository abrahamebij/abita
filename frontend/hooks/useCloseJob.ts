import { useWriteContract } from "wagmi";
import { ABICORE_CONTRACT_ADDRESS } from "../lib/config";
import { ABICORE_ABI } from "../lib/abi";

/**
 * @notice Hook to execute client's Close choice, refunding the full escrow and closing the contract.
 */
export function useCloseJob() {
  const { writeContract, isPending, isSuccess, error, data: hash } = useWriteContract();

  const closeJob = (jobId: bigint) => {
    writeContract({
      address: ABICORE_CONTRACT_ADDRESS as `0x${string}`,
      abi: ABICORE_ABI,
      functionName: "closeJob",
      args: [jobId],
    });
  };

  return { closeJob, isPending, isSuccess, error, hash };
}
