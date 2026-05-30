"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { ArrowLeft, Wallet, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { usePostJob } from "@/hooks/usePostJob";

/**
 * @notice PostJob Component
 * Forms interface to stake escrow funds and hire a freelancer on-chain.
 * Updated for the light slate grey theme and royal blue accents.
 */
export default function PostJob() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { postJob, isPending, isSuccess, error, hash } = usePostJob();

  const [freelancer, setFreelancer] = useState("");
  const [requirements, setRequirements] = useState("");
  const [amountSTT, setAmountSTT] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Standard Address Validation
    if (!freelancer.startsWith("0x") || freelancer.length !== 42) {
      setValidationError("Please enter a valid 42-character Ethereum address.");
      toast.error("Invalid wallet address.");
      return;
    }

    if (parseFloat(amountSTT) <= 0 || isNaN(parseFloat(amountSTT))) {
      setValidationError("Escrow payment must be greater than zero.");
      toast.error("Invalid payment amount.");
      return;
    }

    if (requirements.trim().length < 10) {
      setValidationError("Requirements must outline at least 10 characters.");
      toast.error("Requirements brief is too short.");
      return;
    }

    // Call the smart contract write hook
    postJob(freelancer, requirements, amountSTT);
  };

  // Redirect to dashboard on transaction success
  useEffect(() => {
    if (isSuccess) {
      toast.success("Escrow posted successfully!", {
        description: `Tx hash: ${hash?.slice(0, 10)}... Redirecting to dashboard...`,
      });
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, hash, router]);

  useEffect(() => {
    if (error) {
      console.error("Failed to post job:", error);
      toast.error("Failed to post job", {
        description: error.message,
      });
    }
  }, [error]);

  useEffect(() => {
    if (isPending) {
      toast.loading("Broadcasting escrow contract...", { id: "post-job" });
    } else {
      toast.dismiss("post-job");
    }
  }, [isPending]);

  return (
    <div className="flex-grow flex flex-col min-h-screen bg-background text-foreground">
      {/* Simple Header */}
      <header className="border-b border-border bg-card backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity duration-300">
            <img src="/logo_text.png" alt="Abita Logo" className="h-16 w-auto" />
          </Link>
          <Link href="/dashboard" className="flex items-center space-x-2 text-sm text-muted hover:text-primary transition-all duration-300 border border-border bg-card px-3 py-1.5 rounded-lg shadow-sm">
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border bg-card p-8 md:p-12 shadow-sm"
        >
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Abita Logo" className="h-14 w-14 object-contain animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Initialize Escrow
            </h2>
          </div>

          <p className="mt-2 text-sm text-muted">
            Fund the contract, locks payment, and detail requirements. Funds are locked securely in the contract and cannot be claimed until delivered or judged by the deterministic AI.
          </p>

          {!isConnected ? (
            <div className="mt-12 flex flex-col items-center justify-center border border-dashed border-border rounded-xl p-12 bg-background">
              <Wallet className="h-10 w-10 text-muted animate-bounce" />
              <span className="mt-4 text-base font-semibold text-foreground">Wallet Disconnected</span>
              <span className="mt-1 text-xs text-muted text-center max-w-xs">
                You must connect your MetaMask or Somnia wallet in the header before initializing a contract escrow.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              {validationError && (
                <div className="rounded-lg border border-primary/20 bg-primary-light p-4 text-xs font-semibold text-primary">
                  {validationError}
                </div>
              )}

              {/* Freelancer Input */}
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider text-muted font-bold">
                  Freelancer Wallet Address
                </label>
                <input
                  disabled={isPending || isSuccess}
                  type="text"
                  placeholder="0x..."
                  value={freelancer}
                  onChange={(e) => setFreelancer(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none transition-all duration-300"
                  required
                />
              </div>

              {/* Escrow Value Input */}
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider text-muted font-bold">
                  Escrow Payment Amount (STT)
                </label>
                <input
                  disabled={isPending || isSuccess}
                  type="number"
                  step="0.0001"
                  placeholder="e.g. 5.0"
                  value={amountSTT}
                  onChange={(e) => setAmountSTT(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none transition-all duration-300"
                  required
                />
              </div>

              {/* Requirements Input */}
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider text-muted font-bold">
                  Job Specifications & Requirements
                </label>
                <textarea
                  disabled={isPending || isSuccess}
                  placeholder="Outline requirements clearly. Include color palettes, styles, file deliverables, and links..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={6}
                  className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none transition-all duration-300 resize-none"
                  required
                />
              </div>

              {/* Submit CTA */}
              <motion.button
                disabled={isPending || isSuccess}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="mt-8 flex w-full items-center justify-center rounded-xl bg-primary py-4 text-base font-bold text-card hover:bg-primary-hover transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    <span>Broadcasting Escrow...</span>
                  </>
                ) : (
                  <span>Launch Contract Escrow</span>
                )}
              </motion.button>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}
