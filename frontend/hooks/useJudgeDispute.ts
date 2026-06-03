import { useWriteContract } from "wagmi";
import { ABICORE_CONTRACT_ADDRESS } from "../lib/config";
import { ABICORE_ABI } from "../lib/abi";

/**
 * @notice Hook to trigger the on-chain Somnia AI Agent judgment once both arguments are saved.
 *
 * Plain-English explanation for Abraham:
 * The `judgeDispute` function on our contract is non-payable because it uses the STT dispute fees
 * already staked by both parties (1 STT each) to pay the Somnia agent platform deposit.
 * Therefore, we do not need to forward any value from the frontend when calling this function.
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
