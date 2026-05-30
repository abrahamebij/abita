"use client";

import React from "react";
import { motion } from "framer-motion";

interface DisputeProgressProps {
  currentDispute: number; // 0 to 5 on-chain value
}

/**
 * @notice DisputeProgress Component
 * Pip tracker representing the 5-dispute hard escalation limit defined in Abita Core.
 * Resolved steps are locked Blue, current step is pulsing Blue, and future slots remain Border slate.
 */
export default function DisputeProgress({ currentDispute }: DisputeProgressProps) {
  const totalSteps = 5;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-lg text-foreground font-bold">
          Escalation Pipeline
        </span>
        <span className="font-mono text-xs text-muted">
          {currentDispute === 0 ? "Peaceful Escrow" : `Dispute ${currentDispute} of ${totalSteps}`}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative mt-6 flex items-center justify-between">
        {/* Track Line */}
        <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-border" />
        
        {/* Active Fill Line (Blue accent only) */}
        <motion.div 
          className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${currentDispute > 0 ? ((currentDispute - 1) / (totalSteps - 1)) * 100 : 0}%` }}
          transition={{ duration: 0.5 }}
        />

        {/* Render Steps */}
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum = index + 1;
          const isResolved = stepNum < currentDispute;
          const isActive = stepNum === currentDispute;

          let pipColor = "bg-background border-border";
          let scale = 1;

          if (isResolved) {
            pipColor = "bg-primary border-primary";
          } else if (isActive) {
            pipColor = "bg-card border-primary border-2";
            scale = 1.25;
          }

          return (
            <div key={index} className="relative z-10 flex flex-col items-center">
              <motion.div
                animate={isActive ? { scale: [1.2, 1.35, 1.2], borderColor: ["#2563EB", "#2563EB", "#2563EB"] } : {}}
                transition={isActive ? { repeat: Infinity, duration: 2 } : {}}
                className={`flex h-8 w-8 items-center justify-between rounded-full border text-xs font-mono font-bold transition-all duration-300 ${pipColor}`}
                style={{ scale }}
              >
                <span className={`mx-auto ${isResolved ? "text-card" : isActive ? "text-primary" : "text-muted"}`}>
                  {stepNum}
                </span>
              </motion.div>
              <span className={`mt-2 font-mono text-[10px] uppercase tracking-wider ${isActive ? "text-primary font-semibold" : "text-muted"}`}>
                {stepNum === 5 ? "Final" : `R${stepNum}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
