import { useWriteContract } from "wagmi";
import { ABICORE_CONTRACT_ADDRESS } from "../lib/config";
import { ABICORE_ABI } from "../lib/abi";

/**
 * @notice Hook to submit dispute arguments to support a claim during adjudication.
 */
export function useSubmitArgument() {
  const { writeContract, isPending, isSuccess, error, data: hash } = useWriteContract();

  const submitArgument = (jobId: bigint, argument: string) => {
    writeContract({
      address: ABICORE_CONTRACT_ADDRESS as `0x${string}`,
      abi: ABICORE_ABI,
      functionName: "submitArgument",
      args: [jobId, argument],
    });
  };

  return { submitArgument, isPending, isSuccess, error, hash };
}
