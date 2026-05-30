"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { ArrowLeft, Brain, Award, ShieldAlert, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useJobData } from "@/hooks/useJobData";
import { useCloseJob } from "@/hooks/useCloseJob";
import { useRetryJob } from "@/hooks/useRetryJob";
import ClientChoice from "@/components/ClientChoice";



export default function VerdictPage() {
  const params = useParams();
  const { address } = useAccount();
  
  const idStr = typeof params?.id === "string" ? params.id : "";
  const jobId = idStr ? BigInt(idStr) : 0n;

  const { job: contractJob, refetch, isLoading: dataLoading } = useJobData(jobId);
  
  const job = React.useMemo(() => contractJob || {
    client: "0x0000000000000000000000000000000000000000",
    freelancer: "0x0000000000000000000000000000000000000000",
    escrowAmount: 0n,
    requirements: "",
    deliveryNote: "",
    clientArgument: "",
    freelancerArgument: "",
    status: 0,
    disputeCount: 0,
    freelancerWinStreak: 0,
    lastVerdictWinner: "0x0000000000000000000000000000000000000000",
    pendingRequestId: 0n,
    clientDisputeStaked: false,
    freelancerDisputeStaked: false,
  }, [contractJob]);

  const { closeJob, isPending: closePending, isSuccess: closeSuccess, error: closeError } = useCloseJob();
  const { retryJob, isPending: retryPending, isSuccess: retrySuccess, error: retryError } = useRetryJob();

  useEffect(() => {
    if (closeError) {
      console.error("Close job from verdict failed:", closeError);
      toast.error("Failed to close job", { description: closeError.message });
    }
  }, [closeError]);

  useEffect(() => {
    if (retryError) {
      console.error("Retry job from verdict failed:", retryError);
      toast.error("Failed to retry job", { description: retryError.message });
    }
  }, [retryError]);

  const [revealedLinesCount, setRevealedLinesCount] = useState(0);
  const [showWinner, setShowWinner] = useState(false);
  const [escrowAmountCount, setEscrowAmountCount] = useState(0);

  const isClient = job && address ? address.toLowerCase() === job.client.toLowerCase() : false;

  const chainOfThoughtLogs = [
    "Initializing Arbitrator Consensus Subcommittee...",
    "Retrieving job details, specifications, and evidence on-chain...",
    "Analyzing Client Requirements: 'Design a minimal blue logo. No gradients.'",
    "Analyzing Freelancer Delivery: 'Completed wordmark with solid blue palette.'",
    "Evaluating Client Argument: 'The freelancer used gradients instead of solid colors.'",
    "Evaluating Freelancer Argument: 'Brief requested blue palette. Minimal is subjective.'",
    "Arbitrator Finding: Freelancer's Figma link reveals gradient blends on background elements.",
    "Rule Check: Minimal design briefs requesting no gradients take absolute precedence over subjective palette options.",
    "Consensus Reached: Freelancer failed to satisfy the explicit constraint of the requirements brief.",
    "Final Ruling: 100% Escrow allocated in favor of the CLIENT."
  ];

  useEffect(() => {
    if (closeSuccess) {
      toast.success("Job closed and settled!", { description: "Escrow refunded successfully." });
    }
  }, [closeSuccess]);

  useEffect(() => {
    if (retrySuccess) {
      toast.success("Escrow reset successfully!", { description: "Status is back to Open. Freelancer must re-deliver." });
    }
  }, [retrySuccess]);

  useEffect(() => {
    if (closePending) {
      toast.loading("Terminating job and executing refund...", { id: "close-verdict" });
    } else {
      toast.dismiss("close-verdict");
    }
  }, [closePending]);

  useEffect(() => {
    if (retryPending) {
      toast.loading("Resetting escrow for re-delivery...", { id: "retry-verdict" });
    } else {
      toast.dismiss("retry-verdict");
    }
  }, [retryPending]);

  useEffect(() => {
    if (closeSuccess || retrySuccess) refetch();
  }, [closeSuccess, retrySuccess, refetch]);

  useEffect(() => {
    if (job && job.status !== 2) {
      const timer = setInterval(() => {
        setRevealedLinesCount((prev) => {
          if (prev < chainOfThoughtLogs.length) return prev + 1;
          clearInterval(timer);
          setShowWinner(true);
          return prev;
        });
      }, 1500);
      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job]);

  useEffect(() => {
    if (showWinner && job) {
      const targetAmount = parseFloat(formatEther(job.escrowAmount));
      let current = 0;
      const step = targetAmount / 50;
      const countTimer = setInterval(() => {
        current += step;
        if (current >= targetAmount) {
          setEscrowAmountCount(targetAmount);
          clearInterval(countTimer);
        } else {
          setEscrowAmountCount(current);
        }
      }, 30);
      return () => clearInterval(countTimer);
    }
  }, [showWinner, job]);

  // Show full-page loader only if we are loading and don't have contract data yet
  const showSpinner = dataLoading && !contractJob;

  if (showSpinner || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-sans">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const isDeliberating = job.status === 2;

  return (
    <div className="flex-grow flex flex-col min-h-screen bg-background text-foreground font-sans">
      <header className="border-b border-border bg-card/85 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity duration-300">
            <img src="/logo_text.png" alt="Abita Logo" className="h-16 w-auto" />
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-mono text-muted hidden sm:inline">Verdict ID #{jobId.toString()}</span>
            <Link
              href={`/job/${jobId}`}
              className="flex items-center space-x-2 text-sm text-muted hover:text-primary transition-all duration-300 border border-border bg-card px-3 py-1.5 rounded-lg shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Escrow Details</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full flex flex-col justify-center space-y-8">
        <AnimatePresence mode="wait">
          {isDeliberating ? (
            <motion.div
              key="deliberating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border border-border bg-card p-12 text-center space-y-6 shadow-sm"
            >
              <div className="relative mx-auto h-24 w-24">
                <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                <div className="relative flex h-24 w-24 rounded-full bg-primary/5 border border-primary/30 text-primary">
                  <Brain className="h-10 w-10 mx-auto my-auto animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">AI Arbitrator Deliberating</h3>
                <p className="mt-2 text-sm text-muted max-w-sm mx-auto">
                  Somnia&apos;s decentralized validation subcommittee is executing the qualitative inference and checking consensus. This takes about 10-15 seconds.
                </p>
              </div>
              <div className="font-mono text-xs text-primary space-y-2 bg-background border border-border rounded-xl p-4 max-w-md mx-auto">
                <div className="animate-pulse flex items-center justify-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                  <span>[Consensus] Gathering validator node signatures...</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="verdict-reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {job.disputeCount === 5 && (
                <div className="rounded-xl bg-primary-light border border-primary/20 p-4 flex items-center space-x-3 text-primary shadow-sm">
                  <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                  <span className="text-base font-bold">FINAL AND ABSOLUTE RULING — Appeal limits exceeded</span>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-card p-8 md:p-12 space-y-4 shadow-sm">
                <h3 className="text-xl font-bold text-foreground border-b border-border pb-4">Consensus Arbitrator Audit Log</h3>
                <div className="space-y-3 pt-4">
                  {chainOfThoughtLogs.slice(0, revealedLinesCount).map((log, index) => {
                    const isLast = index === revealedLinesCount - 1;
                    const isConclusion = index === chainOfThoughtLogs.length - 1;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-start space-x-3 font-mono text-xs ${isConclusion ? "text-primary bg-primary-light border border-primary/20 p-3 rounded-lg mt-6 font-semibold" : isLast ? "text-foreground" : "text-muted"}`}
                      >
                        <ChevronRight className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isConclusion ? "text-primary" : "text-muted"}`} />
                        <span>{log}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {showWinner && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                  className="rounded-2xl border border-primary/30 bg-card p-8 md:p-12 text-center space-y-6 relative overflow-hidden shadow-md"
                  style={{ boxShadow: "0 0 40px rgba(37, 99, 235, 0.06)" }}
                >
                  <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute inset-0 rounded-full bg-primary/5 blur-3xl -z-10" />
                  <div className="flex h-16 w-16 rounded-full bg-primary/10 border border-primary/30 text-primary mx-auto">
                    <Award className="h-8 w-8 mx-auto my-auto animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-primary tracking-widest font-bold block">Winning Wallet Address</span>
                    <span className="mt-2 block font-mono text-lg md:text-xl text-foreground break-all max-w-md mx-auto border border-border rounded-xl px-4 py-2 bg-background">
                      {job.lastVerdictWinner}
                    </span>
                  </div>
                  <div className="pt-6 border-t border-border max-w-sm mx-auto">
                    <span className="text-[10px] uppercase text-muted tracking-wider block font-semibold">
                      {job.status === 4 ? "Escrow Settle Release" : "Staked dispute fee refund"}
                    </span>
                    <span className="text-3xl font-bold text-foreground block mt-1">{escrowAmountCount.toFixed(2)} STT</span>
                  </div>
                </motion.div>
              )}

              {showWinner && job.status === 3 && (
                <div className="pt-6">
                  {isClient ? (
                    <ClientChoice onClose={() => closeJob(jobId)} onRetry={() => retryJob(jobId)} isPending={closePending || retryPending} />
                  ) : (
                    <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-2 shadow-sm">
                      <CheckCircle2 className="h-8 w-8 text-primary mx-auto animate-pulse" />
                      <h3 className="text-lg font-semibold text-foreground">Decision Awaiting Client</h3>
                      <p className="text-xs text-muted max-w-xs mx-auto">
                        The client must now choose: Terminate & Close (refund escrow) or Request Corrections (retry).
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
