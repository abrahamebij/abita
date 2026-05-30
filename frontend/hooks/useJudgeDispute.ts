import { useWriteContract } from "wagmi";
import { ABICORE_CONTRACT_ADDRESS } from "../lib/config";
import { ABICORE_ABI } from "../lib/abi";

/**
 * @notice Hook to trigger the on-chain Somnia AI Agent judgment once both arguments are saved.
 */
export function useJudgeDispute() {
  const { writeContract, isPending, isSuccess, error, data: hash } = useWriteContract();

  const judgeDispute = (jobId: bigint) => {
    writeContract({
      address: ABICORE_CONTRACT_ADDRESS as `0x${string}`,
      abi: ABICORE_ABI,
      functionName: "judgeDispute",
      args: [jobId],
    });
  };

  return { judgeDispute, isPending, isSuccess, error, hash };
}
