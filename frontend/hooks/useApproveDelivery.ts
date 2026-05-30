import { useWriteContract } from "wagmi";
import { ABICORE_CONTRACT_ADDRESS } from "../lib/config";
import { ABICORE_ABI } from "../lib/abi";

/**
 * @notice Hook to approve the freelancer's work and release the full locked escrow payment.
 */
export function useApproveDelivery() {
  const { writeContract, isPending, isSuccess, error, data: hash } = useWriteContract();

  const approveDelivery = (jobId: bigint) => {
    writeContract({
      address: ABICORE_CONTRACT_ADDRESS as `0x${string}`,
      abi: ABICORE_ABI,
      functionName: "approveDelivery",
      args: [jobId],
    });
  };

  return { approveDelivery, isPending, isSuccess, error, hash };
}
