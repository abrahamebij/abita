import { ethers } from "hardhat";

async function main() {
  const platformAddress = "0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776";
  const agentId = "12847293847561029384"; // LLM Agent ID
  const agentVersion = 3;

  console.log(`Querying required fee for Somnia Agent ${agentId} (version ${agentVersion})...`);

  const abi = [
    "function getRequestFee(uint256 agentId, uint8 agentVersion) external view returns (uint256)"
  ];

  // Connect to the network provider and platform contract using ethers
  const provider = ethers.provider;
  const platform = new ethers.Contract(platformAddress, abi, provider);

  try {
    const fee = await platform.getRequestFee(agentId, agentVersion);
    console.log(`Success! Required Agent Deposit Fee: ${ethers.formatEther(fee)} STT (${fee.toString()} wei)`);
  } catch (error) {
    console.error("Error querying agent fee:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
