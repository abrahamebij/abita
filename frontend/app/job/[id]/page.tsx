"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { ArrowLeft, Wallet, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useJobData } from "@/hooks/useJobData";
import { useApproveDelivery } from "@/hooks/useApproveDelivery";
import { useSubmitDelivery } from "@/hooks/useSubmitDelivery";
import { useRaiseDispute } from "@/hooks/useRaiseDispute";
import { useSubmitArgument } from "@/hooks/useSubmitArgument";
import { useJudgeDispute } from "@/hooks/useJudgeDispute";
import { useCloseJob } from "@/hooks/useCloseJob";
import { useRetryJob } from "@/hooks/useRetryJob";

import DisputeProgress from "@/components/DisputeProgress";
import ClientChoice from "@/components/ClientChoice";
import DeliveryForm from "@/components/DeliveryForm";
import DisputeFlow from "@/components/DisputeFlow";
import DisputeArguments from "@/components/DisputeArguments";

interface ArgumentHistoryItem {
  sender: "client" | "freelancer";
  text: string;
  round: number;
}

const STATUS_LABELS = ["Open", "Delivered", "Disputed", "Pending Client Choice", "Closed"];

export default function JobDetail() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  
  const idStr = typeof params?.id === "string" ? params.id : "";
  const jobId = idStr ? BigInt(idStr) : 0n;

  // Polls automatically every 5s if status is Disputed (2)
  const { job: contractJob, refetch, isLoading: dataLoading } = useJobData(jobId);

  // Fallback to empty job if contract read is offline/empty
  const job = contractJob || {
    client: "0x0000000000000000000000000000000000000000",
    freelancer: "0x0000000000000000000000000000000000000000",
    escrowAmount: 0n,
    requirements: "",
    deliveryNote: "",
    clientArgument: "",
    freelancerArgument: "",
    status: 0, // Open
    disputeCount: 0,
    freelancerWinStreak: 0,
    lastVerdictWinner: "0x0000000000000000000000000000000000000000",
    pendingRequestId: 0n,
    clientDisputeStaked: false,
    freelancerDisputeStaked: false,
  };

  // Hook bindings
  const { approveDelivery, isPending: approvePending, isSuccess: approveSuccess, error: approveError } = useApproveDelivery();
  const { submitDelivery, isPending: deliverPending, isSuccess: deliverSuccess, error: deliverError } = useSubmitDelivery();
  const { raiseDispute, isPending: stakePending, isSuccess: stakeSuccess, error: stakeError } = useRaiseDispute();
  const { submitArgument, isPending: argPending, isSuccess: argSuccess, error: argError } = useSubmitArgument();
  const { judgeDispute, isPending: judgePending, isSuccess: judgeSuccess, error: judgeError } = useJudgeDispute();
  const { closeJob, isPending: closePending, isSuccess: closeSuccess, error: closeError } = useCloseJob();
  const { retryJob, isPending: retryPending, isSuccess: retrySuccess, error: retryError } = useRetryJob();

  // Transaction error handling, console logging and toasting
  useEffect(() => {
    if (deliverError) {
      console.error("Submit delivery failed:", deliverError);
      toast.error("Failed to submit delivery", { description: deliverError.message });
    }
  }, [deliverError]);

  useEffect(() => {
    if (approveError) {
      console.error("Approve delivery failed:", approveError);
      toast.error("Failed to approve delivery", { description: approveError.message });
    }
  }, [approveError]);

  useEffect(() => {
    if (stakeError) {
      console.error("Stake dispute fee failed:", stakeError);
      toast.error("Failed to stake dispute fee", { description: stakeError.message });
    }
  }, [stakeError]);

  useEffect(() => {
    if (argError) {
      console.error("Submit argument failed:", argError);
      toast.error("Failed to submit argument", { description: argError.message });
    }
  }, [argError]);

  useEffect(() => {
    if (judgeError) {
      console.error("AI adjudication request failed:", judgeError);
      toast.error("Failed to request AI adjudication", { description: judgeError.message });
    }
  }, [judgeError]);

  useEffect(() => {
    if (closeError) {
      console.error("Close job failed:", closeError);
      toast.error("Failed to close and refund job", { description: closeError.message });
    }
  }, [closeError]);

  useEffect(() => {
    if (retryError) {
      console.error("Retry job failed:", retryError);
      toast.error("Failed to retry job", { description: retryError.message });
    }
  }, [retryError]);

  const userAddress = address?.toLowerCase();
  const isClient = userAddress === job.client.toLowerCase();
  const isFreelancer = userAddress === job.freelancer.toLowerCase();

  // Individual transaction outcome notifications via Sonner
  useEffect(() => {
    if (deliverSuccess) {
      toast.success("Delivery submitted successfully!", {
        description: "The client will now review your work.",
      });
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
        description:
          "Your testimony is submitted to the AI consensus arbitrator.",
      });
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

  const [argumentHistory, setArgumentHistory] = useState<ArgumentHistoryItem[]>([]);

  // Synchronize and persist past dispute round arguments in localStorage
  useEffect(() => {
    if (!jobId || !job.client || job.client === "0x0000000000000000000000000000000000000000") return;
    
    const cacheKey = `abita_job_${jobId.toString()}_history`;
    const cached = localStorage.getItem(cacheKey);
    const history: ArgumentHistoryItem[] = cached ? JSON.parse(cached) : [];

    const currentRound = job.disputeCount || 1;
    let updated = false;

    if (job.clientArgument && job.clientArgument.trim() !== "") {
      const exists = history.some(
        (h) => h.sender === "client" && h.text === job.clientArgument && h.round === currentRound
      );
      if (!exists) {
        history.push({ sender: "client", text: job.clientArgument, round: currentRound });
        updated = true;
      }
    }

    if (job.freelancerArgument && job.freelancerArgument.trim() !== "") {
      const exists = history.some(
        (h) => h.sender === "freelancer" && h.text === job.freelancerArgument && h.round === currentRound
      );
      if (!exists) {
        history.push({ sender: "freelancer", text: job.freelancerArgument, round: currentRound });
        updated = true;
      }
    }

    if (updated) {
      localStorage.setItem(cacheKey, JSON.stringify(history));
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setArgumentHistory(history);
  }, [job.clientArgument, job.freelancerArgument, jobId, job.disputeCount, job.client]);

  // Show full-page loader only if we are loading and don't have contract data yet
  const showSpinner = dataLoading && !contractJob;

  if (showSpinner || !job) {
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
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity duration-300">
            <img src="/logo_text.png" alt="Abita Logo" className="h-16 w-auto" />
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-mono text-muted hidden sm:inline">Job #{params.id}</span>
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-sm text-muted hover:text-primary transition-all duration-300 border border-border bg-card px-3 py-1.5 rounded-lg shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </div>
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
              <span className="text-[10px] uppercase text-muted tracking-wider block font-semibold">
                Client wallet
              </span>
              <span className="font-mono text-sm text-foreground break-all">
                {job.client}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted tracking-wider block font-semibold">
                Freelancer wallet
              </span>
              <span className="font-mono text-sm text-foreground break-all">
                {job.freelancer}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-t border-b border-border">
            <div>
              <span className="text-[10px] uppercase text-muted tracking-wider block font-semibold">
                Locked Escrow Payment
              </span>
              <span className="text-2xl font-bold text-foreground">
                {formatEther(job.escrowAmount)} STT
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted tracking-wider block font-semibold">
                Consecutive Freelancer Wins
              </span>
              <span className="text-2xl font-bold text-primary">
                {job.freelancerWinStreak} of 2
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-[10px] uppercase text-muted tracking-wider block font-semibold">
                Job Requirements
              </span>
              <p className="mt-2 text-sm text-foreground leading-relaxed bg-background border border-border rounded-lg p-4 font-sans whitespace-pre-wrap">
                {job.requirements}
              </p>
            </div>

            {job.deliveryNote && job.deliveryNote.trim() !== "" && (
              <div className="pt-6 border-t border-border">
                <span className="text-[10px] uppercase text-muted tracking-wider block font-semibold">
                  Freelancer&apos;s Delivery Response / Proof
                </span>
                <p className="mt-2 text-sm text-foreground leading-relaxed bg-background border border-border rounded-lg p-4 font-sans whitespace-pre-wrap">
                  {job.deliveryNote}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel based on state and role */}
        {!isConnected ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center bg-card shadow-sm">
            <Wallet className="h-6 w-6 text-muted mx-auto animate-pulse" />
            <span className="mt-3 block text-sm text-muted">
              Wallet disconnected. Connect your wallet to proceed with actions.
            </span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Open State - Freelancer Submits Delivery */}
            {job.status === 0 && isFreelancer && (
              <DeliveryForm
                onSubmit={(note) => submitDelivery(jobId, note)}
                isPending={deliverPending}
              />
            )}

            {/* 2 & 3. Delivered State / Dispute Staking Pipeline */}
            <DisputeFlow
              status={job.status}
              isClient={isClient}
              isFreelancer={isFreelancer}
              clientDisputeStaked={job.clientDisputeStaked}
              freelancerDisputeStaked={job.freelancerDisputeStaked}
              onApprove={() => approveDelivery(jobId)}
              onRaiseDispute={() => raiseDispute(jobId)}
              approvePending={approvePending}
              stakePending={stakePending}
            />

            {/* 4. Dispute Testimony & Chat History Timeline */}
            <DisputeArguments
              clientArgument={job.clientArgument}
              freelancerArgument={job.freelancerArgument}
              isClient={isClient}
              isFreelancer={isFreelancer}
              onSubmitArgument={(arg) => submitArgument(jobId, arg)}
              onJudgeDispute={() => judgeDispute(jobId)}
              argPending={argPending}
              judgePending={judgePending}
              history={argumentHistory}
              status={job.status}
            />

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
                      Awaiting Client&apos;s Decision
                    </h3>
                    <p className="text-xs text-muted max-w-sm mx-auto">
                      The AI arbitrator ruled in favour of the client. The
                      client is currently deciding whether to terminate and
                      refund, or request changes (retry).
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
