"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Brain, ShieldCheck, Scale, Sparkles, Wallet } from "lucide-react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

/**
 * @notice Premium Custom Animated Hero Graphic
 * Combines neural nodes, pulsing concentric waves, and a rocking scale arm
 * to dramatically visualize Abita's on-chain AI adjudication.
 */
function HeroGraphic() {
  return (
    <div className="relative w-full max-w-[420px] aspect-square mx-auto flex items-center justify-center">
      {/* Pulsing Concentric Outer Glowing Rings */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.08, 0.2, 0.08] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full border border-primary/20 bg-primary/5 blur-2xl"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.03, 0.1, 0.03] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute w-[80%] h-[80%] rounded-full border border-dashed border-primary/30"
      />

      {/* Vector Adjudication Network Illustration */}
      <svg
        viewBox="0 0 200 200"
        className="w-[80%] h-[80%] text-primary relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Symmetrical Plumb line of Equity */}
        <line
          x1="100"
          y1="35"
          x2="100"
          y2="165"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 4"
          className="opacity-30"
        />

        {/* Symmetrical Connection Network Rays */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d="M 100,45 L 45,115 M 100,45 L 155,115 M 100,45 L 100,165"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="3 3"
          className="opacity-45"
        />

        {/* rock-animated Scale Balance Beam */}
        <motion.g
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          style={{ transformOrigin: "100px 45px" }}
        >
          {/* Main crossbar */}
          <line
            x1="30"
            y1="80"
            x2="170"
            y2="80"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {/* Left hanging ray */}
          <line
            x1="45"
            y1="80"
            x2="45"
            y2="115"
            stroke="currentColor"
            strokeWidth="1.5"
            className="opacity-60"
          />
          {/* Right hanging ray */}
          <line
            x1="155"
            y1="80"
            x2="155"
            y2="115"
            stroke="currentColor"
            strokeWidth="1.5"
            className="opacity-60"
          />
          {/* Settle Trays */}
          <path
            d="M 30,122 H 60 M 30,122 L 45,115 M 60,122 L 45,115"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 140,122 H 170 M 140,122 L 155,115 M 170,122 L 155,115"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Hanging string nodes */}
          <circle cx="45" cy="80" r="3" fill="currentColor" />
          <circle cx="155" cy="80" r="3" fill="currentColor" />
        </motion.g>

        {/* Glowing apex Consensus Node */}
        <circle cx="100" cy="45" r="9" fill="currentColor" />
        <motion.circle
          cx="100"
          cy="45"
          r="16"
          stroke="currentColor"
          strokeWidth="1.5"
          className="animate-ping"
          style={{ transformOrigin: "100px 45px", opacity: 0.35 }}
        />

        {/* Symmetrical Foundation Plate */}
        <path
          d="M 75,165 H 125"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="opacity-75"
        />

        {/* Center Plumb node */}
        <circle cx="100" cy="165" r="4.5" fill="currentColor" />
      </svg>
    </div>
  );
}

export default function LandingPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  return (
    <div className="flex-grow flex flex-col min-h-screen bg-background text-foreground antialiased font-sans">
      {/* Symmetrical Brand Header (No menu leak paths) */}
      <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity duration-300">
            <img src="/logo_text.png" alt="Abita Logo" className="h-16 w-auto" />
          </Link>

          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <span className="hidden md:inline font-mono text-xs text-muted">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <Link href="/dashboard">
                  <motion.div
                    className="flex items-center space-x-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-card hover:bg-primary-hover transition-all duration-300 shadow-sm cursor-pointer"
                  >
                    <span>Launch Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </Link>
              </div>
            ) : (
              <button
                onClick={() => connect({ connector: injected() })}
                className="flex items-center space-x-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-card hover:bg-primary-hover transition-all duration-300 hover:shadow-md cursor-pointer"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Layout */}
      <main className="flex-1">
        {/* 1. HERO SECTION (Above fold pyramid) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-left"
          >
            <div className="inline-flex items-center space-x-2 rounded-full border border-primary/20 bg-primary-light px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Decentralized AI Adjudication Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Symmetrical Escrow.<br />
              <span className="text-primary">AI Resolved.</span>
            </h1>

            <p className="text-lg text-muted max-w-xl leading-relaxed">
              Abita protects freelance transactions with trustless, self-executing escrows and deterministic, consensus-verified AI judges on Somnia Network.
            </p>

            <div className="pt-4">
              {isConnected ? (
                <Link href="/dashboard">
                  <motion.div
                    className="inline-flex items-center space-x-3 rounded-xl bg-primary px-8 py-4.5 text-base font-bold text-card hover:bg-primary-hover hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <span>Enter Escrow Dashboard</span>
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </Link>
              ) : (
                <motion.button
                  onClick={() => connect({ connector: injected() })}
                  className="inline-flex items-center space-x-3 rounded-xl bg-primary px-8 py-4.5 text-base font-bold text-card hover:bg-primary-hover hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <Wallet className="h-5 w-5" />
                  <span>Connect Wallet to Enter</span>
                </motion.button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex items-center justify-center"
          >
            <HeroGraphic />
          </motion.div>
        </section>

        {/* 2. SPECIFIC TRUST METRICS BANNER */}
        <section className="border-t border-b border-border bg-white py-10 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <span className="text-3xl lg:text-4xl font-extrabold text-foreground block">1.0 STT</span>
              <span className="text-xs uppercase tracking-wider text-muted font-semibold mt-1 block">Fixed Dispute Fee</span>
            </div>
            <div className="text-center">
              <span className="text-3xl lg:text-4xl font-extrabold text-foreground block">100%</span>
              <span className="text-xs uppercase tracking-wider text-muted font-semibold mt-1 block">On-Chain Audit Trail</span>
            </div>
            <div className="text-center">
              <span className="text-3xl lg:text-4xl font-extrabold text-foreground block">5.0s</span>
              <span className="text-xs uppercase tracking-wider text-muted font-semibold mt-1 block">Somnia Blocktime</span>
            </div>
            <div className="text-center">
              <span className="text-3xl lg:text-4xl font-extrabold text-foreground block">Max 5</span>
              <span className="text-xs uppercase tracking-wider text-muted font-semibold mt-1 block">Appeals Escalation Cap</span>
            </div>
          </div>
        </section>

        {/* 3. DYNAMIC PROCESS neural TIMELINE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-16">
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              How Symmetrical Escrow Works
            </h2>
            <p className="text-sm text-muted">
              A robust 3-step pipeline guarantees absolute dispute resolution without human intermediates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-white rounded-2xl border border-border p-8 text-left space-y-4 shadow-sm hover:border-primary/20 transition-all duration-300">
              <div className="flex h-12 w-12 rounded-xl bg-primary/10 text-primary items-center justify-center font-bold text-lg font-mono">
                01
              </div>
              <h3 className="text-xl font-bold text-foreground">Escrow & Briefing</h3>
              <p className="text-sm text-muted leading-relaxed">
                The client locks the contract funds securely in the self-executing smart contract, explicitly detailing all job requirements.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-border p-8 text-left space-y-4 shadow-sm hover:border-primary/20 transition-all duration-300">
              <div className="flex h-12 w-12 rounded-xl bg-primary/10 text-primary items-center justify-center font-bold text-lg font-mono">
                02
              </div>
              <h3 className="text-xl font-bold text-foreground">Symmetrical Staking</h3>
              <p className="text-sm text-muted leading-relaxed">
                If a qualitative dispute occurs, both parties stake a flat 1.0 STT fee and submit their arguments directly to the contract.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-border p-8 text-left space-y-4 shadow-sm hover:border-primary/20 transition-all duration-300">
              <div className="flex h-12 w-12 rounded-xl bg-primary/10 text-primary items-center justify-center font-bold text-lg font-mono">
                03
              </div>
              <h3 className="text-xl font-bold text-foreground">Consensus Verdict</h3>
              <p className="text-sm text-muted leading-relaxed">
                Somnia AI consensus validators parse specifications, evaluate testimonies, and execute a deterministic settlement callback in seconds.
              </p>
            </div>
          </div>
        </section>

        {/* 4. OUTCOME-BASED BENEFITS GRID */}
        <section className="bg-white border-t border-b border-border py-24 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                Engineered for Certainty
              </h2>
              <p className="text-sm text-muted">
                Ditch expensive legal fees, subjective client rejections, and infinite delivery waitlists.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4 text-left p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Brain className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Consensus-Verified Verdicts</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Decisions are evaluated off-chain by a decentralized network of validation nodes and resolved back on-chain, ensuring 100% auditable impartiality.
                </p>
              </div>

              <div className="space-y-4 text-left p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Scale className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Escalation Win Streaks</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Escrow releases automatically upon two consecutive freelancer wins. Maximum 5 appeals guarantees finality without endless retries.
                </p>
              </div>

              <div className="space-y-4 text-left p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Trustless Escrow Reserves</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Contract payouts are completely self-executing. Neither party can unilaterally withdraw locked funds, creating absolute parity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. OBJECTION HANDLING & FINAL HIGH-CONVERSION CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="rounded-3xl border border-primary/20 bg-primary-light p-12 text-center space-y-6 max-w-4xl mx-auto shadow-sm relative overflow-hidden">
            {/* Concentric light background glow (Electric Blue) */}
            <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10" />

            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground max-w-lg mx-auto leading-tight">
              Ready to Lock Symmetrical Protection?
            </h2>

            <p className="text-sm text-muted max-w-md mx-auto">
              Fixed 1.0 STT dispute fee. 100% decentralized. Start launching and securing freelance escrow agreements instantly on Somnia Testnet.
            </p>

            <div className="pt-4">
              {isConnected ? (
                <Link href="/dashboard">
                  <motion.div
                    className="inline-flex items-center space-x-2 rounded-xl bg-primary px-8 py-4.5 text-base font-bold text-card hover:bg-primary-hover hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </Link>
              ) : (
                <motion.button
                  onClick={() => connect({ connector: injected() })}
                  className="inline-flex items-center space-x-2 rounded-xl bg-primary px-8 py-4.5 text-base font-bold text-card hover:bg-primary-hover hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <Wallet className="h-5 w-5" />
                  <span>Connect Wallet to Begin</span>
                </motion.button>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Trust Footer */}
      <footer className="border-t border-border bg-white py-12 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-xs text-muted">
            &copy; 2026 Abita Inc. All rights reserved. Powered by Somnia Agent Platform.
          </span>
          <div className="flex space-x-6 text-xs text-muted">
            <Link href="https://agents.testnet.somnia.network" target="_blank" className="hover:text-primary transition-colors duration-300">
              Agent Explorer
            </Link>
            <span className="text-border">|</span>
            <Link href="https://shannon-explorer.somnia.network" target="_blank" className="hover:text-primary transition-colors duration-300">
              Blockchain Explorer
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
