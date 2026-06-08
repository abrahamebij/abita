/**
 * Abita Keeper Bot
 * ----------------
 * Watches on-chain for jobs in status=Disputed where both arguments have been
 * submitted, then automatically calls judgeDispute() so no human has to.
 *
 * This transforms Abita from "AI-assisted" to fully autonomous —
 * once a dispute is staked and argued, the AI verdict happens without
 * any manual trigger.
 *
 * Usage:
 *   npx tsx scripts/keeper.ts
 *
 * Requires in .env:
 *   PRIVATE_KEY=0x...          (keeper wallet — needs enough STT for gas only)
 *   ABICORE_ADDRESS=0x...      (deployed AbiCore contract address)
 */

import { createPublicClient, createWalletClient, http, defineChain, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env from wherever the script is run (project root)
dotenv.config({ path: resolve(process.cwd(), ".env") });

// ─── Config ───────────────────────────────────────────────────────────────────

const CONTRACT_ADDRESS = (process.env.ABICORE_ADDRESS || "") as `0x${string}`;
const rawKey = process.env.PRIVATE_KEY || "";
// viem requires the 0x prefix — add it if the .env value doesn't have it
const PRIVATE_KEY = (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) as `0x${string}`;
const POLL_INTERVAL_MS = 30_000; // scan every 30 seconds

if (!CONTRACT_ADDRESS) {
  console.error("[Keeper] ERROR: ABICORE_ADDRESS is not set in .env");
  process.exit(1);
}
if (!PRIVATE_KEY) {
  console.error("[Keeper] ERROR: PRIVATE_KEY is not set in .env");
  process.exit(1);
}

// ─── Somnia Testnet ───────────────────────────────────────────────────────────

const somnia = defineChain({
  id: 50312,
  name: "Somnia Testnet",
  nativeCurrency: { name: "Somnia Token", symbol: "STT", decimals: 18 },
  rpcUrls: { default: { http: ["https://dream-rpc.somnia.network"] } },
  blockExplorers: {
    default: { name: "Shannon Explorer", url: "https://shannon-explorer.somnia.network" },
  },
});

// ─── Minimal ABI (only what the keeper needs) ─────────────────────────────────

const ABI = [
  {
    name: "getTotalJobs",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getJob",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "client", type: "address" },
          { name: "freelancer", type: "address" },
          { name: "escrowAmount", type: "uint256" },
          { name: "requirements", type: "string" },
          { name: "deliveryNote", type: "string" },
          { name: "clientArgument", type: "string" },
          { name: "freelancerArgument", type: "string" },
          { name: "status", type: "uint8" },
          { name: "disputeCount", type: "uint8" },
          { name: "freelancerWinStreak", type: "uint8" },
          { name: "lastVerdictWinner", type: "address" },
          { name: "lastVerdictReason", type: "string" },
          { name: "pendingRequestId", type: "uint256" },
          { name: "judgmentRequestIds", type: "uint256[]" },
          { name: "clientDisputeStaked", type: "bool" },
          { name: "freelancerDisputeStaked", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "judgeDispute",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] [Abita Keeper] ${msg}`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Core Logic ───────────────────────────────────────────────────────────────

async function scan(
  publicClient: ReturnType<typeof createPublicClient<typeof http, typeof somnia>>,
  walletClient: ReturnType<typeof createWalletClient<typeof http, typeof somnia>>
) {
  const totalJobs = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getTotalJobs",
  });

  if (totalJobs === 0n) {
    log("No jobs on-chain yet. Waiting...");
    return;
  }

  log(`Scanning ${totalJobs} job(s)...`);

  for (let i = 1n; i <= totalJobs; i++) {
    const job = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "getJob",
      args: [i],
    });

    const {
      status,
      clientArgument,
      freelancerArgument,
      pendingRequestId,
      escrowAmount,
      disputeCount,
    } = job;

    // A job is ready for judgment when:
    //   status = 2 (Disputed)
    //   both parties have submitted their arguments
    //   no AI request is already pending (pendingRequestId == 0)
    const isDisputed = status === 2;
    const bothArgsIn = clientArgument.trim() !== "" && freelancerArgument.trim() !== "";
    const noPendingRequest = pendingRequestId === 0n;

    if (isDisputed && bothArgsIn && noPendingRequest) {
      log(
        `Job #${i} → ready. ` +
        `Escrow: ${formatEther(escrowAmount)} STT | ` +
        `Round ${disputeCount + 1} of 5. ` +
        `Triggering AI judgment...`
      );

      try {
        const hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: "judgeDispute",
          args: [i],
          chain: somnia,
        });
        log(`Job #${i} → judgeDispute sent ✓  tx: ${hash}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        log(`Job #${i} → judgeDispute FAILED: ${msg}`);
      }

    } else if (isDisputed && !bothArgsIn) {
      const missing = [];
      if (!clientArgument.trim()) missing.push("client");
      if (!freelancerArgument.trim()) missing.push("freelancer");
      log(`Job #${i} → Disputed but awaiting argument from: ${missing.join(", ")}`);

    } else if (isDisputed && pendingRequestId !== 0n) {
      log(`Job #${i} → AI request already in flight (requestId: ${pendingRequestId})`);
    }
    // All other statuses (Open, Delivered, PendingClientChoice, Closed) are silently skipped
  }
}

// ─── Main Loop ────────────────────────────────────────────────────────────────

async function main() {
  const account = privateKeyToAccount(PRIVATE_KEY);

  const publicClient = createPublicClient({
    chain: somnia,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: somnia,
    transport: http(),
  });

  // Show keeper wallet balance so Abraham knows it has enough STT for gas
  const balance = await publicClient.getBalance({ address: account.address });
  log(`Started. Contract: ${CONTRACT_ADDRESS}`);
  log(`Keeper wallet: ${account.address} | Balance: ${formatEther(balance)} STT`);
  log(`Poll interval: ${POLL_INTERVAL_MS / 1000}s\n`);

  if (balance < 10n ** 16n) {
    // warn if below 0.01 STT — keeper needs gas
    log("WARNING: Keeper wallet balance is very low. Top it up to keep the bot running.");
  }

  // Run immediately on start, then every POLL_INTERVAL_MS
  while (true) {
    try {
      await scan(publicClient, walletClient);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`Scan error: ${msg}`);
    }
    await sleep(POLL_INTERVAL_MS);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
