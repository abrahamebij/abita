import { useWriteContract } from "wagmi";
import { ABICORE_CONTRACT_ADDRESS } from "../lib/config";
import { ABICORE_ABI } from "../lib/abi";
import { parseEther } from "viem";

/**
 * @notice Hook to stake exactly 1 STT to raise or support a dispute on-chain.
 */
export function useRaiseDispute() {
  const { writeContract, isPending, isSuccess, error, data: hash } = useWriteContract();

  const raiseDispute = (jobId: bigint) => {
    writeContract({
      address: ABICORE_CONTRACT_ADDRESS as `0x${string}`,
      abi: ABICORE_ABI,
      functionName: "stakeForDispute",
      args: [jobId],
      value: parseEther("1"), // Must be exactly 1 STT (1 ether)
    });
  };

  return { raiseDispute, isPending, isSuccess, error, hash };
}
