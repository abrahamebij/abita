"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useConnect, useDisconnect, useReadContract } from "wagmi";
import { injected } from "wagmi/connectors";
import Link from "next/link";
import { Shield, Plus, Wallet, ArrowRight, Gavel, Award } from "lucide-react";
import { formatEther } from "viem";
import { toast } from "sonner";

import { ABICORE_CONTRACT_ADDRESS } from "@/lib/config";
import { ABICORE_ABI } from "@/lib/abi";
import MarketplaceTeaser from "@/components/MarketplaceTeaser";

// JobStatus labels and styling (Only blue accents and neutral grey)
const STATUS_DETAILS = [
  { label: "Open", color: "text-primary bg-primary-light border-primary/20" },
  { label: "Delivered", color: "text-primary bg-primary-light border-primary/20" },
  { label: "Disputed", color: "text-primary bg-primary-light border-primary/20 animate-pulse" },
  { label: "Awaiting Client Choice", color: "text-primary bg-primary-light border-primary/20" },
  { label: "Closed", color: "text-muted bg-background border-border" },
];

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Wallet Connection Notifications via Sonner
  useEffect(() => {
    if (isConnected && address) {
      toast.success("Wallet connected successfully!", {
        description: `Active Account: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    }
  }, [isConnected, address]);

  // Read total jobs from contract
  const { data: totalJobs } = useReadContract({
    address: ABICORE_CONTRACT_ADDRESS as `0x${string}`,
    abi: ABICORE_ABI,
    functionName: "getTotalJobs",
  });

  const [activeTab, setActiveTab] = useState<"all" | "active" | "closed">("all");

  const mockJobs = [
    {
      id: 1,
      client: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      freelancer: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      escrowAmount: BigInt("5000000000000000000"), // 5 STT
      requirements: "Design a minimal blue logo. No gradients.",
      status: 2, // Disputed
      disputeCount: 1,
    },
    {
      id: 2,
      client: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      freelancer: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      escrowAmount: BigInt("12000000000000000000"), // 12 STT
      requirements: "Write full-stack Next.js contract interface wrapper.",
      status: 0, // Open
      disputeCount: 0,
    }
  ];

  return (
    <div className="flex-grow flex flex-col min-h-screen bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="border-b border-border bg-card backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-between rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Shield className="h-5 w-5 mx-auto" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Abita
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Connected Wallet</span>
                  <span className="font-mono text-sm text-foreground">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition-all duration-300 cursor-pointer shadow-sm"
                >
                  Disconnect
                </button>
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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Welcome & CTA section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-12 border-b border-border">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Freelance Escrow Dashboard
            </h1>
            <p className="mt-3 text-lg text-muted max-w-xl">
              Escrow agreements protected by deterministic, consensus-verified AI arbitrators on Somnia Network.
            </p>
          </div>

          <Link href="/post">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-between space-x-2 rounded-xl bg-primary px-6 py-4 text-base font-bold text-card hover:bg-primary-hover transition-all duration-300 shadow-md cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              <span>Create New Escrow</span>
            </motion.div>
          </Link>
        </div>

        {/* Dynamic Contract Status Stats (All neutral + blue) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="rounded-xl border border-border bg-card p-6 flex items-center space-x-4 shadow-sm">
            <div className="flex h-12 w-12 rounded-lg bg-primary/10 text-primary">
              <Shield className="h-6 w-6 mx-auto my-auto" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">Secured Contracts</span>
              <span className="text-2xl font-bold text-foreground">
                {totalJobs !== undefined ? Number(totalJobs) : 2} Active
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 flex items-center space-x-4 shadow-sm">
            <div className="flex h-12 w-12 rounded-lg bg-primary/10 text-primary">
              <Gavel className="h-6 w-6 mx-auto my-auto" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">AI Arbitrations</span>
              <span className="text-2xl font-bold text-foreground">1 Adjudicated</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 flex items-center space-x-4 shadow-sm">
            <div className="flex h-12 w-12 rounded-lg bg-primary/10 text-primary">
              <Award className="h-6 w-6 mx-auto my-auto" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">Total Platform Earnings</span>
              <span className="text-2xl font-bold text-foreground">2.0 STT Earned</span>
            </div>
          </div>
        </div>

        {/* Contract Feed Filter Header */}
        <div className="mt-16 flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setActiveTab("all")}
              className={`font-semibold text-sm pb-4 relative transition-colors duration-300 cursor-pointer ${activeTab === "all" ? "text-primary" : "text-muted hover:text-foreground"}`}
            >
              All Agreements
              {activeTab === "all" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`font-semibold text-sm pb-4 relative transition-colors duration-300 cursor-pointer ${activeTab === "active" ? "text-primary" : "text-muted hover:text-foreground"}`}
            >
              Active Escrows
              {activeTab === "active" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
            </button>
          </div>
          <span className="font-mono text-xs text-muted">
            Feed displays latest live transactions
          </span>
        </div>

        {/* Feed cards render using stagger entry */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
        >
          <AnimatePresence mode="popLayout">
            {mockJobs.map((job, idx) => {
              const statusInfo = STATUS_DETAILS[job.status] || STATUS_DETAILS[0];
              return (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between group hover:shadow-md shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted">Job ID: #{job.id}</span>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                      {job.requirements.slice(0, 50)}...
                    </h3>

                    <p className="mt-2 text-sm text-muted line-clamp-2">
                      {job.requirements}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
                      <div>
                        <span className="text-[10px] uppercase text-muted tracking-wider block font-semibold">Escrow locked</span>
                        <span className="text-lg font-bold text-foreground">
                          {formatEther(job.escrowAmount)} STT
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted tracking-wider block font-semibold">Disputes</span>
                        <span className="font-mono text-sm text-foreground">
                          {job.disputeCount} of 5
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link href={`/job/${job.id}`} className="mt-6 w-full">
                    <div className="flex items-center justify-between w-full rounded-lg border border-border bg-background hover:bg-primary/5 px-4 py-3 text-sm font-semibold text-foreground hover:text-primary hover:border-primary/30 transition-all duration-300 cursor-pointer">
                      <span>View Details</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Coming Soon Marketplace section */}
        <div className="mt-24">
          <MarketplaceTeaser />
        </div>
      </main>
    </div>
  );
}
