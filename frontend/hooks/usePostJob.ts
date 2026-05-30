import { useWriteContract } from "wagmi";
import { ABICORE_CONTRACT_ADDRESS } from "../lib/config";
import { ABICORE_ABI } from "../lib/abi";
import { parseEther } from "viem";

/**
 * @notice Hook to post a new job and lock the STT payment in escrow on-chain.
 */
export function usePostJob() {
  const { writeContract, isPending, isSuccess, error, data: hash } = useWriteContract();

  const postJob = (freelancer: string, requirements: string, amountSTT: string) => {
    writeContract({
      address: ABICORE_CONTRACT_ADDRESS as `0x${string}`,
      abi: ABICORE_ABI,
      functionName: "postJob",
      args: [freelancer as `0x${string}`, requirements],
      value: parseEther(amountSTT),
    });
  };

  return { postJob, isPending, isSuccess, error, hash };
}
