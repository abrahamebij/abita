"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2, Check, Gavel } from "lucide-react";

interface DisputeFlowProps {
  status: number;
  isClient: boolean;
  isFreelancer: boolean;
  clientDisputeStaked: boolean;
  freelancerDisputeStaked: boolean;
  onApprove: () => void;
  onRaiseDispute: () => void;
  approvePending: boolean;
  stakePending: boolean;
}

/**
 * @notice DisputeFlow Component
 * Wraps escrow approvals, initial dispute staking actions, and the multi-party staking progress panel.
 */
export default function DisputeFlow({
  status,
  isClient,
  isFreelancer,
  clientDisputeStaked,
  freelancerDisputeStaked,
  onApprove,
  onRaiseDispute,
  approvePending,
  stakePending,
}: DisputeFlowProps) {
  
  // 1. Delivered State Actions - Client approves work or initially files a dispute
  const showClientActions = status === 1 && isClient;

  // 2. Active Double-Staking Pipeline Tracker (when at least one party has locked 1 STT but not both yet)
  const showStakingPipeline = 
    (status === 1 || status === 0) && 
    (clientDisputeStaked || freelancerDisputeStaked);

  return (
    <div className="space-y-6">
      {/* Client Approval vs Initial Dispute Stake Action Cards */}
      {showClientActions && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Escrow Release Approval Card */}
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
              onClick={onApprove}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-bold text-card hover:bg-primary-hover transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {approvePending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              <span>Approve & Release Funds</span>
            </motion.button>
          </div>

          {/* Initial Dispute Stake Card */}
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
              disabled={stakePending || clientDisputeStaked}
              onClick={onRaiseDispute}
              className="mt-6 flex w-full items-center justify-center rounded-xl border border-border bg-background hover:border-primary hover:text-primary py-3.5 text-sm font-bold text-foreground transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {stakePending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Gavel className="h-4 w-4 mr-2" />}
              <span>{clientDisputeStaked ? "Staked — Waiting for Freelancer" : "Stake 1 STT to Dispute"}</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Double Staking Pipeline Status Panel */}
      {showStakingPipeline && (
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
            <div className={`rounded-xl border p-4 ${clientDisputeStaked ? "border-primary/20 bg-primary-light text-primary font-semibold" : "border-border bg-background text-muted"}`}>
              Client Staked: {clientDisputeStaked ? "Yes" : "Awaiting"}
            </div>
            <div className={`rounded-xl border p-4 ${freelancerDisputeStaked ? "border-primary/20 bg-primary-light text-primary font-semibold" : "border-border bg-background text-muted"}`}>
              Freelancer Staked: {freelancerDisputeStaked ? "Yes" : "Awaiting"}
            </div>
          </div>

          {/* Trigger second party's staking write option (if wallet matches) */}
          {isFreelancer && !freelancerDisputeStaked && (
            <motion.button
              disabled={stakePending}
              onClick={onRaiseDispute}
              className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-bold text-card hover:bg-primary-hover transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {stakePending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Gavel className="h-4 w-4 mr-2" />}
              <span>Stake 1 STT & Enter Adjudication</span>
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
}
