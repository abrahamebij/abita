# Abita - AI-Powered Freelance Escrow Platform

## Project Overview

Abita is a decentralized, AI-powered freelance escrow platform built on the **Somnia Network**. The core value proposition is to provide secure escrows with a deterministic, unbiased AI judging process for dispute resolution. It leverages Somnia's on-chain AI Agent Platform to deliver automated and auditable verdicts when a client and freelancer disagree on a deliverable.

The project features a high-fidelity, judicial-themed user interface, highlighting the gravity and fairness of its dispute resolution mechanics.

## Architecture

The project is structured into three main components:

### 1. Smart Contracts (contracts/)
The core backend logic is implemented in Solidity.

*   **AbiCore.sol**: This is the central contract. It acts as a state machine for jobs (escrows) managing transitions from Open -> Delivered -> Disputed -> Completed/Cancelled. It handles the escrow of funds, the staking logic for disputes, and integrates with the Somnia AI platform to process asynchronous callbacks for AI verdicts.
*   **interfaces/ISomniaAgents.sol**: The interface used to communicate with the Somnia Network's on-chain AI Agent Platform, allowing the contract to request AI generation and handle the subsequent responses.
*   **Unique Mechanics**:
    *   **AI Judging**: Uses Qwen3-30B via the Somnia network to judge disputes.
    *   **Staking**: Both parties must stake 1 STT to initiate/continue a dispute.
    *   **Dispute Rounds & Win Streaks**: The protocol enforces a strict 5-round dispute cap. It implements "win-streak" mechanics to ensure finality and discourage frivolous endless disputing.

### 2. Frontend (rontend/)
The user interface is a modern web application designed with a judicial aesthetic.

*   **Technologies**: Next.js (App Router), React, Tailwind CSS v4, Framer Motion (for animations).
*   **Web3 Connectivity**: Wagmi and Viem are used for connecting wallets and interacting with the AbiCore smart contract.
*   **State Management**: TanStack Query is utilized for efficient fetching, caching, and synchronizing of on-chain data.
*   **Key Directories**:
    *   pp/: Contains the Next.js routing structure (/page.tsx for landing, /dashboard/ for user overview, /job/[id]/ for specific escrow details).
    *   components/: Reusable UI elements, including complex flows like DisputeFlow.tsx, DisputeArguments.tsx, and specialized cards (ClientJobCard.tsx, FreelancerJobCard.tsx).
    *   hooks/: Custom React hooks (e.g., useJobData.ts, usePostJob.ts, useRaiseDispute.ts) that encapsulate the complex Wagmi logic for interacting with the blockchain.

### 3. Scripts (scripts/)
Utility scripts, primarily for testing and deployment on the Somnia network or local Hardhat nodes.

*   deploy.ts: Script to deploy the contracts.
*   	est-flow.ts: Simulates the end-to-end operational flow of the platform, including job creation, delivery, and dispute resolution.
*   debug-judge.ts: Tooling to debug the AI judging process.

## Strategic Guidelines (From AGENTS.md & directives/)

The project is guided by strict product specifications outlined in AGENTS.md and the directives/ folder. These files dictate the product vision, the intricate business rules for dispute handling (the 5-round cap, staking requirements), and the overall design philosophy (judicial, high-fidelity UI). All development must align with these established directives.
