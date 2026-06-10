"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Brain, ShieldCheck, Scale, Sparkles, Wallet, PlayCircle } from "lucide-react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import MarketplaceTeaser from "@/components/MarketplaceTeaser";
import Hero3D from "@/components/Hero3D";

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
        {/* 1. HERO SECTION (Vercel/Linear Style Centered) */}
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-40 flex flex-col items-center justify-center text-center overflow-visible">
          {/* Subtle Blueprint Grid Background */}
          <div className="absolute inset-0 z-[-1] pointer-events-none" style={{
            backgroundImage: `linear-gradient(to right, rgba(37, 99, 235, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(37, 99, 235, 0.05) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
          }} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 max-w-4xl mx-auto z-10"
          >

            <h1 className="text-5xl sm:text-6xl lg:text-[5rem] font-extrabold tracking-tighter text-foreground leading-[1.05]">
              Symmetrical Escrow. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Deterministic Resolution.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted font-medium max-w-2xl mx-auto leading-relaxed">
              Abita protects freelance transactions with trustless, self-executing escrows and consensus-verified AI judges. No human intermediates. No subjectivity.
            </p>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isConnected ? (
                <Link href="/dashboard">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center space-x-2 rounded-full bg-foreground px-8 py-4 text-base font-bold text-background shadow-xl shadow-foreground/10 transition-all duration-300 cursor-pointer"
                  >
                    <span>Initialize Escrow</span>
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </Link>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => connect({ connector: injected() })}
                  className="inline-flex items-center space-x-2 rounded-full bg-foreground px-8 py-4 text-base font-bold text-background shadow-xl shadow-foreground/10 transition-all duration-300 cursor-pointer"
                >
                  <Wallet className="h-5 w-5" />
                  <span>Connect Wallet</span>
                </motion.button>
              )}
              <Link href="/demo">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center space-x-2 rounded-full bg-white border border-border px-8 py-4 text-base font-bold text-foreground shadow-sm hover:border-primary/30 transition-all duration-300 cursor-pointer"
                >
                  <PlayCircle className="h-5 w-5 text-primary" />
                  <span>Watch Demo</span>
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* Interactive 3D Consensus Core */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="w-full max-w-5xl mx-auto mt-10 relative z-10"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full transform scale-75 -z-10" />
            <Hero3D />
          </motion.div>
        </section>

        {/* 2. FLOATING TRUST METRICS BANNER */}
        <section className="relative z-20 -mt-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50"
          >
            <div className="text-center px-4">
              <span className="text-3xl lg:text-4xl font-extrabold text-foreground block drop-shadow-sm">1.0 STT</span>
              <span className="text-xs uppercase tracking-widest text-primary font-bold mt-2 block">Fixed Dispute Fee</span>
            </div>
            <div className="text-center px-4">
              <span className="text-3xl lg:text-4xl font-extrabold text-foreground block drop-shadow-sm">100%</span>
              <span className="text-xs uppercase tracking-widest text-primary font-bold mt-2 block">On-Chain Audit</span>
            </div>
            <div className="text-center px-4">
              <span className="text-3xl lg:text-4xl font-extrabold text-foreground block drop-shadow-sm">5.0s</span>
              <span className="text-xs uppercase tracking-widest text-primary font-bold mt-2 block">Somnia Blocktime</span>
            </div>
            <div className="text-center px-4">
              <span className="text-3xl lg:text-4xl font-extrabold text-foreground block drop-shadow-sm">Max 5</span>
              <span className="text-xs uppercase tracking-widest text-primary font-bold mt-2 block">Appeals Cap</span>
            </div>
          </motion.div>
        </section>

        {/* 3. DYNAMIC PROCESS TIMELINE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 space-y-20 relative">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl aspect-square rounded-full bg-primary/5 blur-3xl pointer-events-none" />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-2xl mx-auto space-y-4"
          >
            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              How Symmetrical Escrow Works
            </h2>
            <p className="text-base lg:text-lg text-muted font-medium">
              A robust 3-step pipeline guarantees absolute dispute resolution without human intermediates or subjective biases.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 z-0" />

            {[
              { num: "01", title: "Escrow & Briefing", desc: "The client locks the contract funds securely in the self-executing smart contract, explicitly detailing all job requirements." },
              { num: "02", title: "Symmetrical Deposit", desc: "If a qualitative dispute occurs, both parties deposit a flat 1.0 STT fee and submit their arguments directly to the contract." },
              { num: "03", title: "Consensus Verdict", desc: "Somnia AI consensus validators parse specifications, evaluate testimonies, and execute a deterministic settlement callback in seconds." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="relative bg-white/80 backdrop-blur-md rounded-3xl border border-white p-8 text-center space-y-6 shadow-xl shadow-primary/[0.03] hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-500 group"
              >
                <div className="mx-auto flex h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-light to-white border border-primary/10 text-primary items-center justify-center font-bold text-2xl font-mono shadow-inner group-hover:scale-110 transition-transform duration-500">
                  {step.num}
                </div>
                <h3 className="text-xl font-extrabold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed font-medium">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 4. ASYMMETRIC BENTO GRID (ENGINEERED FOR CERTAINTY) */}
        <section className="bg-foreground py-32 text-background relative overflow-hidden">
          {/* Dark mode context within light theme for extreme contrast */}
          <div className="absolute top-0 right-0 w-full max-w-4xl aspect-square rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-left max-w-xl space-y-4"
            >
              <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                Engineered for <span className="text-primary-light">Certainty</span>
              </h2>
              <p className="text-lg text-slate-300 font-medium">
                Ditch expensive legal fees, subjective client rejections, and infinite delivery waitlists. Absolute architectural parity.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
              
              {/* Large span card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="md:col-span-2 md:row-span-1 rounded-3xl bg-white/5 border border-white/10 p-10 flex flex-col justify-end relative overflow-hidden group hover:border-primary/50 transition-colors duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <Brain className="h-10 w-10 text-primary-light mb-6" />
                <h3 className="text-2xl font-bold text-white mb-3">Consensus-Verified Verdicts</h3>
                <p className="text-slate-400 font-medium max-w-md">
                  Decisions are evaluated off-chain by a decentralized network of validation nodes and resolved back on-chain, ensuring 100% auditable impartiality.
                </p>
              </motion.div>

              {/* Tall side card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="md:col-span-1 md:row-span-2 rounded-3xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/20 p-10 flex flex-col items-start relative overflow-hidden group"
              >
                <Scale className="h-10 w-10 text-primary-light mb-8" />
                <h3 className="text-2xl font-bold text-white mb-4">Escalation Win Streaks</h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Escrow releases automatically upon two consecutive freelancer wins. Maximum 5 appeals guarantees finality without endless retries. The absolute end of scope creep.
                </p>
              </motion.div>

              {/* Wide bottom card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="md:col-span-2 md:row-span-1 rounded-3xl bg-white/5 border border-white/10 p-10 flex flex-col justify-end relative overflow-hidden group hover:border-white/20 transition-colors duration-500"
              >
                <ShieldCheck className="h-10 w-10 text-white mb-6" />
                <h3 className="text-2xl font-bold text-white mb-3">Trustless Escrow Reserves</h3>
                <p className="text-slate-400 font-medium max-w-lg">
                  Contract payouts are completely self-executing. Neither party can unilaterally withdraw locked funds, creating absolute parity and total financial security.
                </p>
              </motion.div>

            </div>
          </div>
        </section>

        {/* 4.5. MARKETPLACE TEASER */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <MarketplaceTeaser />
        </section>

        {/* 5. FINAL HIGH-CONVERSION CTA */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[2.5rem] p-1 bg-gradient-to-br from-primary via-blue-400 to-primary-light shadow-2xl shadow-primary/20 relative"
          >
            {/* Inner Content */}
            <div className="rounded-[2.25rem] bg-card p-12 md:p-16 text-center space-y-8 relative overflow-hidden">
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

              <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground max-w-2xl mx-auto leading-tight relative z-10">
                Ready to Lock Symmetrical Protection?
              </h2>

              <p className="text-base lg:text-lg text-muted font-medium max-w-lg mx-auto relative z-10">
                Fixed 1.0 STT dispute fee. 100% decentralized. Start launching and securing freelance escrow agreements instantly on Somnia Testnet.
              </p>

              <div className="pt-6 relative z-10">
                {isConnected ? (
                  <Link href="/dashboard">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="inline-flex items-center space-x-3 rounded-full bg-primary px-10 py-5 text-base font-bold text-card shadow-lg shadow-primary/30 transition-all duration-300 cursor-pointer"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </Link>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => connect({ connector: injected() })}
                    className="inline-flex items-center space-x-3 rounded-full bg-foreground px-10 py-5 text-base font-bold text-background shadow-xl shadow-foreground/20 transition-all duration-300 cursor-pointer"
                  >
                    <Wallet className="h-5 w-5" />
                    <span>Connect Wallet to Begin</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
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
