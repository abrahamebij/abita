# Frontend Component Map, Design Rules & Animations

This document outlines the visual system, user flows, and animation specifications for the Abita dispute platform frontend.

---

## 1. Design System Tokens (Non-Negotiable)

This is a legal/judicial product. Headings must feel heavy and verdicts must carry visual weight.

| Token | Hex Value | Application |
|---|---|---|
| **Background** | `#0A0C14` | Body background (near-black, slightly blue) |
| **Surface** | `#12151F` | Cards, forms, modal body panels |
| **Border** | `#1E2436` | Outlines, dividing lines |
| **Text Primary** | `#F0F2FF` | Headings, active text, highlights |
| **Text Muted** | `#6B7280` | Labels, details, descriptions |
| **Gold Accent** | `#D4A017` | AI verdicts, streak wins, active gold glows |
| **Red Accent** | `#EF4444` | Staking/losing party, final ruling banners |
| **Green Accent** | `#10B981` | Approvals, winning party highlights |

### Typography
- **Display Font:** `Fraunces` (serif) — Job titles, verdicts, main headers.
- **Body Font:** `Inter` (sans-serif) — Standard UI elements, buttons, inputs.
- **Mono Font:** `JetBrains Mono` (monospace) — Wallet addresses, transaction hashes, AI reasoning paragraphs.

---

## 2. Component Directory Structure & Map

All components are stored under `frontend/components/`:

- **`PostJobModal.tsx`**: Triggers contract write to `postJob` with payment in escrow.
- **`JobCard.tsx`**: Displays active job, current status, payouts, and triggers. Uses stagger fade-up entry animations.
- **`DeliveryForm.tsx`**: Allows freelancers to submit delivery proof (note, Figma link).
- **`DisputeFlow.tsx`**: Controls staking 1 STT for both parties and entering argument submissions.
- **`DisputeProgress.tsx`**: Pipeline tracker visualizing "Dispute X of 5". Uses animated pips.
- **`VerdictReveal.tsx`**: Deliberation loader followed by chain-of-thought lines fade-up staggered by 80ms, culminating in a gold glow pulse around the winning wallet address.
- **`ClientChoice.tsx`**: Slide-in option cards for Close (refund) vs Retry (re-deliver) during rounds 1-4.
- **`MarketplaceTeaser.tsx`**: Elegant dark-mode section explaining Abita's V2 vision.

---

## 3. Framer Motion Animation Specifications

### Job Cards Entry
- **Animation:** Staggered fade-up.
- **Spec:** `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.08 }}`

### Dispute Raised Shake
- **Animation:** Quick horizontal shake on the Job Card when a dispute is staked.
- **Spec:** `animate={{ x: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.5 }}`

### Verdict Deliberation & Reveal
- **Deliberation:** Pulse glow with JetBrains Mono logs updating.
- **Lines Fade:** Staggered line-by-line reveal of the AI's Chain-of-Thought.
- **Winner Announcement:** A radiating gold glow around the winner's wallet.
- **Spec:** `animate={{ boxShadow: ["0 0 0px #D4A017", "0 0 20px #D4A017", "0 0 0px #D4A017"] }} transition={{ repeat: Infinity, duration: 1.5 }}`
