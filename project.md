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
address  client
address  freelancer
uint256  escrowAmount          // original escrow — never reduced (platform fee comes from Abita's cut)
string   requirements
string   deliveryNote
string   clientArgument
string   freelancerArgument
JobStatus status
uint8    disputeCount          // increments each raiseDispute call, max 5
uint8    freelancerWinStreak   // consecutive freelancer wins, resets on client win
address  lastVerdictWinner     // non-zero after any verdict — key signal for frontend
uint256  pendingRequestId      // Somnia request ID, reset to 0 after callback fires
bool     clientDisputeStaked
bool     freelancerDisputeStaked
```

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
| `judgeDispute(jobId)` | Anyone | status=Disputed, both args submitted | Increments disputeCount, calls Somnia AI, stores platformFeeUsed |
| `handleResponse(requestId, responses[], status, details)` | Somnia platform only | Async callback | Applies verdict, pays treasury, settles or resets |
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

- `judgeDispute` builds a prompt from requirements + deliveryNote + both arguments
- System prompt instructs the model to return ONLY the winning wallet address (hex)
- `allowedValues` constrains the output to either client or freelancer address
- `chainOfThought = true` — full reasoning is recorded on-chain (audit trail)
- `handleResponse` decodes `responses[0].result` as `abi.decode(..., (string))` — NOT a raw string
- If consensus status is not `Success`, the job stays in Disputed (retriable)

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
Mono font:     JetBrains Mono (addresses, tx hashes)
```

### Pages

| Route | Purpose |
|---|---|
| `/` | Homepage — job feed, wallet connect, MarketplaceTeaser |
| `/post` | Post a new job |
| `/job/[id]` | Job detail — delivery, dispute flow, argument chat |
| `/job/[id]/verdict` | Verdict reveal — winner card, client choice, audit link |

### Key Components

| Component | Purpose |
|---|---|
| `DisputeProgress` | Pip tracker (1–5). Props: `completedCount`, `isDisputeActive`. Completed pips show ✅, active pip pulses |
| `DisputeFlow` | Approve/dispute buttons. Re-appeal mode when `status=0 && hasDelivery`. Approve is disabled in re-appeal (freelancer must re-confirm first) |
| `DisputeArguments` | Argument submission form + chat history timeline from localStorage |
| `ClientChoice` | Close vs Retry slide-in cards (status=3 only) |
| `VerdictReveal` | Winner card with Client/Freelancer badge, audit receipt button |
| `MarketplaceTeaser` | "Coming Soon" section on homepage |

### Verdict Detection

```ts
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const hasVerdict = !!contractJob &&
  !!job.lastVerdictWinner &&
  job.lastVerdictWinner.toLowerCase() !== ZERO_ADDRESS;
```

**Do NOT use `job.status` alone** — after a freelancer single win, status resets to Open (0) but `lastVerdictWinner` is set. Status-based detection would miss the verdict.

### Re-appeal State (status=0 + delivery exists)

After a freelancer single win (streak=1), status goes back to Open but `deliveryNote` is not cleared. The client sees:
- **Approve Delivery** card — disabled, says "Freelancer must re-confirm delivery"
- **Re-appeal Dispute** card — active, allows staking 1 STT for another round

The freelancer sees a blue info banner + the DeliveryForm to re-confirm.

Once freelancer re-submits → status=Delivered → approve becomes active.

### localStorage — Namespace

All localStorage keys are prefixed with the first 8 chars of the contract address to prevent stale data bleeding across deployments:

```ts
const contractSlug = ABICORE_CONTRACT_ADDRESS.slice(2, 10).toLowerCase();
// e.g. "abita_0654943e_job_1_history"
//      "abita_0654943e_job_1_last_request_id"
```

After a redeploy with a new address, old keys are automatically orphaned.

### Hooks

| Hook | What it does |
|---|---|
| `useJobData` | Reads full Job struct. Polls every 5s when status=Disputed |
| `usePostJob` | Calls `postJob` with escrow value |
| `useSubmitDelivery` | Calls `submitDelivery` |
| `useApproveDelivery` | Calls `approveDelivery` |
| `useRaiseDispute` | Calls `stakeForDispute` with exactly 1 STT |
| `useSubmitArgument` | Calls `submitArgument` |
| `useJudgeDispute` | Calls `judgeDispute` (non-payable, uses staked funds on-chain) |
| `useCloseJob` | Calls `closeJob` |
| `useRetryJob` | Calls `retryJob` |

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

---

## Deployment Checklist

1. `npm run compile` — from project root
2. `npm run deploy` — deploys to Somnia testnet
3. Copy new contract address from output
4. Update `ABICORE_CONTRACT_ADDRESS` in `frontend/lib/config.ts`
5. Clear browser localStorage keys with old contract prefix (or just use a new browser profile)
6. Verify `LLM_AGENT_ID` constant matches the actual agent ID on `https://agents.testnet.somnia.network`

---

## Environment Variables

`.env` at project root (never committed):

```
PRIVATE_KEY=your_deployer_wallet_private_key
```

Used by `hardhat.config.ts` to sign deployment transactions on Somnia testnet.

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
│   ├── get-fee.ts                ← Queries getRequestDeposit()
│   ├── debug-judge.ts            ← Debug AI judging
│   └── test-flow.ts              ← End-to-end simulation
├── frontend/
│   ├── app/
│   │   ├── page.tsx              ← Homepage + MarketplaceTeaser
│   │   ├── post/page.tsx         ← Post a job
│   │   ├── job/[id]/page.tsx     ← Job detail
│   │   └── job/[id]/verdict/page.tsx ← Verdict reveal
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
│       ├── abi.ts                ← AbiCore ABI (must be updated after redeploy if sig changed)
│       ├── config.ts             ← Chain config + ABICORE_CONTRACT_ADDRESS
│       └── types.ts
├── directives/
│   ├── contracts.md
│   ├── frontend.md
│   └── learnings.md
├── AGENTS.md                     ← Source of truth for product rules
├── CLAUDE.md                     ← Mirror of AGENTS.md
├── GEMINI.md                     ← Mirror of AGENTS.md
└── project.md                    ← This file
```
