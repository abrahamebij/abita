"use client";

import React from "react";
import { motion } from "framer-motion";

interface ClientChoiceProps {
  onClose: () => void;
  onRetry: () => void;
  isPending: boolean;
}

/**
 * @notice ClientChoice Component
 * Displays the post-adjudication options available to the client after winning a normal round (1-4).
 * Configured in a clean light slate theme with blue and neutral elements.
 */
export default function ClientChoice({ onClose, onRetry, isPending }: ClientChoiceProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className="rounded-2xl border border-border bg-card p-8 shadow-sm"
    >
      <h3 className="text-2xl tracking-tight text-foreground font-bold">
        Arbitration Complete — Verdict for Client
      </h3>
      <p className="mt-2 text-sm text-muted">
        The AI arbitrator has ruled in your favor. As the client, you must now select how to settle the escrow.
        This is a normal round dispute (1 to 4), meaning you can terminate the contract or request corrections.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Option A: Close & Refund */}
        <motion.button
          disabled={isPending}
          onClick={onClose}
          className="flex flex-col text-left rounded-xl border border-border bg-background p-6 transition-all duration-300 hover:border-primary hover:shadow-md cursor-pointer disabled:opacity-50"
        >
          <div className="flex h-8 w-8 items-center justify-between rounded-full bg-primary/10 text-primary">
            <span className="mx-auto font-mono text-sm font-bold">A</span>
          </div>
          <span className="mt-4 text-lg font-semibold text-foreground">
            Close & Refund Escrow
          </span>
          <span className="mt-2 text-xs text-muted">
            Terminate this job. Settle the contract and retrieve 100% of your escrow payment. 
            This action is final and payouts are executed instantly on-chain.
          </span>
        </motion.button>

        {/* Option B: Retry / Re-deliver */}
        <motion.button
          disabled={isPending}
          onClick={onRetry}
          className="flex flex-col text-left rounded-xl border border-border bg-background p-6 transition-all duration-300 hover:border-primary hover:shadow-md cursor-pointer disabled:opacity-50"
        >
          <div className="flex h-8 w-8 items-center justify-between rounded-full bg-primary/10 text-primary">
            <span className="mx-auto font-mono text-sm font-bold">B</span>
          </div>
          <span className="mt-4 text-lg font-semibold text-foreground">
            Request Corrections (Retry)
          </span>
          <span className="mt-2 text-xs text-muted">
            Keep the escrow locked and allow the freelancer to submit a new delivery. The freelancer must address the 
            arbitrator&apos;s observations to claim payment.
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
