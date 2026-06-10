# Abita — Project Reference

> *From arbiter — one who judges.*
> On-chain AI dispute resolution for freelance work, built on Somnia.

---

## What Abita Is

A trustless freelance escrow platform where payments are locked on-chain and disputes are judged by a decentralized AI subcommittee on the Somnia network. No human arbitrators. No central authority. The AI verdict is binding and auditable — every piece of reasoning is recorded on-chain and publicly verifiable via the Somnia Agent Explorer.

**Business model:** Abita earns **1.76 STT** every time a dispute is judged (originally designed as 2 STT, minus the 0.24 STT Somnia platform fee which comes from Abita's cut, not the winner's escrow).

**V2 teaser:** A marketplace where clients and freelancers discover each other is coming in V2. The homepage includes a "Coming Soon — Abita Marketplace" section.

---

## Somnia Network

| Property | Value |
|---|---|
| RPC | `https://dream-rpc.somnia.network` |
| Chain ID | `50312` |
| Explorer | `https://shannon-explorer.somnia.network` |
| Agent Platform contract | `0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776` |
| Agent Explorer | `https://agents.testnet.somnia.network` |
| Receipt URL format | `https://agents.testnet.somnia.network/receipts/{requestId}` |
| Native token | STT (1 STT = 1e18 wei) |

---

## Contract — AbiCore.sol

### Deployment

- Compiled and deployed via Hardhat: `npm run compile` then `npm run deploy`
- Config is at `contracts/hardhat.config.ts`
- Deploy script: `scripts/deploy.ts` — deploys with `platformAddress` and `treasuryAddress` (currently deployer wallet)
- After deploy: update `ABICORE_CONTRACT_ADDRESS` in `frontend/lib/config.ts`
- Also update `ABICORE_ADDRESS` in `.env` for the keeper bot

### Job State Machine

```
Open → Delivered → Disputed → PendingClientChoice → Closed
                                  ↘ Open (after freelancer single win, streak < 2)
```

| Status | Value | Meaning |
|---|---|---|
| Open | 0 | Job posted, awaiting freelancer delivery |
| Delivered | 1 | Freelancer submitted, client reviewing |
| Disputed | 2 | AI judgment in progress (both staked) |
| PendingClientChoice | 3 | Client won — must choose Close or Retry |
| Closed | 4 | Final — paid out or refunded |

### Job Struct Fields

```solidity
address   client
address   freelancer
uint256   escrowAmount            // original escrow — never reduced (platform fee comes from Abita's cut)
string    requirements
string    deliveryNote
string    clientArgument
string    freelancerArgument
JobStatus status
uint8     disputeCount            // increments each raiseDispute call, max 5
uint8     freelancerWinStreak     // consecutive freelancer wins, resets on client win
address   lastVerdictWinner       // non-zero after any verdict — key signal for frontend
string    lastVerdictReason       // AI-written one-sentence explanation for the verdict
uint256   pendingRequestId        // Somnia request ID, reset to 0 after callback fires
uint256[] judgmentRequestIds      // ALL Somnia request IDs ever issued — one per round, never cleared
bool      clientDisputeStaked
bool      freelancerDisputeStaked
```

**Important field order for ABI/hook mapping (0-indexed):**

| Index | Field |
|---|---|
| 0 | client |
| 1 | freelancer |
| 2 | escrowAmount |
| 3 | requirements |
| 4 | deliveryNote |
| 5 | clientArgument |
| 6 | freelancerArgument |
| 7 | status |
| 8 | disputeCount |
| 9 | freelancerWinStreak |
| 10 | lastVerdictWinner |
| 11 | lastVerdictReason |
| 12 | pendingRequestId |
| 13 | judgmentRequestIds |
| 14 | clientDisputeStaked |
| 15 | freelancerDisputeStaked |

### Private Mappings

```solidity
mapping(uint256 => uint256) requestToJob      // Somnia requestId → jobId
mapping(uint256 => uint256) platformFeeUsed   // jobId → STT paid to Somnia platform
```

### Functions

| Function | Who | When | Notes |
|---|---|---|---|
| `postJob(freelancer, requirements)` | Client | Any | Payable — msg.value = escrow |
| `submitDelivery(jobId, note)` | Freelancer | status=Open | Moves to Delivered |
| `approveDelivery(jobId)` | Client | status=Delivered | Releases escrow to freelancer |
| `stakeForDispute(jobId)` | Either | status=Delivered or Open | Requires exactly 1 STT. Both must stake to trigger Disputed |
| `submitArgument(jobId, arg)` | Either | status=Disputed | Stores argument per party |
| `judgeDispute(jobId)` | Anyone | status=Disputed, both args submitted | Increments disputeCount, calls Somnia AI, stores platformFeeUsed, pushes to judgmentRequestIds |
| `handleResponse(requestId, responses[], status, details)` | Somnia platform only | Async callback | Parses JSON, applies verdict, stores reason, pays treasury, settles or resets |
| `closeJob(jobId)` | Client | status=PendingClientChoice | Refunds escrow to client |
| `retryJob(jobId)` | Client | status=PendingClientChoice | Resets to Open, clears delivery/args/stakes |
| `getJob(jobId)` | Anyone | Any | Returns full Job struct |
| `getTotalJobs()` | Anyone | Any | Returns jobCounter |

### Dispute Logic (read carefully)

**Max 5 disputes per job.** `disputeCount` increments every `judgeDispute` call.

**Disputes 1–4 (normal):**

If AI rules for **CLIENT**:
- `freelancerWinStreak = 0`
- `status = PendingClientChoice`
- Client chooses:
  - **Close** → escrow refunded to client. Closed.
  - **Retry** → status = Open, delivery/args/stakes cleared. Freelancer re-delivers.

If AI rules for **FREELANCER**:
- `freelancerWinStreak++`
- If streak ≥ 2: escrow released to freelancer immediately. Closed.
- If streak == 1: status = Open (client gets one more chance to dispute OR accept)

**Dispute 5 (final):**
- Whoever AI picks gets the escrow. Closed. No choices. Immutable.

### Fee Model

| Actor | Gets |
|---|---|
| Winner | Full `escrowAmount` (5 STT in demo) |
| Abita treasury | `2 STT - platformFeeUsed` = 1.76 STT |
| Somnia platform | `platformFeeUsed` = 0.24 STT |

- `platformFeeUsed` = `getRequestDeposit()` (0.03 STT floor) + `LLM_COST_PER_AGENT * SUBCOMMITTEE_SIZE` (0.07 × 3 = 0.21 STT) = **0.24 STT**
- The platform fee is stored in `platformFeeUsed[jobId]` in `judgeDispute` and deducted from treasury in `handleResponse`
- The winner's escrow is **never touched** by the AI fee

### AI Integration (Somnia LLM Inference)

```solidity
uint256 public constant LLM_AGENT_ID = 12847293847561029384;
uint256 public constant SUBCOMMITTEE_SIZE = 3;
uint256 public constant LLM_COST_PER_AGENT = 0.07 ether;
```

**AI now returns JSON, not a bare address:**

```json
{"winner":"0x4bEAB1d04cdcc6f73c24Ec643e1326C7F3756A88","reason":"The freelancer delivered a blue palette wordmark as specified; the minimal style requirement is subjective and the client did not define it further."}
```

- `allowedValues` is an **empty array** — the response is JSON and cannot be constrained to two address values
- `chainOfThought = true` — full reasoning is recorded on-chain (audit trail)
- `_extractJsonField(json, key)` — pure Solidity helper parses the JSON string by scanning for `"key":"` pattern and reading until the closing quote
- `winnerStr` = extracted `winner` field → compared via `keccak256` to client/freelancer hex strings
- `lastVerdictReason` = extracted `reason` field → stored permanently on the Job struct
- If JSON parsing fails (malformed response), falls back to freelancer as winner, stores full raw response as reason
- `judgmentRequestIds.push(requestId)` — every round's Somnia request ID is permanently recorded

### `_extractJsonField` Helper

```solidity
function _extractJsonField(string memory json, string memory key)
    internal pure returns (string memory)
```

- Builds search pattern `"key":"` and scans raw bytes
- Reads value bytes until unescaped closing quote
- Returns empty string if key not found
- Note: `match` is a reserved keyword in Solidity — variable is named `found`

### handleResponse Signature (must match exactly)

```solidity
function handleResponse(
    uint256 requestId,
    Response[] calldata responses,
    ResponseStatus status,
    AgentRequest calldata /* details */
) external
```

The `Response` and `AgentRequest` structs come from `contracts/interfaces/ISomniaAgents.sol`.

---

## Autonomous Keeper Bot

**File:** `scripts/keeper.ts`

**Purpose:** Watches on-chain for jobs in `status=Disputed` where both arguments are submitted and no AI request is pending. Automatically calls `judgeDispute` — this makes Abita fully autonomous (no human needs to trigger judgment).

**Why this matters:** Somnia's hackathon "Autonomous Performance" criterion specifically looks for systems that operate without manual intervention. The keeper transforms Abita from "AI-assisted" to "fully autonomous".

**Run:** `npm run keeper`

**How it works:**
1. Polls every 30 seconds
2. Reads `getTotalJobs()`, then `getJob(i)` for each job
3. Triggers `judgeDispute(i)` when: `status === 2 (Disputed)` AND `clientArgument !== ""` AND `freelancerArgument !== ""` AND `pendingRequestId === 0n`
4. The `pendingRequestId === 0` guard prevents double-firing if a request is already in flight
5. Logs all actions to console with timestamps

**Environment:**

`.env` at project root requires:
```
PRIVATE_KEY=0x...    # deployer/keeper wallet private key (with 0x prefix)
ABICORE_ADDRESS=0x... # deployed contract address
```

**The keeper's inline ABI** (in `scripts/keeper.ts`) must stay in sync with `frontend/lib/abi.ts` — any new Job struct fields must be added to both.

---

## Frontend

### Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| Animations | Framer Motion |
| Web3 | wagmi v2 + viem |
| Toasts | Sonner |

### Design System (non-negotiable)

```
Background:    #0A0C14
Surface:       #12151F
Border:        #1E2436
Text primary:  #F0F2FF
Text muted:    #6B7280
Gold accent:   #D4A017   (verdicts, wins)
Red:           #EF4444   (client wins, closed)
Green:         #10B981   (freelancer wins, approvals)

Display font:  Fraunces (serif)
Body font:     Inter
Mono font:     JetBrains Mono (addresses, tx hashes, AI reasoning)
```

### Pages

| Route | Purpose |
|---|---|
| `/` | Homepage — job feed, wallet connect, MarketplaceTeaser |
| `/post` | Post a new job |
| `/job/[id]` | Job detail — delivery, dispute flow, argument chat |
| `/job/[id]/verdict` | Verdict reveal — winner card, AI reasoning, per-round receipts, client choice |

### Key Components

| Component | Purpose |
|---|---|
| `DisputeProgress` | Pip tracker (1–5). Props: `completedCount`, `isDisputeActive`. Completed pips show ✅, active pip pulses |
| `DisputeFlow` | Approve/dispute buttons. Re-appeal mode when `status=0 && hasDelivery`. Approve is disabled in re-appeal (freelancer must re-confirm first) |
| `DisputeArguments` | Argument submission form + chat history timeline from localStorage |
| `ClientChoice` | Close vs Retry slide-in cards (status=3 only) |
| `VerdictReveal` | Winner card with Client/Freelancer badge, AI reasoning block, per-round receipt list |
| `MarketplaceTeaser` | "Coming Soon" section on homepage |

### Verdict Page — Key Logic

**Verdict detection:**
```ts
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const hasVerdict = !!contractJob &&
  !!job.lastVerdictWinner &&
  job.lastVerdictWinner.toLowerCase() !== ZERO_ADDRESS;
```
**Do NOT use `job.status` alone** — after a freelancer single win, status resets to Open (0) but `lastVerdictWinner` is set.

**Request ID display (deliberating screen):**
```tsx
{job.pendingRequestId !== 0n && (
  <span>#{job.pendingRequestId.toString()}</span>
)}
```
`pendingRequestId` is non-zero while the Somnia request is in flight. After callback fires, it resets to 0.

**AI Reasoning block:**
```tsx
{job.lastVerdictReason && (
  <p className="font-mono italic">"{job.lastVerdictReason}"</p>
)}
```
Fades in 0.4s after the winner card. Displays the AI's one-sentence justification in mono italic.

**Audit receipt list (per round):**
```tsx
const requestIds = (job.judgmentRequestIds ?? []).map(id => id.toString());

{requestIds.map((id, idx) => (
  <Link href={`https://agents.testnet.somnia.network/receipts/${id}`}>
    Round {idx + 1} — #{id}
  </Link>
))}
```
- Sourced **directly from the contract** — no localStorage, no `getLogs`, no block range issues
- One row per dispute round, each linking to its Somnia audit receipt
- `judgmentRequestIds` is a permanent on-chain array — always available regardless of when the page is loaded

### Re-appeal State (status=0 + delivery exists)

After a freelancer single win (streak=1), status goes back to Open but `deliveryNote` is not cleared. The client sees:
- **Approve Delivery** card — disabled, says "Freelancer must re-confirm delivery"
- **Re-appeal Dispute** card — active, allows staking 1 STT for another round

The freelancer sees a blue info banner + the DeliveryForm to re-confirm.

Once freelancer re-submits → status=Delivered → approve becomes active.

### localStorage — Namespace

All localStorage keys (argument history) are prefixed with the first 8 chars of the contract address to prevent stale data bleeding across deployments:

```ts
const contractSlug = ABICORE_CONTRACT_ADDRESS.slice(2, 10).toLowerCase();
// e.g. "abita_0654943e_job_1_history"
```

After a redeploy with a new address, old keys are automatically orphaned.

**The verdict page no longer uses localStorage at all** — `lastVerdictReason` and `judgmentRequestIds` are read directly from the contract.

### Hooks

| Hook | What it does |
|---|---|
| `useJobData` | Reads full Job struct. Polls every 5s when status=Disputed. Maps tuple by field name (wagmi returns named fields) with index fallback |
| `usePostJob` | Calls `postJob` with escrow value |
| `useSubmitDelivery` | Calls `submitDelivery` |
| `useApproveDelivery` | Calls `approveDelivery` |
| `useRaiseDispute` | Calls `stakeForDispute` with exactly 1 STT |
| `useSubmitArgument` | Calls `submitArgument` |
| `useJudgeDispute` | Calls `judgeDispute` (non-payable, uses staked funds on-chain) |
| `useCloseJob` | Calls `closeJob` |
| `useRetryJob` | Calls `retryJob` |

**`useJobData` field mapping must stay in sync with the struct.** If new fields are added to the contract, update:
1. `contracts/AbiCore.sol` — struct definition
2. `frontend/lib/abi.ts` — `getJob` outputs tuple
3. `frontend/lib/types.ts` — `Job` interface
4. `frontend/hooks/useJobData.ts` — tuple index mapping
5. `scripts/keeper.ts` — inline ABI `getJob` components

---

## Known Bugs Fixed (Session History)

| Bug | Root Cause | Fix |
|---|---|---|
| `handleResponse` never fired | Signature mismatch — used `string[]` instead of `Response[]` | Updated to `Response[] calldata, ResponseStatus, AgentRequest calldata` |
| Runners ignored requests | Platform fee was only the floor (0.03 STT); `perAgentBudget=0` | Total fee = floor + 0.07 × 3 = 0.24 STT |
| Audit URL 404 | `/request/{id}` is wrong | Correct format is `/receipts/{id}` |
| `approveDelivery` reverted | `job.escrowAmount` was being reduced by platform fee, causing shortfall | Platform fee now stored in `platformFeeUsed` mapping; treasury absorbs it |
| Verdict not showing on page load | `showWinner` was a useState needing a useEffect; missed on initial render | Replaced with computed `hasVerdict` derived from `lastVerdictWinner` |
| Verdict wrong when status=0 | `hasVerdict` checked `status !== 0` but freelancer single win resets to Open | Now checks `lastVerdictWinner !== ZERO_ADDRESS` |
| No re-appeal UI after freelancer win | `DisputeFlow` only showed actions on status=1 | Added `hasDelivery` prop; shows re-appeal on status=0 with delivery |
| Old history on new contract | localStorage keyed by jobId only | Keys now prefixed with contract address slug |
| DisputeProgress pip states wrong | `currentDispute=1` showed pip 1 as active, not completed | Refactored to `completedCount` + `isDisputeActive` props; done pips show ✅ |
| Platform fee from escrow | `job.escrowAmount -= totalDeposit` in judgeDispute | Removed; fee tracked in `platformFeeUsed` mapping, deducted from treasury |
| `auditRequestId` not showing | `getLogs fromBlock:0n` rejected by Somnia RPC (range too large) | Removed getLogs entirely; `judgmentRequestIds[]` on struct is the source of truth |
| Keeper private key error | `.env` key had `0x` prefix but viem expected raw hex | Strip `0x` prefix before passing to `privateKeyToAccount`: `key.startsWith('0x') ? key.slice(2) : key` |
| Keeper ABI mismatch | Keeper inline ABI was missing `lastVerdictReason` and `judgmentRequestIds` | Added both fields at correct positions (11 and 13) |
| Solidity `match` keyword error | `match` is a reserved keyword in Solidity 0.8.x | Renamed to `found` in `_extractJsonField` helper |
| TypeScript type errors on new fields | `Job` interface and `useJobData` mapping only had 14 fields | Added `lastVerdictReason` and `judgmentRequestIds` to types.ts, useJobData.ts, and both fallback objects |

---

## Deployment Checklist

1. `npm run compile` — from project root
2. `npm run deploy` — deploys to Somnia testnet
3. Copy new contract address from output
4. Update `ABICORE_CONTRACT_ADDRESS` in `frontend/lib/config.ts`
5. Update `ABICORE_ADDRESS` in `.env` (for keeper bot)
6. Clear browser localStorage keys with old contract prefix (or use a fresh browser profile)
7. Verify `LLM_AGENT_ID` constant matches the actual agent ID on `https://agents.testnet.somnia.network`
8. Run `npm run keeper` to start the autonomous judgment bot

---

## Environment Variables

`.env` at project root (never committed):

```
PRIVATE_KEY=0x...          # deployer/keeper wallet private key (with 0x prefix)
ABICORE_ADDRESS=0x...      # deployed AbiCore contract address
```

`PRIVATE_KEY` is used by `hardhat.config.ts` for deployment and by `keeper.ts` for signing `judgeDispute` transactions.

---

## Directory Structure

```
abita/
├── contracts/
│   ├── AbiCore.sol               ← Main contract
│   ├── interfaces/
│   │   └── ISomniaAgents.sol     ← Response, AgentRequest structs + platform interface
│   └── hardhat.config.ts
├── scripts/
│   ├── deploy.ts                 ← Deploys AbiCore
│   ├── keeper.ts                 ← Autonomous keeper bot (watches + auto-judges disputes)
│   ├── get-fee.ts                ← Queries getRequestDeposit()
│   ├── debug-judge.ts            ← Debug AI judging
│   └── test-flow.ts              ← End-to-end simulation
├── frontend/
│   ├── app/
│   │   ├── page.tsx              ← Homepage + MarketplaceTeaser
│   │   ├── post/page.tsx         ← Post a job
│   │   ├── job/[id]/page.tsx     ← Job detail
│   │   └── job/[id]/verdict/page.tsx ← Verdict reveal (winner, reason, receipts)
│   ├── components/
│   │   ├── DisputeProgress.tsx
│   │   ├── DisputeFlow.tsx
│   │   ├── DisputeArguments.tsx
│   │   ├── ClientChoice.tsx
│   │   ├── VerdictReveal.tsx
│   │   ├── MarketplaceTeaser.tsx
│   │   └── ui/
│   ├── hooks/                    ← One hook per contract function
│   └── lib/
│       ├── abi.ts                ← AbiCore ABI (must match contract struct exactly)
│       ├── config.ts             ← Chain config + ABICORE_CONTRACT_ADDRESS
│       └── types.ts              ← Job interface (must match struct field order)
├── directives/
│   ├── contracts.md
│   ├── frontend.md
│   └── learnings.md
├── AGENTS.md                     ← Source of truth for product rules
├── CLAUDE.md                     ← Mirror of AGENTS.md
├── GEMINI.md                     ← Mirror of AGENTS.md
└── project.md                    ← This file
```
