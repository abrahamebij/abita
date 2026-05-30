import { useWriteContract } from "wagmi";
import { ABICORE_CONTRACT_ADDRESS } from "../lib/config";
import { ABICORE_ABI } from "../lib/abi";

/**
 * @notice Hook to submit a delivery note (work description and links) by the assigned freelancer.
 */
export function useSubmitDelivery() {
  const { writeContract, isPending, isSuccess, error, data: hash } = useWriteContract();

  const submitDelivery = (jobId: bigint, deliveryNote: string) => {
    writeContract({
      address: ABICORE_CONTRACT_ADDRESS as `0x${string}`,
      abi: ABICORE_ABI,
      functionName: "submitDelivery",
      args: [jobId, deliveryNote],
    });
  };

  return { submitDelivery, isPending, isSuccess, error, hash };
}
