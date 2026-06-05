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
  hasDelivery: boolean;
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
  hasDelivery,
  onApprove,
  onRaiseDispute,
  approvePending,
  stakePending,
}: DisputeFlowProps) {
  
  // Show client action panel when:
  //  a) status=1 (Delivered) — approve or dispute
  //  b) status=0 (Open) with a delivery note present — re-appeal dispute only (after freelancer single win)
  const showClientActions = isClient && (status === 1 || (status === 0 && hasDelivery));
  const isReAppeal = status === 0 && hasDelivery; // Open state after a previous verdict

  // 2. Active Double-Staking Pipeline Tracker (when at least one party has locked 1 STT but not both yet)
  const showStakingPipeline = 
    (status === 1 || status === 0) && 
    (clientDisputeStaked || freelancerDisputeStaked);

  return (
    <div className="space-y-6">
      {showClientActions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Escrow Release Approval */}
          {/* In Delivered (status=1): active. In re-appeal (status=0): disabled — freelancer must re-confirm first */}
          <div className="rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-foreground">
                Approve Delivery
              </h3>
              <p className="mt-2 text-xs text-muted">
                {isReAppeal
                  ? "The freelancer must re-confirm their delivery before you can approve payment."
                  : "Releases 100% of the escrow funds directly to the freelancer. This settles the agreement."}
              </p>
            </div>
            <motion.button
              disabled={approvePending || isReAppeal}
              onClick={onApprove}
              title={isReAppeal ? "Freelancer must re-confirm delivery first" : undefined}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-bold text-card hover:bg-primary-hover transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {approvePending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              <span>{isReAppeal ? "Awaiting Re-confirmation" : "Approve & Release Funds"}</span>
            </motion.button>
          </div>

          {/* Dispute / Re-appeal Deposit Card */}
          <div className="rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {isReAppeal ? "Re-appeal Dispute" : "File a Dispute"}
              </h3>
              <p className="mt-2 text-xs text-muted">
                {isReAppeal
                  ? "The AI previously ruled for the freelancer. Deposit 1 STT to escalate to another round of arbitration."
                  : "Disagree with the work? Deposit a 1 STT dispute fee. The freelancer must also deposit 1 STT to activate AI adjudication."}
              </p>
            </div>
            <motion.button
              disabled={stakePending || clientDisputeStaked}
              onClick={onRaiseDispute}
              className="mt-6 flex w-full items-center justify-center rounded-xl border border-border bg-background hover:border-primary hover:text-primary py-3.5 text-sm font-bold text-foreground transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {stakePending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Gavel className="h-4 w-4 mr-2" />}
              <span>{clientDisputeStaked ? "Deposited — Waiting for Freelancer" : "Deposit 1 STT to Dispute"}</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Double Depositing Pipeline Status Panel */}
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
            One party has initiated a dispute and locked 1 STT. The other party must now also deposit 1 STT to proceed to AI arbitration.
          </p>
          <div className="grid grid-cols-2 gap-4 text-center py-4">
            <div className={`rounded-xl border p-4 ${clientDisputeStaked ? "border-primary/20 bg-primary-light text-primary font-semibold" : "border-border bg-background text-muted"}`}>
              Client Deposited: {clientDisputeStaked ? "Yes" : "Awaiting"}
            </div>
            <div className={`rounded-xl border p-4 ${freelancerDisputeStaked ? "border-primary/20 bg-primary-light text-primary font-semibold" : "border-border bg-background text-muted"}`}>
              Freelancer Deposited: {freelancerDisputeStaked ? "Yes" : "Awaiting"}
            </div>
          </div>

          {/* Trigger second party's depositing write option (if wallet matches) */}
          {isFreelancer && !freelancerDisputeStaked && (
            <motion.button
              disabled={stakePending}
              onClick={onRaiseDispute}
              className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-bold text-card hover:bg-primary-hover transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {stakePending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Gavel className="h-4 w-4 mr-2" />}
              <span>Deposit 1 STT & Enter Adjudication</span>
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
}
