"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { ArrowLeft, Wallet, Shield, Check, AlertCircle, FileText, Gavel, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useJobData } from "../../../hooks/useJobData";
import { useApproveDelivery } from "../../../hooks/useApproveDelivery";
import { useSubmitDelivery } from "../../../hooks/useSubmitDelivery";
import { useRaiseDispute } from "../../../hooks/useRaiseDispute";
import { useSubmitArgument } from "../../../hooks/useSubmitArgument";
import { useJudgeDispute } from "../../../hooks/useJudgeDispute";
import { useCloseJob } from "../../../hooks/useCloseJob";
import { useRetryJob } from "../../../hooks/useRetryJob";

import DisputeProgress from "../../../components/DisputeProgress";
import ClientChoice from "../../../components/ClientChoice";

const STATUS_LABELS = ["Open", "Delivered", "Disputed", "Pending Client Choice", "Closed"];

export default function JobDetail() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const jobId = BigInt(params.id as string);

  // Polls automatically every 5s if status is Disputed (2)
  const { job, refetch, isLoading: dataLoading } = useJobData(jobId);

  // Hook bindings
  const { approveDelivery, isPending: approvePending, isSuccess: approveSuccess } = useApproveDelivery();
  const { submitDelivery, isPending: deliverPending, isSuccess: deliverSuccess } = useSubmitDelivery();
  const { raiseDispute, isPending: stakePending, isSuccess: stakeSuccess } = useRaiseDispute();
  const { submitArgument, isPending: argPending, isSuccess: argSuccess } = useSubmitArgument();
  const { judgeDispute, isPending: judgePending, isSuccess: judgeSuccess } = useJudgeDispute();
  const { closeJob, isPending: closePending, isSuccess: closeSuccess } = useCloseJob();
  const { retryJob, isPending: retryPending, isSuccess: retrySuccess } = useRetryJob();

  // Inputs
  const [deliveryNote, setDeliveryNote] = useState("");
  const [argument, setArgument] = useState("");

  const userAddress = address?.toLowerCase();
  const isClient = job ? userAddress === job.client.toLowerCase() : false;
  const isFreelancer = job ? userAddress === job.freelancer.toLowerCase() : false;

  // Individual transaction outcome notifications via Sonner
  useEffect(() => {
    if (deliverSuccess) {
      toast.success("Delivery submitted successfully!", {
        description: "The client will now review your work.",
      });
      setDeliveryNote("");
    }
  }, [deliverSuccess]);

  useEffect(() => {
    if (approveSuccess) {
      toast.success("Delivery approved successfully!", {
        description: "Locked escrow payment has been released to the freelancer.",
      });
    }
  }, [approveSuccess]);

  useEffect(() => {
    if (stakeSuccess) {
      toast.success("Dispute fee staked successfully!", {
        description: "1.0 STT locked. Wait for the dispute pipeline to initialize.",
      });
    }
  }, [stakeSuccess]);

  useEffect(() => {
    if (argSuccess) {
      toast.success("Argument recorded on-chain!", {
        description: "Your testimony is submitted to the AI consensus arbitrator.",
      });
      setArgument("");
    }
  }, [argSuccess]);

  useEffect(() => {
    if (judgeSuccess) {
      toast.success("AI consensus request launched!", {
        description: "Redirecting to verdict deliberation subcommittee portal...",
      });
    }
  }, [judgeSuccess]);

  useEffect(() => {
    if (closeSuccess) {
      toast.success("Job closed and settled!", {
        description: "Escrow funds have been refunded to your wallet.",
      });
    }
  }, [closeSuccess]);

  useEffect(() => {
    if (retrySuccess) {
      toast.success("Escrow reset successfully!", {
        description: "Status is back to Open. Freelancer must re-deliver changes.",
      });
    }
  }, [retrySuccess]);

  // Loading notifications via Sonner
  useEffect(() => {
    if (deliverPending) {
      toast.loading("Submitting completed work note on-chain...", { id: "deliver" });
    } else {
      toast.dismiss("deliver");
    }
  }, [deliverPending]);

  useEffect(() => {
    if (approvePending) {
      toast.loading("Approving deliverable and releasing funds...", { id: "approve" });
    } else {
      toast.dismiss("approve");
    }
  }, [approvePending]);

  useEffect(() => {
    if (stakePending) {
      toast.loading("Staking 1.0 STT dispute fee...", { id: "stake" });
    } else {
      toast.dismiss("stake");
    }
  }, [stakePending]);

  useEffect(() => {
    if (argPending) {
      toast.loading("Recording dispute argument on-chain...", { id: "argument" });
    } else {
      toast.dismiss("argument");
    }
  }, [argPending]);

  useEffect(() => {
    if (judgePending) {
      toast.loading("Querying validator signatures and launching consensus...", { id: "judge" });
    } else {
      toast.dismiss("judge");
    }
  }, [judgePending]);

  useEffect(() => {
    if (closePending) {
      toast.loading("Terminating job and executing refund...", { id: "close" });
    } else {
      toast.dismiss("close");
    }
  }, [closePending]);

  useEffect(() => {
    if (retryPending) {
      toast.loading("Resetting escrow for re-delivery...", { id: "retry" });
    } else {
      toast.dismiss("retry");
    }
  }, [retryPending]);

  // Refetch when transaction states succeed to sync local client immediately
  useEffect(() => {
    if (approveSuccess || deliverSuccess || stakeSuccess || argSuccess || closeSuccess || retrySuccess) {
      refetch();
    }
  }, [approveSuccess, deliverSuccess, stakeSuccess, argSuccess, closeSuccess, retrySuccess, refetch]);

  // Navigate to verdict page once judgment is triggered successfully
  useEffect(() => {
    if (judgeSuccess) {
      router.push(`/job/${jobId}/verdict`);
    }
  }, [judgeSuccess, jobId, router]);

  if (dataLoading || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-sans">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col min-h-screen bg-background text-foreground font-sans">
      {/* Navigation Header */}
      <header className="border-b border-border bg-card/85 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-sm text-muted hover:text-primary transition-all duration-300">
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Job ID: #{params.id}
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full space-y-8">
        
        {/* Dispute Escalation Bar Tracker */}
        <DisputeProgress currentDispute={job.disputeCount} />

        <div className="rounded-2xl border border-border bg-card p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Escrow Agreement
            </h2>
            <span className="rounded-full border border-primary/20 bg-primary-light px-4 py-1 text-xs font-mono font-bold text-primary">
              {STATUS_LABELS[job.status]}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
            <div>
              <span className="text-[10px] uppercase text-muted tracking-wider block font-semibold">Client wallet</span>
              <span className="font-mono text-sm text-foreground break-all">{job.client}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted tracking-wider block font-semibold">Freelancer wallet</span>
              <span className="font-mono text-sm text-foreground break-all">{job.freelancer}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-t border-b border-border">
            <div>
              <span className="text-[10px] uppercase text-muted tracking-wider block font-semibold">Locked Escrow Payment</span>
              <span className="text-2xl font-bold text-foreground">
                {formatEther(job.escrowAmount)} STT
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted tracking-wider block font-semibold">Consecutive Freelancer Wins</span>
              <span className="text-2xl font-bold text-primary">
                {job.freelancerWinStreak} of 2
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase text-muted tracking-wider block font-semibold">Job Requirements</span>
            <p className="mt-2 text-sm text-foreground leading-relaxed bg-background border border-border rounded-lg p-4 font-sans whitespace-pre-wrap">
              {job.requirements}
            </p>
          </div>
        </div>

        {/* Action Panel based on state and role */}
        {!isConnected ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center bg-card shadow-sm">
            <Wallet className="h-6 w-6 text-muted mx-auto animate-pulse" />
            <span className="mt-3 block text-sm text-muted">Wallet disconnected. Connect your wallet to proceed with actions.</span>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* 1. Open State - Freelancer Submits Delivery */}
            {job.status === 0 && isFreelancer && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-8 space-y-4 shadow-sm"
              >
                <h3 className="text-xl font-bold text-foreground">
                  Submit Completed Work
                </h3>
                <textarea
                  disabled={deliverPending}
                  placeholder="Describe your delivery. Link Figma files, Github repos, or attach proofs..."
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none transition-all duration-300 resize-none"
                />
                <motion.button
                  disabled={deliverPending || deliveryNote.trim().length < 5}
                  onClick={() => submitDelivery(jobId, deliveryNote)}
                  className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-bold text-card hover:bg-primary-hover transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {deliverPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                  <span>Submit Delivery Note</span>
                </motion.button>
              </motion.div>
            )}

            {/* 2. Delivered State - Client Approves or Disputes */}
            {job.status === 1 && isClient && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Approve Card */}
                <div className="rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-sm">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      Approve Delivery
                    </h3>
                    <p className="mt-2 text-xs text-muted">
                      Releases 100% of the escrow funds directly to the freelancer. This settles the agreement.
                    </p>
                  </div>
                  <motion.button
                    disabled={approvePending}
                    onClick={() => approveDelivery(jobId)}
                    className="mt-6 flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-bold text-card hover:bg-primary-hover transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {approvePending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                    <span>Approve & Release Funds</span>
                  </motion.button>
                </div>

                {/* Stake/Dispute Card */}
                <div className="rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-sm">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      File a Dispute
                    </h3>
                    <p className="mt-2 text-xs text-muted">
                      Disagree with the work? Stake a 1 STT dispute fee. The freelancer must also stake 1 STT to activate AI adjudication.
                    </p>
                  </div>
                  <motion.button
                    disabled={stakePending || job.clientDisputeStaked}
                    onClick={() => raiseDispute(jobId)}
                    className="mt-6 flex w-full items-center justify-center rounded-xl border border-border bg-background hover:border-primary hover:text-primary py-3.5 text-sm font-bold text-foreground transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {stakePending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Gavel className="h-4 w-4 mr-2" />}
                    <span>{job.clientDisputeStaked ? "Staked — Waiting for Freelancer" : "Stake 1 STT to Dispute"}</span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* 3. Staking Stage (waiting for either party to stake) */}
            {(job.status === 1 || job.status === 0) && (job.clientDisputeStaked || job.freelancerDisputeStaked) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-8 space-y-4 shadow-sm"
              >
                <h3 className="text-xl font-bold text-foreground">
                  Dispute Pipeline Active
                </h3>
                <p className="text-xs text-muted">
                  One party has initiated a dispute and locked 1 STT. The other party must now also stake 1 STT to proceed to AI arbitration.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center py-4">
                  <div className={`rounded-xl border p-4 ${job.clientDisputeStaked ? "border-primary/20 bg-primary-light text-primary font-semibold" : "border-border bg-background text-muted"}`}>
                    Client Staked: {job.clientDisputeStaked ? "Yes" : "Awaiting"}
                  </div>
                  <div className={`rounded-xl border p-4 ${job.freelancerDisputeStaked ? "border-primary/20 bg-primary-light text-primary font-semibold" : "border-border bg-background text-muted"}`}>
                    Freelancer Staked: {job.freelancerDisputeStaked ? "Yes" : "Awaiting"}
                  </div>
                </div>

                {isFreelancer && !job.freelancerDisputeStaked && (
                  <motion.button
                    disabled={stakePending}
                    onClick={() => raiseDispute(jobId)}
                    className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-bold text-card hover:bg-primary-hover transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {stakePending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Gavel className="h-4 w-4 mr-2" />}
                    <span>Stake 1 STT & Enter Adjudication</span>
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* 4. Disputed State - Submit Arguments */}
            {job.status === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-8 space-y-6 shadow-sm"
              >
                <h3 className="text-xl font-bold text-foreground">
                  Dispute Arguments & Evidence
                </h3>
                
                {/* Read-Only Arguments */}
                <div className="space-y-4">
                  {job.clientArgument && (
                    <div className="rounded-lg border border-border bg-background p-4">
                      <span className="text-[10px] uppercase text-muted font-semibold block">Client's Argument</span>
                      <p className="mt-1 text-sm text-foreground">{job.clientArgument}</p>
                    </div>
                  )}
                  {job.freelancerArgument && (
                    <div className="rounded-lg border border-border bg-background p-4">
                      <span className="text-[10px] uppercase text-muted font-semibold block">Freelancer's Argument</span>
                      <p className="mt-1 text-sm text-foreground">{job.freelancerArgument}</p>
                    </div>
                  )}
                </div>

                {/* Input Arguments if missing */}
                {isClient && !job.clientArgument && (
                  <div className="space-y-3">
                    <label className="text-xs uppercase text-muted font-semibold block">Submit Client Argument</label>
                    <textarea
                      disabled={argPending}
                      placeholder="Outline why this delivery does not meet your specifications..."
                      value={argument}
                      onChange={(e) => setArgument(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-all duration-300"
                    />
                    <motion.button
                      disabled={argPending || argument.trim().length < 5}
                      onClick={() => submitArgument(jobId, argument)}
                      className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-card hover:bg-primary-hover transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {argPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      <span>Submit Client Argument</span>
                    </motion.button>
                  </div>
                )}

                {isFreelancer && !job.freelancerArgument && (
                  <div className="space-y-3">
                    <label className="text-xs uppercase text-muted font-semibold block">Submit Freelancer Argument</label>
                    <textarea
                      disabled={argPending}
                      placeholder="Outline why your delivery fulfills the contract requirements..."
                      value={argument}
                      onChange={(e) => setArgument(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-all duration-300"
                    />
                    <motion.button
                      disabled={argPending || argument.trim().length < 5}
                      onClick={() => submitArgument(jobId, argument)}
                      className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-card hover:bg-primary-hover transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {argPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      <span>Submit Freelancer Argument</span>
                    </motion.button>
                  </div>
                )}

                {/* If both arguments are saved, anyone can trigger the AI judgment */}
                {job.clientArgument && job.freelancerArgument && (
                  <div className="pt-4 border-t border-border">
                    <motion.button
                      disabled={judgePending}
                      onClick={() => judgeDispute(jobId)}
                      className="flex w-full items-center justify-center rounded-xl bg-primary py-4 text-base font-bold text-card hover:bg-primary-hover transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {judgePending ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          <span>Adjudicating Dispute...</span>
                        </>
                      ) : (
                        <>
                          <Gavel className="h-5 w-5 mr-2" />
                          <span>Request AI Arbitrator Ruling</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}

            {/* 5. PendingClientChoice State - Option Slide-Ins */}
            {job.status === 3 && (
              <div className="space-y-6">
                {isClient ? (
                  <ClientChoice
                    onClose={() => closeJob(jobId)}
                    onRetry={() => retryJob(jobId)}
                    isPending={closePending || retryPending}
                  />
                ) : (
                  <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-2 shadow-sm">
                    <AlertCircle className="h-8 w-8 text-primary mx-auto animate-pulse" />
                    <h3 className="text-xl font-semibold text-foreground">
                      Awaiting Client's Decision
                    </h3>
                    <p className="text-xs text-muted max-w-sm mx-auto">
                      The AI arbitrator ruled in favor of the client. The client is currently deciding whether to terminate and refund, or request changes (retry).
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
