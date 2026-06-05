"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface DisputeProgressProps {
  /** Number of fully resolved dispute rounds (= job.disputeCount on-chain) */
  completedCount: number;
  /** True when a dispute round is currently in progress (staking or Disputed status) */
  isDisputeActive: boolean;
}

/**
 * @notice DisputeProgress Component
 * Pip tracker representing the 5-dispute hard escalation limit defined in Abita Core.
 * Completed steps show a checkmark. The active step pulses. Future slots are greyed.
 */
export default function DisputeProgress({ completedCount, isDisputeActive }: DisputeProgressProps) {
  const totalSteps = 5;

  // Which pip number is currently being processed (1-based). Null if none active.
  const activeStep = isDisputeActive ? Math.min(completedCount + 1, 5) : null;

  // Fill bar covers all completed steps plus the active one (if any)
  const fillUpTo = isDisputeActive ? Math.min(completedCount + 1, 5) : completedCount;
  const fillPercent = fillUpTo > 0 ? ((fillUpTo - 1) / (totalSteps - 1)) * 100 : 0;

  // Label for the header badge
  const label =
    completedCount === 0 && !isDisputeActive
      ? "No Active Dispute"
      : isDisputeActive
        ? `Dispute ${activeStep} of ${totalSteps} — In Progress`
        : `Dispute ${completedCount} of ${totalSteps} — Resolved`;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-lg text-foreground font-bold">
          Escalation Pipeline
        </span>
        <span className="font-mono text-xs text-muted">{label}</span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative mt-6 flex items-center justify-between">
        {/* Track Line */}
        <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-border" />

        {/* Active Fill Line */}
        <motion.div
          className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.5 }}
        />

        {/* Render Steps */}
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum = index + 1;
          const isDone = stepNum <= completedCount;
          const isActive = stepNum === activeStep;

          let pipClass = "bg-background border-border text-muted"; // future
          if (isDone) pipClass = "bg-primary border-primary text-card";        // completed
          else if (isActive) pipClass = "bg-card border-primary border-2 text-primary"; // active

          return (
            <div key={index} className="relative z-10 flex flex-col items-center">
              <motion.div
                animate={
                  isActive
                    ? { scale: [1.2, 1.35, 1.2] }
                    : isDone
                      ? { scale: 1 }
                      : {}
                }
                transition={isActive ? { repeat: Infinity, duration: 2 } : {}}
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-mono font-bold transition-all duration-300 ${pipClass}`}
              >
                {isDone ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <span>{stepNum}</span>
                )}
              </motion.div>
              <span
                className={`mt-2 font-mono text-[10px] uppercase tracking-wider ${
                  isActive ? "text-primary font-semibold" : isDone ? "text-primary" : "text-muted"
                }`}
              >
                {stepNum === 5 ? "Final" : `R${stepNum}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
