"use client";

import React, { useEffect } from "react";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MOCK_JOBS: Record<string, any> = {
  "1": {
    client: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    freelancer: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    escrowAmount: 5000000000000000000n, // 5 STT
    requirements: "Design a minimal blue logo. No gradients.",
    deliveryNote: "Completed wordmark with solid blue palette. Figma link: figma.com/logo",
    clientArgument: "Uses gradients, not the minimal style I specified.",
    freelancerArgument: "Brief said blue palette which I followed exactly. Minimal is subjective.",
    status: 2, // Disputed
    disputeCount: 1,
    freelancerWinStreak: 0,
    lastVerdictWinner: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    pendingRequestId: 123n,
    clientDisputeStaked: true,
    freelancerDisputeStaked: true,
  },
  "2": {
    client: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    freelancer: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    escrowAmount: 12000000000000000000n, // 12 STT
    requirements: "Write full-stack Next.js contract interface wrapper.",
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
  }
};

const STATUS_LABELS = ["Open", "Delivered", "Disputed", "Pending Client Choice", "Closed"];

export default function JobDetail() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  
  const idStr = typeof params?.id === "string" ? params.id : "";
  const jobId = idStr ? BigInt(idStr) : 0n;

  // Polls automatically every 5s if status is Disputed (2)
  const { job: contractJob, refetch, isLoading: dataLoading } = useJobData(jobId);

  // Fallback to mock job if contract read is offline/empty
  const job = contractJob || (idStr ? MOCK_JOBS[idStr] : undefined) || {
    client: address || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    freelancer: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    escrowAmount: 10000000000000000000n, // 10 STT
    requirements: "Design a responsive interface mock layout.",
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
  const { approveDelivery, isPending: approvePending, isSuccess: approveSuccess } = useApproveDelivery();
  const { submitDelivery, isPending: deliverPending, isSuccess: deliverSuccess } = useSubmitDelivery();
  const { raiseDispute, isPending: stakePending, isSuccess: stakeSuccess } = useRaiseDispute();
  const { submitArgument, isPending: argPending, isSuccess: argSuccess } = useSubmitArgument();
  const { judgeDispute, isPending: judgePending, isSuccess: judgeSuccess } = useJudgeDispute();
  const { closeJob, isPending: closePending, isSuccess: closeSuccess } = useCloseJob();
  const { retryJob, isPending: retryPending, isSuccess: retrySuccess } = useRetryJob();

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

  // Show full-page loader only if we are loading AND don't have cached/mock data
  const isMock = idStr && MOCK_JOBS[idStr];
  const showSpinner = dataLoading && !contractJob && !isMock;

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

          <div>
            <span className="text-[10px] uppercase text-muted tracking-wider block font-semibold">
              Job Requirements
            </span>
            <p className="mt-2 text-sm text-foreground leading-relaxed bg-background border border-border rounded-lg p-4 font-sans whitespace-pre-wrap">
              {job.requirements}
            </p>
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

            {/* 4. Disputed State - Submit Arguments */}
            {job.status === 2 && (
              <DisputeArguments
                clientArgument={job.clientArgument}
                freelancerArgument={job.freelancerArgument}
                isClient={isClient}
                isFreelancer={isFreelancer}
                onSubmitArgument={(arg) => submitArgument(jobId, arg)}
                onJudgeDispute={() => judgeDispute(jobId)}
                argPending={argPending}
                judgePending={judgePending}
              />
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
