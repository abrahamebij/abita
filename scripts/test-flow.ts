import { network } from "hardhat";

async function main() {
  const connection = await network.create();
  const { ethers } = connection;

  const [owner, client, freelancer] = await ethers.getSigners();
  console.log("=== Starting Abita End-to-End Local Simulation ===");
  console.log(`Owner/Treasury: ${owner.address}`);
  console.log(`Client: ${client.address}`);
  console.log(`Freelancer: ${freelancer.address}\n`);

  // 1. Deploy the Mock Somnia AI Agents Platform
  console.log("Deploying MockSomniaAgents...");
  const MockSomniaAgents = await ethers.getContractFactory("MockSomniaAgents");
  const mockPlatform = await MockSomniaAgents.deploy();
  await mockPlatform.waitForDeployment();
  const mockPlatformAddress = await mockPlatform.getAddress();
  console.log(`MockSomniaAgents deployed to: ${mockPlatformAddress}\n`);

  // 2. Deploy AbiCore pointing to the Mock Platform and Owner's Treasury
  console.log("Deploying AbiCore escrow contract...");
  const AbiCore = await ethers.getContractFactory("AbiCore");
  const abiCore = await AbiCore.deploy(mockPlatformAddress, owner.address);
  await abiCore.waitForDeployment();
  const abiCoreAddress = await abiCore.getAddress();
  console.log(`AbiCore deployed to: ${abiCoreAddress}\n`);

  // 3. Post a Job (Client hires Freelancer for 5 STT escrow)
  console.log("--- 1. Posting a job (Client) ---");
  const requirements = "Design a minimal blue logo. No gradients.";
  const escrowAmount = ethers.parseEther("5"); // 5 STT
  
  const postTx = await abiCore.connect(client).postJob(freelancer.address, requirements, {
    value: escrowAmount
  });
  await postTx.wait();
  console.log("Job posted successfully!");

  let job = await abiCore.getJob(1);
  console.log(`Job status: ${job.status} (0 = Open)`);
  console.log(`Job requirements: "${job.requirements}"`);
  console.log(`Escrow locked: ${ethers.formatEther(job.escrowAmount)} STT\n`);

  // 4. Freelancer submits delivery notes
  console.log("--- 2. Submitting delivery (Freelancer) ---");
  const deliveryNote = "Completed wordmark with solid blue palette. Figma link: figma.com/logo";
  const deliverTx = await abiCore.connect(freelancer).submitDelivery(1, deliveryNote);
  await deliverTx.wait();
  console.log("Work delivered successfully!");

  job = await abiCore.getJob(1);
  console.log(`Job status: ${job.status} (1 = Delivered)`);
  console.log(`Delivery note: "${job.deliveryNote}"\n`);

  // 5. Dispute: Both stake 1 STT to raise a dispute
  console.log("--- 3. Staking for dispute (Client & Freelancer) ---");
  const stakeFee = ethers.parseEther("1"); // 1 STT

  console.log("Client staking 1 STT...");
  const clientStakeTx = await abiCore.connect(client).stakeForDispute(1, { value: stakeFee });
  await clientStakeTx.wait();

  console.log("Freelancer staking 1 STT...");
  const freelancerStakeTx = await abiCore.connect(freelancer).stakeForDispute(1, { value: stakeFee });
  await freelancerStakeTx.wait();

  job = await abiCore.getJob(1);
  console.log(`Job status: ${job.status} (2 = Disputed)`);
  console.log(`Client staked: ${job.clientDisputeStaked}`);
  console.log(`Freelancer staked: ${job.freelancerDisputeStaked}\n`);

  // 6. Both parties submit arguments
  console.log("--- 4. Submitting arguments ---");
  const clientArg = "The freelancer used gradients instead of solid colors. It violates the minimal design brief.";
  const freelancerArg = "Brief requested a blue palette, which is followed exactly. Minimal is a subjective descriptor.";

  console.log("Client submitting argument...");
  await (await abiCore.connect(client).submitArgument(1, clientArg)).wait();

  console.log("Freelancer submitting argument...");
  await (await abiCore.connect(freelancer).submitArgument(1, freelancerArg)).wait();
  console.log("Both arguments saved on-chain!\n");

  // 7. Adjudication: Configure AI Mock winner and trigger judgment
  console.log("--- 5. Simulating AI Adjudication (AI rules for Client) ---");
  
  // Convert client address to lowercase hex as mock winner address
  const clientHexAddress = client.address.toLowerCase();
  console.log(`Setting mock AI winner to Client: ${clientHexAddress}`);
  await (await mockPlatform.setMockWinner(clientHexAddress)).wait();

  console.log("Calling judgeDispute (anyone can trigger)...");
  const judgeTx = await abiCore.judgeDispute(1);
  await judgeTx.wait();
  console.log("Judgment requested on-chain!");

  console.log("Triggering asynchronous AI Callback from Mock Platform...");
  const callbackTx = await mockPlatform.triggerCallback(1);
  await callbackTx.wait();
  console.log("AI callback executed successfully!");

  job = await abiCore.getJob(1);
  console.log(`Dispute count: ${job.disputeCount} of 5`);
  console.log(`Job status: ${job.status} (3 = PendingClientChoice)`);
  console.log(`Last Verdict Winner: ${job.lastVerdictWinner}`);
  console.log(`Freelancer win streak: ${job.freelancerWinStreak}\n`);

  // 8. Client Choice: Close or Retry
  console.log("--- 6. Client Choice: Selecting Retry ---");
  console.log("Client decides to give the freelancer another chance (retry)...");
  const retryTx = await abiCore.connect(client).retryJob(1);
  await retryTx.wait();
  console.log("Job reset successfully!");

  job = await abiCore.getJob(1);
  console.log(`Job status: ${job.status} (0 = Open)`);
  console.log(`Escrow locked: ${ethers.formatEther(job.escrowAmount)} STT`);
  console.log(`Delivery note (should be empty): "${job.deliveryNote}"`);
  console.log(`Client argument (should be empty): "${job.clientArgument}"`);
  console.log(`Client staked (should be false): ${job.clientDisputeStaked}\n`);

  console.log("=== End-to-End Simulation Passed Successfully! ===");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
