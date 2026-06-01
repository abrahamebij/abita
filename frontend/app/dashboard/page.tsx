"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useDisconnect, useReadContract } from "wagmi";
import Link from "next/link";
import { Shield, Plus, Gavel, Award } from "lucide-react";
import { formatEther } from "viem";
import { ABICORE_CONTRACT_ADDRESS } from "@/lib/config";
import { ABICORE_ABI } from "@/lib/abi";
import MarketplaceTeaser from "@/components/MarketplaceTeaser";
import ClientJobCard from "@/components/ClientJobCard";
import FreelancerJobCard from "@/components/FreelancerJobCard";

// JobStatus labels and styling (Only blue accents and neutral grey)
const STATUS_DETAILS = [
  { label: "Open", color: "text-primary bg-primary-light border-primary/20" },
  { label: "Delivered", color: "text-primary bg-primary-light border-primary/20" },
  { label: "Disputed", color: "text-primary bg-primary-light border-primary/20 animate-pulse" },
  { label: "Awaiting Client Choice", color: "text-primary bg-primary-light border-primary/20" },
  { label: "Closed", color: "text-muted bg-background border-border" },
];

interface DashboardJob {
  id: number;
  client: string;
  freelancer: string;
  escrowAmount: bigint;
  requirements: string;
  status: number;
  disputeCount: number;
  isLive?: boolean;
}

export default function Dashboard() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  // Read total jobs from contract
  const { data: totalJobs } = useReadContract({
    address: ABICORE_CONTRACT_ADDRESS as `0x${string}`,
    abi: ABICORE_ABI,
    functionName: "getTotalJobs",
  });

  const [activeTab, setActiveTab] = useState<"all" | "active">("all");
  const [liveJobs, setLiveJobs] = useState<DashboardJob[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  // Fetch live on-chain jobs dynamically
  useEffect(() => {
    let active = true;

    const fetchLiveJobs = async () => {
      if (!totalJobs || totalJobs === 0n) {
        if (active) {
          setLiveJobs([]);
        }
        return;
      }

      setIsLoadingLive(true);
      try {
        const { createPublicClient, http } = await import("viem");
        const { somniaTestnet } = await import("@/lib/config");
        const client = createPublicClient({
          chain: somniaTestnet,
          transport: http(),
        });

        const jobsList: DashboardJob[] = [];
        const limit = Number(totalJobs);
        for (let i = 1; i <= limit; i++) {
          try {
            const contractJob = await client.readContract({
              address: ABICORE_CONTRACT_ADDRESS as `0x${string}`,
              abi: ABICORE_ABI,
              functionName: "getJob",
              args: [BigInt(i)],
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const typedJob = contractJob as any;
            if (typedJob) {
              const clientAddr = (Array.isArray(typedJob) ? typedJob[0] : typedJob.client) as string;
              const freelancerAddr = (Array.isArray(typedJob) ? typedJob[1] : typedJob.freelancer) as string;
              const escrowAmt = (Array.isArray(typedJob) ? typedJob[2] : typedJob.escrowAmount) as bigint;
              const reqs = (Array.isArray(typedJob) ? typedJob[3] : typedJob.requirements) as string;
              const stat = (Array.isArray(typedJob) ? typedJob[7] : typedJob.status) as number;
              const dispCount = (Array.isArray(typedJob) ? typedJob[8] : typedJob.disputeCount) as number;

              if (
                clientAddr &&
                clientAddr !== "0x0000000000000000000000000000000000000000" &&
                address &&
                (clientAddr.toLowerCase() === address.toLowerCase() ||
                 freelancerAddr.toLowerCase() === address.toLowerCase())
              ) {
                jobsList.push({
                  id: i,
                  client: clientAddr,
                  freelancer: freelancerAddr,
                  escrowAmount: escrowAmt,
                  requirements: reqs,
                  status: stat,
                  disputeCount: dispCount,
                  isLive: true,
                });
              }
            }
          } catch (err) {
            console.error(`Failed to fetch job ${i}:`, err);
          }
        }
        // Sort live jobs by ID descending (newest first)
        jobsList.reverse();
        if (active) {
          setLiveJobs(jobsList);
        }
      } catch (err) {
        console.error("Error creating public client:", err);
      } finally {
        if (active) {
          setIsLoadingLive(false);
        }
      }
    };

    fetchLiveJobs();

    return () => {
      active = false;
    };
  }, [totalJobs, address]);

  // Filter jobs based on activeTab selection
  const filteredJobs = liveJobs.filter((job) => {
    if (activeTab === "active") {
      return job.status !== 4; // Not Closed
    }
    return true; // "all"
  });

  const clientJobs = filteredJobs.filter(
    (job) => address && job.client.toLowerCase() === address.toLowerCase()
  );
  const freelancerJobs = filteredJobs.filter(
    (job) => address && job.freelancer.toLowerCase() === address.toLowerCase()
  );

  const arbitratedCount = liveJobs.filter(job => job.disputeCount > 0).length;
  const platformEarnings = BigInt(arbitratedCount) * 2000000000000000000n; // 2 STT per arbitrated job

  return (
    <div className="flex-grow flex flex-col min-h-screen bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="border-b border-border bg-card backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center hover:opacity-90 transition-opacity duration-300"
          >
            <img
              src="/logo_text.png"
              alt="Abita Logo"
              className="h-16 w-auto"
            />
          </Link>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-[10px] text-muted uppercase font-bold tracking-wider">
                  Connected Wallet
                </span>
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
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-1 w-full">
        {/* Welcome & CTA section - Centered Layout */}
        <div className="flex flex-col items-center text-center gap-6 pb-12 border-b border-border">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Freelance Escrow Dashboard
            </h1>
            <p className="text-base md:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              Escrow agreements protected by deterministic, consensus-verified
              AI arbitrators on Somnia Network.
            </p>
          </div>

          <Link href="/post" className="inline-block mt-2">
            <motion.div
              className="flex items-center justify-center space-x-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-card hover:bg-primary-hover transition-all duration-300 shadow-md cursor-pointer"
            >
              <Plus className="h-5 w-5 shrink-0" />
              <span>Create New Escrow</span>
            </motion.div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="rounded-xl border border-border bg-card p-6 flex items-center space-x-4 shadow-sm">
            <div className="flex h-12 w-12 rounded-lg bg-primary/10 text-primary">
              <Shield className="h-6 w-6 mx-auto my-auto" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                Secured Contracts
              </span>
              <span className="text-2xl font-bold text-foreground">
                {liveJobs.length} Active
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 flex items-center space-x-4 shadow-sm">
            <div className="flex h-12 w-12 rounded-lg bg-primary/10 text-primary">
              <Gavel className="h-6 w-6 mx-auto my-auto" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                AI Arbitrations
              </span>
              <span className="text-2xl font-bold text-foreground">
                {arbitratedCount} Adjudicated
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 flex items-center space-x-4 shadow-sm">
            <div className="flex h-12 w-12 rounded-lg bg-primary/10 text-primary">
              <Award className="h-6 w-6 mx-auto my-auto" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                Total Platform Earnings
              </span>
              <span className="text-2xl font-bold text-foreground">
                {formatEther(platformEarnings)} STT
              </span>
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
              {activeTab === "all" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`font-semibold text-sm pb-4 relative transition-colors duration-300 cursor-pointer ${activeTab === "active" ? "text-primary" : "text-muted hover:text-foreground"}`}
            >
              Active Escrows
              {activeTab === "active" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
              )}
            </button>
          </div>
          <span className="font-mono text-xs text-muted">
            Feed displays latest live transactions
          </span>
        </div>

        {/* 1. Client Workspace Portal (Jobs Funded) */}
        <div className="mt-12 space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center">
              <Shield className="h-5 w-5 text-primary mr-2" />
              Escrows You Funded (Client Portal)
            </h2>
            <p className="text-xs text-muted mt-1">
              Manage your freelance hires, review deliverables, release locked
              escrow funds, or file a dispute.
            </p>
          </div>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {isLoadingLive && liveJobs.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-muted animate-pulse">
                  Syncing live escrow contracts on Somnia Network...
                </div>
              ) : clientJobs.length === 0 ? (
                <div className="col-span-full py-10 text-center text-xs text-muted border border-dashed border-border rounded-2xl bg-card shadow-sm">
                  You have not posted or funded any escrow agreements yet.
                </div>
              ) : (
                clientJobs.map((job, idx) => {
                  const statusInfo =
                    STATUS_DETAILS[job.status] || STATUS_DETAILS[0];
                  return (
                    <ClientJobCard
                      key={job.id}
                      job={job}
                      statusInfo={statusInfo}
                      index={idx}
                    />
                  );
                })
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* 2. Freelancer Workspace Portal (My Assigned Jobs) */}
        <div className="mt-16 space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center">
              <Award className="h-5 w-5 text-primary mr-2" />
              My Freelance Jobs (Freelancer Portal)
            </h2>
            <p className="text-xs text-muted mt-1">
              Track your active assignments, deliver your work proofs, stake
              dispute claims, and claim your payouts.
            </p>
          </div>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {isLoadingLive && liveJobs.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-muted animate-pulse">
                  Syncing live escrow contracts on Somnia Network...
                </div>
              ) : freelancerJobs.length === 0 ? (
                <div className="col-span-full py-10 text-center text-xs text-muted border border-dashed border-border rounded-2xl bg-card shadow-sm">
                  You are not currently hired for any freelance assignments.
                </div>
              ) : (
                freelancerJobs.map((job, idx) => {
                  const statusInfo =
                    STATUS_DETAILS[job.status] || STATUS_DETAILS[0];
                  return (
                    <FreelancerJobCard
                      key={job.id}
                      job={job}
                      statusInfo={statusInfo}
                      index={idx}
                    />
                  );
                })
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Coming Soon Marketplace section */}
        <div className="mt-24">
          <MarketplaceTeaser />
        </div>
      </main>
    </div>
  );
}
