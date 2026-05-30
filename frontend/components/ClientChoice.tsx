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
 * Combines Fraunces headings, responsive card grids, and spring physics slide-in transitions.
 */
export default function ClientChoice({ onClose, onRetry, isPending }: ClientChoiceProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className="rounded-2xl border border-[#1E2436] bg-[#12151F] p-8"
    >
      <h3 className="font-serif text-2xl tracking-tight text-[#F0F2FF]" style={{ fontFamily: "'Fraunces', serif" }}>
        Arbitration Complete — Verdict for Client
      </h3>
      <p className="mt-2 text-sm text-[#6B7280]">
        The AI arbitrator has ruled in your favor. As the client, you must now select how to settle the escrow.
        This is a normal round dispute (1 to 4), meaning you can terminate the contract or request corrections.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Option A: Close & Refund */}
        <motion.button
          disabled={isPending}
          whileHover={{ scale: 1.02, borderColor: "#EF4444" }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="flex flex-col text-left rounded-xl border border-[#1E2436] bg-[#0A0C14] p-6 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5 disabled:opacity-50 cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-between rounded-full bg-[#EF4444]/10 text-[#EF4444]">
            <span className="mx-auto font-mono text-sm font-bold">A</span>
          </div>
          <span className="mt-4 font-serif text-lg font-semibold text-[#F0F2FF]" style={{ fontFamily: "'Fraunces', serif" }}>
            Close & Refund Escrow
          </span>
          <span className="mt-2 text-xs text-[#6B7280]">
            Terminate this job. Settle the contract and retrieve 100% of your escrow payment. 
            This action is final and payouts are executed instantly on-chain.
          </span>
        </motion.button>

        {/* Option B: Retry / Re-deliver */}
        <motion.button
          disabled={isPending}
          whileHover={{ scale: 1.02, borderColor: "#D4A017" }}
          whileTap={{ scale: 0.98 }}
          onClick={onRetry}
          className="flex flex-col text-left rounded-xl border border-[#1E2436] bg-[#0A0C14] p-6 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/5 disabled:opacity-50 cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-between rounded-full bg-[#D4A017]/10 text-[#D4A017]">
            <span className="mx-auto font-mono text-sm font-bold">B</span>
          </div>
          <span className="mt-4 font-serif text-lg font-semibold text-[#F0F2FF]" style={{ fontFamily: "'Fraunces', serif" }}>
            Request Corrections (Retry)
          </span>
          <span className="mt-2 text-xs text-[#6B7280]">
            Keep the escrow locked and allow the freelancer to submit a new delivery. The freelancer must address the 
            arbitrator's observations to claim payment.
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
