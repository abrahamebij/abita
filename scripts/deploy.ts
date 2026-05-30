import { network } from "hardhat";

async function main() {
  const connection = await network.create();
  const { ethers } = connection;

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying AbiCore with account: ${deployer.address}`);

  const platformAddress = "0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776";
  const treasuryAddress = deployer.address; // Direct fees to the deployer's account initially

  console.log(`Somnia Agent Platform: ${platformAddress}`);
  console.log(`Treasury Address: ${treasuryAddress}`);

  // Deploy the AbiCore contract
  const AbiCore = await ethers.getContractFactory("AbiCore");
  const abiCore = await AbiCore.deploy(platformAddress, treasuryAddress);

  await abiCore.waitForDeployment();
  const address = await abiCore.getAddress();

  console.log(`AbiCore successfully deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
