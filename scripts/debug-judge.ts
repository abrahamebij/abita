import { ethers } from "ethers";

const providerUrl = "https://dream-rpc.somnia.network";
const contractAddress = "0xea62A8a3017CDE1810C2899a0F20e103E4af7250";
const platformAddress = "0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776";
const agentId = "12847293847561029384";
const agentVersion = 3;

const ABICORE_ABI = [
  "function getTotalJobs() external view returns (uint256)",
  "function getJob(uint256 jobId) external view returns (tuple(address client, address freelancer, uint256 escrowAmount, string requirements, string deliveryNote, string clientArgument, string freelancerArgument, uint8 status, uint8 disputeCount, uint8 freelancerWinStreak, address lastVerdictWinner, uint256 pendingRequestId, bool clientDisputeStaked, bool freelancerDisputeStaked))",
  "function judgeDispute(uint256 jobId) external",
  "function platform() external view returns (address)"
];

const PLATFORM_ABI = [
  "function getRequestFee(uint256 agentId, uint8 agentVersion) external view returns (uint256)"
];

async function main() {
  console.log("=== Abita On-Chain Adjudication Debugger ===");
  console.log(`Connecting to Somnia Testnet RPC: ${providerUrl}...`);
  const provider = new ethers.JsonRpcProvider(providerUrl);

  const contract = new ethers.Contract(contractAddress, ABICORE_ABI, provider);
  const platform = new ethers.Contract(platformAddress, PLATFORM_ABI, provider);

  // 1. Check contract balance
  const balance = await provider.getBalance(contractAddress);
  console.log(`AbiCore Contract Balance: ${ethers.formatEther(balance)} STT`);

  // 2. Query getRequestFee
  try {
    const fee = await platform.getRequestFee(agentId, agentVersion);
    console.log(`Somnia Agent Request Fee: ${ethers.formatEther(fee)} STT (${fee.toString()} wei)`);
  } catch (err: any) {
    console.error("Failed to query getRequestFee on platform contract:", err.message || err);
  }

  // 3. Check jobs count
  let totalJobs;
  try {
    totalJobs = await contract.getTotalJobs();
    console.log(`Total Escrow Jobs Posted: ${totalJobs.toString()}`);
  } catch (err: any) {
    console.error("Failed to query getTotalJobs():", err.message || err);
    return;
  }

  // 4. Inspect each job and simulate judgeDispute
  for (let id = 1; id <= Number(totalJobs); id++) {
    console.log(`\n--- Inspecting Job #${id} ---`);
    try {
      const job = await contract.getJob(id);
      console.log(`Client: ${job.client}`);
      console.log(`Freelancer: ${job.freelancer}`);
      console.log(`Escrow Amount: ${ethers.formatEther(job.escrowAmount)} STT`);
      console.log(`Status: ${job.status} (0=Open, 1=Delivered, 2=Disputed, 3=PendingClientChoice, 4=Closed)`);
      console.log(`Dispute Count: ${job.disputeCount}`);
      console.log(`Client Staked: ${job.clientDisputeStaked}`);
      console.log(`Freelancer Staked: ${job.freelancerDisputeStaked}`);
      console.log(`Client Argument: "${job.clientArgument}"`);
      console.log(`Freelancer Argument: "${job.freelancerArgument}"`);
      console.log(`Pending Request ID: ${job.pendingRequestId.toString()}`);

      if (Number(job.status) === 2) {
        console.log(`\nSimulating judgeDispute(${id})...`);
        
        // We simulate using callStatic or estimateGas to see if/why it reverts
        try {
          // In ethers v6, static call is performed via .judgeDispute.staticCall(id)
          await contract.judgeDispute.staticCall(id);
          console.log("Success! judgeDispute static simulation passed without reverting.");
        } catch (revertErr: any) {
          console.error("Simulation REVERTED!");
          console.error("Revert message:", revertErr.message || revertErr);
          if (revertErr.data) {
            console.error("Revert data:", revertErr.data);
          }
        }
      }
    } catch (err: any) {
      console.error(`Failed to inspect Job #${id}:`, err.message || err);
    }
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
});
