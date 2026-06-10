# Abita — Pitch Deck Notes

> *From arbiter — one who judges.*

---

## The Problem

Freelance work breaks down at the same point every time: **payment.**

A client hires someone, work gets delivered, and then one of two things happens — the client disappears without paying, or the freelancer delivers something the client never agreed to. There is no neutral party. No binding resolution. Just a lost invoice and a bad review.

Existing platforms (Upwork, Fiverr) hold funds in escrow, but their dispute process is **a human team reviewing screenshots**. Slow. Subjective. Gameable.

---

## The Idea

What if the judge was an AI — and its verdict was permanent, public, and happened in seconds?

**Abita** is a trustless freelance escrow platform where every dispute is settled by an on-chain AI arbitrator. The AI's verdict is recorded on a public blockchain. No appeals to customer support. No he-said-she-said. Just a binding decision with a public audit trail anyone can verify.

---

## How It Works

1. **Client posts a job** — describes the work and locks payment in a smart contract. The money sits there until someone wins it.

2. **Freelancer delivers** — submits their work with a note. Client can approve and release payment instantly.

3. **If there's a dispute** — both parties each pay a small 1 STT arbitration fee and write their argument. The AI reads both sides and the original requirements. It delivers a verdict in under a minute.

4. **The verdict is final** — the winning party gets paid. The losing party goes home. Everything is recorded on-chain.

---

## The AI Judge

The arbitrator is not a chatbot. It is a **decentralized AI inference network** running on the Somnia blockchain — multiple validator nodes reach consensus on a verdict, and the result is written directly to the smart contract.

It reads:
- The original job requirements (written by the client before any dispute)
- The freelancer's delivery note
- The client's argument
- The freelancer's argument

It returns a **verdict and a written reason** — one sentence explaining exactly why it ruled the way it did.

---

## The Audit Trail

Every single AI ruling generates a **public receipt** on the Somnia Agent Explorer. Anyone — not just the parties involved — can read:

- The full prompt sent to the AI
- The AI's chain of thought
- The final verdict
- The winning wallet address

This is the kicker. No other dispute platform can show you this. It is proof that the AI made the call, not Abita.

---

## Escalation System

Abita doesn't just give one shot. There is a structured escalation system — up to **5 dispute rounds per job.**

- If the client wins a round, they choose: **close the job and get a refund**, or **give the freelancer another chance** to fix the work.
- If the freelancer wins **two rounds in a row**, the escrow is released immediately. The client has had their chances.
- Round 5 is the **final ruling** — no choices, no retries. Whatever the AI decides, that's it.

This creates a fair, structured process. Not an infinite loop. Not a single coin flip.

---

## Fully Autonomous

Once a dispute is raised, Abita runs itself. A background bot watches the blockchain and automatically triggers the AI judgment the moment both parties have submitted their arguments.

No one at Abita needs to press a button. No one can delay or interfere. The system is self-executing.

---

## Business Model

Abita earns **a flat fee every time a dispute is judged.**

Both parties each pay 1 STT to open a dispute (2 STT total). Abita keeps the majority after paying the AI network's inference cost. The winner always receives their full escrow — the arbitration fee never touches the prize.

The more disputes, the more Abita earns. But disputes are also a signal to fix the marketplace — which is where V2 comes in.

---

## V2 — The Marketplace

Right now, Abita handles disputes between parties who already know each other. The next version is a **full freelance marketplace** — where clients post jobs publicly and freelancers apply.

The dispute layer is already built. The marketplace is the distribution.

---

## Why Somnia

Somnia is the only network fast enough to make this feel real. Transactions confirm in under a second. The on-chain AI inference is native — not a bridge to an off-chain API, but consensus happening among blockchain validators.

The audit receipt is only possible because the AI runs on-chain. That is the product differentiator.

---

## The Demo Flow

Two browser windows. Two wallets. Three minutes.

1. **Wallet A (client)** posts a logo design job — locks 5 STT in escrow
2. **Wallet B (freelancer)** submits the delivery
3. Both wallets pay 1 STT and open a dispute
4. Each party writes their argument
5. The keeper bot automatically triggers the AI judge
6. The verdict page reveals — winner badge, AI reasoning, and an audit receipt link
7. Client chooses: close the job or give another chance
8. Open the Somnia Agent Explorer — the full AI reasoning is public

---

## Key Differentiators

| | Abita | Traditional Platforms |
|---|---|---|
| Dispute judge | Decentralized AI | Human team |
| Time to verdict | Under a minute | Days to weeks |
| Audit trail | Public on-chain receipt | Private internal notes |
| Bias | None — AI has no relationship with either party | Potential bias toward power users |
| Finality | Cryptographically enforced | Can be reversed or escalated |

---

## One-liner

**Abita is the court of the internet — AI-judged, on-chain enforced, publicly auditable.**
