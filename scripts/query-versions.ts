import { ethers } from "ethers";

const providerUrl = "https://dream-rpc.somnia.network";
const platformAddress = "0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776";
const agentId = "12847293847561029384";

const PLATFORM_ABI = [
  "function getRequestFee(uint256 agentId, uint8 agentVersion) external view returns (uint256)",
  "function getRequestDeposit() external view returns (uint256)",
  "function getRequiredDeposit() external view returns (uint256)"
];

async function main() {
  console.log("=== Querying Somnia Platform Contract ===");
  const provider = new ethers.JsonRpcProvider(providerUrl);
  const platform = new ethers.Contract(platformAddress, PLATFORM_ABI, provider);

  // 1. Try querying getRequestFee with versions 1 to 5
  for (let version = 1; version <= 5; version++) {
    try {
      const fee = await platform.getRequestFee(agentId, version);
      console.log(`getRequestFee(agentId, version: ${version}) SUCCESS: ${ethers.formatEther(fee)} STT`);
    } catch (err: any) {
      console.log(`getRequestFee(agentId, version: ${version}) FAILED: ${err.shortMessage || err.message}`);
    }
  }

  // 2. Try querying getRequestDeposit()
  try {
    const deposit = await platform.getRequestDeposit();
    console.log(`getRequestDeposit() SUCCESS: ${ethers.formatEther(deposit)} STT`);
  } catch (err: any) {
    console.log(`getRequestDeposit() FAILED: ${err.shortMessage || err.message}`);
  }

  // 3. Try querying getRequiredDeposit()
  try {
    const deposit = await platform.getRequiredDeposit();
    console.log(`getRequiredDeposit() SUCCESS: ${ethers.formatEther(deposit)} STT`);
  } catch (err: any) {
    console.log(`getRequiredDeposit() FAILED: ${err.shortMessage || err.message}`);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
});
