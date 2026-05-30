# AGENTS.md — Abita

> Mirror this file as `CLAUDE.md` and `GEMINI.md` in the project root.
> Whichever AI environment you're in, these are your standing orders.

---

## Who you are

You are the AI agent for **Abita** — an on-chain AI dispute resolution platform
for freelance work, built on Somnia.

Your job is to help Abraham ship a polished, working product in 7 days.

Abraham is a graphic designer and frontend developer. Strong in UI/UX, React,
Next.js, and Tailwind. New to Solidity but not to shipping under pressure.
You are his senior developer. Explain every Solidity decision in plain English.
Never assume prior smart contract knowledge.

---

## The product

**Abita** (from *arbiter* — one who judges) is a trustless freelance escrow
platform powered by an on-chain AI judge.

A client posts a job, locks payment in escrow, and defines the requirements.
The freelancer delivers. If both parties agree, payment releases. If there's a
dispute, both parties stake a fixed **1 STT fee** and submit their arguments —
a deterministic Somnia AI agent delivers a binding, auditable verdict.

**Abita earns 2 STT every time a dispute is judged. That is the business model.**

**The marketplace** (where clients and freelancers discover each other) is coming
in V2. The frontend should include a "Coming Soon — Abita Marketplace" section
on the homepage so judges understand the full vision.

---

## Dispute logic — read this carefully, implement it exactly

### The cap

**Maximum 5 disputes per job.** `disputeCount` tracks this on-chain.
Every time `raiseDispute` is called, `disputeCount` increments.
At `disputeCount == 5`, the AI gives a final and absolute verdict. No choices. No retries.

### Disputes 1–4 (normal flow)

Both parties stake 1 STT. Both submit arguments. AI judges.

**If AI rules for CLIENT:**
```
→ Abita keeps 2 STT
→ freelancerWinStreak resets to 0
→ status = PendingClientChoice
→ Client chooses:
    A) Close job → escrow refunded to client. status = Closed. Final.
    B) Retry → escrow stays locked. status = Open. freelancer must re-deliver.
       (client can keep disputing new deliveries — each costs both parties 1 STT)
```

**If AI rules for FREELANCER:**
```
→ Abita keeps 2 STT
→ freelancerWinStreak++
→ If freelancerWinStreak >= 2:
    → escrow releases to freelancer immediately. status = Closed. Final.
→ If freelancerWinStreak == 1:
    → Client gets exactly ONE more dispute opportunity
    → status = Open (client can raise dispute again, which uses another disputeCount)
```

### Dispute 5 (final verdict)

Both stake 1 STT. Both submit arguments. AI judges.

```
If AI rules for FREELANCER → escrow releases to freelancer. status = Closed. Final.
If AI rules for CLIENT     → escrow refunded to client.    status = Closed. Final.
No PendingClientChoice. No retry. No further disputes. Immutable.
```

### State variables required per job

```solidity
uint8   disputeCount         // total disputes raised on this job (max 5)
uint8   freelancerWinStreak  // consecutive freelancer wins (resets on client win)
bool    pendingClientChoice  // true when client must choose close vs retry
```

---

## The stack

| Layer | Technology |
|---|---|
| Smart contracts | Solidity 0.8.x, Hardhat |
| Frontend | Next.js 16 (`next@latest`), Tailwind v4, shadcn/ui, Framer Motion, wagmi v2 + viem |
| On-chain AI | Somnia Agents — LLM Inference agent |

**Somnia Testnet**
- RPC: `https://dream-rpc.somnia.network`
- Chain ID: `50312`
- Explorer: `https://shannon-explorer.somnia.network`
- Agent Platform contract: `0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776`
- Agent Explorer: `https://agents.testnet.somnia.network`
- Dispute fee: `1 ether` (1 STT = 1e18 wei)

---

## Project structure

```
abita/
├── AGENTS.md                 ← You are here
├── CLAUDE.md                 ← Mirror of AGENTS.md
├── GEMINI.md                 ← Mirror of AGENTS.md
├── .env                      ← Never commit. Keys live here.
├── .gitignore
│
├── contracts/
│   ├── AbiCore.sol           ← Main contract
│   ├── interfaces/
│   │   └── ISomniaAgents.sol ← Somnia platform interface
│   └── hardhat.config.js
│
├── scripts/
│   ├── deploy.js             ← Deploy AbiCore to Somnia testnet
│   ├── test-flow.js          ← Full end-to-end test: post → deliver → dispute → verdict
│   └── get-fee.js            ← Query required agent deposit
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                        ← Dashboard + "Marketplace Coming Soon" section
│   │   ├── post/page.tsx                   ← Post a new job
│   │   ├── job/[id]/page.tsx               ← Job detail: delivery, dispute, status
│   │   └── job/[id]/verdict/page.tsx       ← Verdict reveal + client choice
│   ├── components/
│   │   ├── PostJobModal.tsx
│   │   ├── JobCard.tsx
│   │   ├── DeliveryForm.tsx
│   │   ├── DisputeFlow.tsx
│   │   ├── VerdictReveal.tsx               ← Build this last. Build it perfectly.
│   │   ├── ClientChoice.tsx                ← Close vs Retry (disputes 1-4 only)
│   │   ├── DisputeProgress.tsx             ← Shows "Dispute 2 of 5" etc.
│   │   ├── MarketplaceTeaser.tsx           ← "Coming Soon" section on homepage
│   │   └── ui/
│   ├── hooks/
│   │   ├── usePostJob.ts
│   │   ├── useSubmitDelivery.ts
│   │   ├── useApproveDelivery.ts
│   │   ├── useRaiseDispute.ts
│   │   ├── useSubmitArgument.ts
│   │   ├── useJudgeDispute.ts
│   │   ├── useCloseJob.ts
│   │   ├── useRetryJob.ts
│   │   └── useJobData.ts                   ← Polls every 5s while status = Disputed
│   └── lib/
│       ├── abi.ts
│       ├── config.ts                       ← wagmi chain config + contract address
│       └── types.ts
│
└── directives/
    ├── contracts.md          ← Solidity decisions + Somnia interface notes
    ├── frontend.md           ← Component map, design rules, animation specs
    └── learnings.md          ← Errors hit, how fixed, what to avoid next time
```

---

## Contract: AbiCore.sol

```solidity
// SPDX-License-Identifier: MIT
// Full implementation — do not stub. Write every function completely.

enum JobStatus {
    Open,                // job posted, awaiting delivery
    Delivered,           // freelancer submitted, client reviewing
    Disputed,            // AI judgment in progress
    PendingClientChoice, // client must choose: close or retry (disputes 1-4 only)
    Closed               // final state — paid out or refunded
}

struct Job {
    address  client;
    address  freelancer;
    uint256  escrowAmount;
    string   requirements;
    string   deliveryNote;
    string   clientArgument;
    string   freelancerArgument;
    JobStatus status;
    uint8    disputeCount;          // increments each time raiseDispute is called
    uint8    freelancerWinStreak;   // resets to 0 on any client win
    address  lastVerdictWinner;
    uint256  pendingRequestId;
    bool     clientDisputeStaked;
    bool     freelancerDisputeStaked;
}
```

**All required functions:**

```
postJob(address freelancer, string requirements)
  → payable. msg.value = job payment (escrow).
  → requires msg.value > 0.
  → emits JobPosted(jobId, client, freelancer, escrowAmount)

submitDelivery(uint256 jobId, string deliveryNote)
  → only freelancer. status must be Open.
  → sets deliveryNote, status = Delivered.
  → emits DeliverySubmitted(jobId, deliveryNote)

approveDelivery(uint256 jobId)
  → only client. status must be Delivered.
  → transfers escrow to freelancer. status = Closed.
  → emits JobClosed(jobId, freelancer, escrowAmount)

stakeForDispute(uint256 jobId)
  → payable. msg.value must equal exactly 1 ether (1 STT).
  → callable by client or freelancer. status must be Delivered or Open (after retry).
  → tracks who has staked. once BOTH have staked → status = Disputed.
  → requires disputeCount < 5.
  → emits DisputeStaked(jobId, msg.sender)

submitArgument(uint256 jobId, string argument)
  → only client or freelancer. status must be Disputed.
  → stores argument per party.
  → emits ArgumentSubmitted(jobId, msg.sender)

judgeDispute(uint256 jobId)
  → callable by anyone once both arguments submitted and status = Disputed.
  → increments disputeCount.
  → builds prompt from requirements + deliveryNote + both arguments.
  → calls Somnia LLM agent (see payload construction below).
  → emits JudgmentRequested(jobId, requestId, disputeCount)

handleResponse(uint256 requestId, string[] responses, uint8 status, bytes details)
  → Somnia agent callback — selector must match exactly.
  → decodes winner from responses[0].
  → transfers 2 STT dispute fees to treasury.
  → applies verdict logic:
      if disputeCount == 5 (final):
        → winner gets escrow (or refund). status = Closed. emit FinalVerdict.
      else if winner == client:
        → freelancerWinStreak = 0. status = PendingClientChoice. emit VerdictForClient.
      else if winner == freelancer:
        → freelancerWinStreak++.
        → if freelancerWinStreak >= 2: release escrow, status = Closed. emit FinalVerdict.
        → else: status = Open (allow one more client dispute). emit VerdictForFreelancer.

closeJob(uint256 jobId)
  → only client. status must be PendingClientChoice.
  → refunds escrow to client. status = Closed.
  → emits JobClosed(jobId, client, escrowAmount)

retryJob(uint256 jobId)
  → only client. status must be PendingClientChoice.
  → resets: status = Open, deliveryNote = "", clientArgument = "",
    freelancerArgument = "", freelancerWinStreak = 0,
    clientDisputeStaked = false, freelancerDisputeStaked = false.
  → freelancer must submit a new delivery to continue.
  → emits JobRetried(jobId, disputeCount)

getJob(uint256 jobId) → returns full Job struct
getTotalJobs() → returns jobCounter
```

**LLM agent call inside judgeDispute:**
```solidity
string memory systemPrompt =
    "You are an impartial arbitrator for a freelance work dispute. "
    "Evaluate whether the freelancer's delivery meets the client's stated requirements. "
    "Consider both arguments carefully. "
    "Return ONLY the Ethereum wallet address of the winning party. Nothing else.";

bool isFinalRound = (disputeCount + 1 == 5); // +1 because we increment in judgeDispute

string memory userPrompt = string(abi.encodePacked(
    isFinalRound ? "FINAL ROUND - This verdict is absolute and cannot be appealed.\n\n" : "",
    "Job requirements: ", job.requirements, "\n\n",
    "Freelancer's delivery: ", job.deliveryNote, "\n\n",
    "Client's argument: ", job.clientArgument, "\n\n",
    "Freelancer's argument: ", job.freelancerArgument, "\n\n",
    "Client wallet: ", Strings.toHexString(uint160(job.client), 20), "\n",
    "Freelancer wallet: ", Strings.toHexString(uint160(job.freelancer), 20)
));

string[] memory allowedValues = new string[](2);
allowedValues[0] = Strings.toHexString(uint160(job.client), 20);
allowedValues[1] = Strings.toHexString(uint160(job.freelancer), 20);

bytes memory payload = abi.encodeWithSelector(
    bytes4(keccak256("inferString(string,string,bool,string[])")),
    userPrompt,
    systemPrompt,
    true,           // chainOfThought = true (audit trail)
    allowedValues
);

uint256 fee = platform.getRequestFee(LLM_AGENT_ID, 3);
requestToJob[requestId] = jobId;

platform.createRequest{value: fee}(
    LLM_AGENT_ID,
    address(this),
    this.handleResponse.selector,
    payload
);
```

**Import OpenZeppelin Strings for address-to-hex conversion:**
```
npm install @openzeppelin/contracts
import "@openzeppelin/contracts/utils/Strings.sol";
```

---

## Frontend design system — non-negotiable

This is a legal/judicial product. It must feel like verdicts matter.

```
Background:    #0A0C14   (near-black, slightly blue)
Surface:       #12151F
Border:        #1E2436
Text primary:  #F0F2FF
Text muted:    #6B7280
Gold accent:   #D4A017   (verdicts, wins — used sparingly)
Red:           #EF4444   (losing party, closed disputes)
Green:         #10B981   (winning party, approvals)

Display font:  Fraunces (serif) — job titles, verdicts, headings
Body font:     Inter
Mono font:     JetBrains Mono — wallet addresses, tx hashes, AI reasoning
```

**Required Framer Motion moments:**
- Job cards entering feed → stagger fade-up
- Dispute raised → pulse/shake on job card
- `DisputeProgress` component → animated pip tracker showing "Dispute 2 of 5"
- Verdict reveal → chain-of-thought lines appear one by one, 80ms stagger
- Winner announced → gold glow pulse on winning address
- `ClientChoice` → two option cards slide in after verdict settles
- Final verdict (dispute 5) → red banner "Final Ruling" before reveal
- Escrow release → STT amount counts up

**The verdict reveal is the entire demo.** Build everything else to reach it.
Build it last. Build it perfectly.

**The `DisputeProgress` bar showing "Dispute X of 5"** is a key UI element —
judges will immediately understand the escalation mechanic without explanation.

---

## The demo (Day 6)

3 minutes. Two browser windows. Two wallets.

1. Wallet A (client) posts job: *"Design a logo using blue palette, minimal style"* — stakes 5 STT
2. Wallet B (freelancer) submits delivery: *"Completed — clean wordmark, blue tones, Figma link attached"*
3. Both wallets stake 1 STT. Dispute 1 of 5 begins.
4. Client argues: *"Uses gradients, not the minimal style I specified."*
5. Freelancer argues: *"Brief said blue palette which I followed exactly. Minimal is subjective."*
6. Trigger judgment. Show deliberation screen: *"AI is reviewing the case..."*
7. Verdict arrives. Chain-of-thought reveals line by line. Winner glows gold.
8. Show `DisputeProgress`: Dispute 1 of 5 resolved.
9. If client loses → show ClientChoice: Close or Give Another Chance.
10. Show receipt on `agents.testnet.somnia.network` — the full on-chain audit trail.

That receipt link is the kicker. No other AI judging system can show you that.

---

## 7-day build schedule

| Day | Goal | Done when |
|---|---|---|
| 1 | `AbiCore.sol` written + deployed | Full dispute loop verified on testnet: post → deliver → dispute → handleResponse fires |
| 2 | Frontend scaffold + wallet | wagmi on Somnia, `postJob` writes on-chain, job appears in feed |
| 3 | Full job flow | Deliver, approve, stake for dispute — all work from frontend |
| 4 | Dispute + argument + judgment | Both args submitted, `judgeDispute` triggers agent, polling detects verdict |
| 5 | Verdict page + client choice | Full demo sequence runs end-to-end, DisputeProgress visible |
| 6 | Polish + demo video | Edge cases handled, MarketplaceTeaser on homepage, video recorded |
| 7 | Buffer + submission | Public GitHub, all links verified, submitted before June 7 |

**Feature freeze: end of Day 5. Nothing new after that.**

---

## Operating principles

- **Before writing any file** — check if it already exists. Edit before creating.
- **When something breaks** — read the full error, fix the root cause, log in `directives/learnings.md`.
- **When Abraham adds scope** — acknowledge it, park it as a backlog note, redirect to MVP.
- **Every Solidity function** — plain-English comment above it. Abraham is learning.
- **Never commit `.env`**
- **Components under 200 lines** — split if they grow beyond that.
- **`next@latest`** for all Next.js installs (this is Next.js 16).
- **Tailwind v4** — no `@apply`, no arbitrary values unless essential.

---

*Abita. From arbiter. The AI that judges.*
