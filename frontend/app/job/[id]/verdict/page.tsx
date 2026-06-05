"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, usePublicClient } from "wagmi";
import { ABICORE_CONTRACT_ADDRESS } from "@/lib/config";
import { formatEther } from "viem";
import {
  ArrowLeft,
  Brain,
  Award,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useJobData } from "@/hooks/useJobData";
import { useCloseJob } from "@/hooks/useCloseJob";
import { useRetryJob } from "@/hooks/useRetryJob";
import ClientChoice from "@/components/ClientChoice";

export default function VerdictPage() {
  const params = useParams();
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const idStr = typeof params?.id === "string" ? params.id : "";
  const jobId = idStr ? BigInt(idStr) : 0n;

  const {
    job: contractJob,
    refetch,
    isLoading: dataLoading,
  } = useJobData(jobId);

  const job = useMemo(
    () =>
      contractJob || {
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
      },
    [contractJob],
  );

  const {
    closeJob,
    isPending: closePending,
    isSuccess: closeSuccess,
    error: closeError,
  } = useCloseJob();
  const {
    retryJob,
    isPending: retryPending,
    isSuccess: retrySuccess,
    error: retryError,
  } = useRetryJob();

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

  const [escrowAmountCount, setEscrowAmountCount] = useState(0);

  const isClient =
    job && address ? address.toLowerCase() === job.client.toLowerCase() : false;

  // --- Debug logging — visible in browser DevTools console ---
  useEffect(() => {
    if (!job) return;
    const statusNames = [
      "Open",
      "Delivered",
      "Disputed",
      "PendingClientChoice",
      "Closed",
    ];
    console.log(
      `[Abita] Job #${jobId} polled — status: ${statusNames[job.status] ?? job.status} (${job.status})`,
      {
        disputeCount: job.disputeCount,
        pendingRequestId: job.pendingRequestId?.toString(),
        lastVerdictWinner: job.lastVerdictWinner,
        escrowAmount: job.escrowAmount?.toString(),
        freelancerWinStreak: job.freelancerWinStreak,
      },
    );
  }, [job?.status, job?.pendingRequestId, job?.lastVerdictWinner, jobId]);

  // The on-chain audit trail lives at agents.testnet.somnia.network.
  // We use the pendingRequestId stored on the job to deep-link to the receipt.
  // Note: pendingRequestId is reset to 0 after the callback fires — so we track
  // the last known requestId in state to keep the link alive after verdict.
  const [auditRequestId, setAuditRequestId] = useState<string | null>(null);

  // Initial load from localStorage
  useEffect(() => {
    if (jobId) {
      const cachedId = localStorage.getItem(
        `abita_job_${jobId.toString()}_last_request_id`,
      );
      if (cachedId) {
        setAuditRequestId(cachedId);
      }
    }
  }, [jobId]);

  // Query historical on-chain events as a fallback to ensure we ALWAYS retrieve
  // the correct request ID, even on clean devices or when localStorage is empty.
  useEffect(() => {
    if (!jobId || !publicClient) return;

    const fetchLogs = async () => {
      try {
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock > 990n ? currentBlock - 990n : 0n;

        const logs = await publicClient.getLogs({
          address: ABICORE_CONTRACT_ADDRESS as `0x${string}`,
          event: {
            type: "event",
            name: "JudgmentRequested",
            inputs: [
              { indexed: true, name: "jobId", type: "uint256" },
              { indexed: false, name: "requestId", type: "uint256" },
              { indexed: false, name: "disputeCount", type: "uint8" },
            ],
          },
          args: {
            jobId: jobId,
          },
          fromBlock,
        });

        if (logs.length > 0) {
          const latestLog = logs[logs.length - 1];
          const reqId = latestLog.args.requestId;
          if (reqId) {
            const reqIdStr = reqId.toString();
            console.log(
              `[Abita] Captured requestId from on-chain event logs: #${reqIdStr}`,
            );
            setAuditRequestId(reqIdStr);
            localStorage.setItem(
              `abita_job_${jobId.toString()}_last_request_id`,
              reqIdStr,
            );
          }
        }
      } catch (err) {
        console.error("Failed to query on-chain JudgmentRequested logs:", err);
      }
    };

    fetchLogs();
  }, [jobId, publicClient]);

  useEffect(() => {
    if (job?.pendingRequestId && job.pendingRequestId !== 0n) {
      const id = job.pendingRequestId.toString();
      console.log(
        `[Abita] Somnia request ID captured: #${id} — audit URL: https://agents.testnet.somnia.network/receipts/${id}`,
      );
      setAuditRequestId(id);
      if (jobId) {
        localStorage.setItem(
          `abita_job_${jobId.toString()}_last_request_id`,
          id,
        );
      }
    }
  }, [job?.pendingRequestId, jobId]);

  useEffect(() => {
    if (closeSuccess) {
      toast.success("Job closed and settled!", {
        description: "Escrow refunded successfully.",
      });
    }
  }, [closeSuccess]);

  useEffect(() => {
    if (retrySuccess) {
      toast.success("Escrow reset successfully!", {
        description: "Status is back to Open. Freelancer must re-deliver.",
      });
    }
  }, [retrySuccess]);

  useEffect(() => {
    if (closePending) {
      toast.loading("Terminating job and executing refund...", {
        id: "close-verdict",
      });
    } else {
      toast.dismiss("close-verdict");
    }
  }, [closePending]);

  useEffect(() => {
    if (retryPending) {
      toast.loading("Resetting escrow for re-delivery...", {
        id: "retry-verdict",
      });
    } else {
      toast.dismiss("retry-verdict");
    }
  }, [retryPending]);

  useEffect(() => {
    if (closeSuccess || retrySuccess) refetch();
  }, [closeSuccess, retrySuccess, refetch]);

  // The verdict has arrived when lastVerdictWinner is a real address (non-zero).
  // We can't use status alone — a freelancer single-win resets status back to Open (0),
  // so status 0 can legitimately be a post-verdict state.
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const hasVerdict =
    !!contractJob &&
    !!job.lastVerdictWinner &&
    job.lastVerdictWinner.toLowerCase() !== ZERO_ADDRESS;

  useEffect(() => {
    if (hasVerdict && job && job.status === 4) {
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
  }, [hasVerdict, job]);

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
            <span className="text-sm font-mono text-muted hidden sm:inline">
              Verdict ID #{jobId.toString()}
            </span>
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
              className="rounded-2xl border border-border bg-card p-12 text-center space-y-8 shadow-sm"
            >
              {/* Pulsing brain icon */}
              <div className="relative mx-auto h-24 w-24">
                <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                <div className="relative flex h-24 w-24 rounded-full bg-primary/5 border border-primary/30 text-primary">
                  <Brain className="h-10 w-10 mx-auto my-auto animate-pulse" />
                </div>
              </div>

              {/* Status copy */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">
                  AI Arbitrator Deliberating
                </h3>
                <p className="text-sm text-muted max-w-xs mx-auto">
                  The Somnia validator subcommittee is running inference.
                  Polling every 5 seconds for the callback.
                </p>
              </div>

              {/* Real data only — no mock logs */}
              <div className="space-y-3 text-left max-w-sm mx-auto">
                <div className="flex items-center justify-between text-xs border border-border rounded-lg px-4 py-3 bg-background">
                  <span className="text-muted font-mono">Job ID</span>
                  <span className="text-foreground font-mono font-semibold">
                    #{jobId.toString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border border-border rounded-lg px-4 py-3 bg-background">
                  <span className="text-muted font-mono">Dispute Round</span>
                  <span className="text-foreground font-mono font-semibold">
                    {job.disputeCount === 0
                      ? "Pending"
                      : `${job.disputeCount} of 5`}
                  </span>
                </div>
                {auditRequestId && (
                  <div className="flex items-center justify-between text-xs border border-primary/20 rounded-lg px-4 py-3 bg-primary/5">
                    <span className="text-primary/70 font-mono">
                      Request ID
                    </span>
                    <span className="text-primary font-mono font-semibold">
                      #{auditRequestId}
                    </span>
                  </div>
                )}
              </div>

              {/* Live waiting indicator */}
              <div className="flex items-center justify-center space-x-1.5 pt-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-primary"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
                <span className="text-xs text-muted ml-2">
                  Waiting for on-chain callback
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="verdict-reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {job.disputeCount === 5 && (
                <div className="rounded-xl bg-primary-light border border-primary/20 p-4 flex items-center space-x-3 text-primary shadow-sm">
                  <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                  <span className="text-base font-bold">
                    FINAL AND ABSOLUTE RULING — Appeal limits exceeded
                  </span>
                </div>
              )}

              {hasVerdict && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                  className="rounded-2xl border border-primary/30 bg-card p-8 md:p-12 text-center space-y-6 relative overflow-hidden shadow-md"
                  style={{ boxShadow: "0 0 40px rgba(37, 99, 235, 0.06)" }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute inset-0 rounded-full bg-primary/5 blur-3xl -z-10"
                  />
                  <div className="flex h-16 w-16 rounded-full bg-primary/10 border border-primary/30 text-primary mx-auto">
                    <Award className="h-8 w-8 mx-auto my-auto animate-bounce" />
                  </div>

                  {/* Winner role badge */}
                  <div>
                    <span
                      className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-3
                      border-primary/40 bg-primary/10 text-primary"
                    >
                      {job.lastVerdictWinner.toLowerCase() ===
                      job.client.toLowerCase()
                        ? "Client wins"
                        : "Freelancer wins"}
                    </span>
                    <span className="text-[10px] uppercase text-muted tracking-widest block mb-1">
                      Winning Wallet Address
                    </span>
                    <span className="block font-mono text-lg md:text-xl text-foreground break-all max-w-md mx-auto border border-border rounded-xl px-4 py-2 bg-background">
                      {job.lastVerdictWinner}
                    </span>
                  </div>

                  <div className="pt-6 border-t border-border max-w-sm mx-auto space-y-4">
                    {job.status === 4 ? (
                      <>
                        <span className="text-[10px] uppercase text-muted tracking-wider block font-semibold">
                          Escrow Released
                        </span>
                        <span className="text-3xl font-bold text-foreground block mt-1">
                          {escrowAmountCount.toFixed(2)} STT
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] uppercase text-muted tracking-wider block font-semibold">
                          Escrow Status
                        </span>
                        <span className="text-lg font-semibold text-[#D4A017] block mt-1">
                          Pending Your Decision
                        </span>
                        <span className="text-xs text-muted block mt-0.5">
                          Escrow is locked until you choose below.
                        </span>
                      </>
                    )}

                    {/* Audit receipt — secondary, just a button */}

                    <Link
                      href={`https://agents.testnet.somnia.network${auditRequestId ? `/receipts/${auditRequestId}` : ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-center items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-card hover:bg-primary-hover transition-all duration-300 hover:shadow-md cursor-pointer"
                    >
                      View on-chain audit receipt
                      <ExternalLink className="size-4 shrink-0" />
                    </Link>
                  </div>
                </motion.div>
              )}

              {hasVerdict && job.status === 3 && (
                <div className="pt-6">
                  {isClient ? (
                    <ClientChoice
                      onClose={() => closeJob(jobId)}
                      onRetry={() => retryJob(jobId)}
                      isPending={closePending || retryPending}
                    />
                  ) : (
                    <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-2 shadow-sm">
                      <CheckCircle2 className="h-8 w-8 text-primary mx-auto animate-pulse" />
                      <h3 className="text-lg font-semibold text-foreground">
                        Decision Awaiting Client
                      </h3>
                      <p className="text-xs text-muted max-w-xs mx-auto">
                        The client must now choose: Terminate & Close (refund
                        escrow) or Request Corrections (retry).
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
