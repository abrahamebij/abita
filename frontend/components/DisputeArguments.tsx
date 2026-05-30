"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Gavel } from "lucide-react";

interface DisputeArgumentsProps {
  clientArgument: string;
  freelancerArgument: string;
  isClient: boolean;
  isFreelancer: boolean;
  onSubmitArgument: (argument: string) => void;
  onJudgeDispute: () => void;
  argPending: boolean;
  judgePending: boolean;
}

/**
 * @notice DisputeArguments Component
 * Handles testimonial entry forms for Client / Freelancer and the final adjudication gavel trigger.
 */
export default function DisputeArguments({
  clientArgument,
  freelancerArgument,
  isClient,
  isFreelancer,
  onSubmitArgument,
  onJudgeDispute,
  argPending,
  judgePending,
}: DisputeArgumentsProps) {
  const [argumentText, setArgumentText] = useState("");

  const handleSubmit = () => {
    if (argumentText.trim().length >= 5) {
      onSubmitArgument(argumentText);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-8 space-y-6 shadow-sm"
    >
      <h3 className="text-xl font-bold text-foreground">
        Dispute Arguments & Evidence
      </h3>
      
      {/* 1. Read-Only testimony summaries */}
      <div className="space-y-4">
        {clientArgument && (
          <div className="rounded-lg border border-border bg-background p-4">
            <span className="text-[10px] uppercase text-muted font-semibold block">Client's Argument</span>
            <p className="mt-1 text-sm text-foreground">{clientArgument}</p>
          </div>
        )}
        {freelancerArgument && (
          <div className="rounded-lg border border-border bg-background p-4">
            <span className="text-[10px] uppercase text-muted font-semibold block">Freelancer's Argument</span>
            <p className="mt-1 text-sm text-foreground">{freelancerArgument}</p>
          </div>
        )}
      </div>

      {/* 2. Client testimony input form (if not already recorded) */}
      {isClient && !clientArgument && (
        <div className="space-y-3">
          <label className="text-xs uppercase text-muted font-semibold block">Submit Client Argument</label>
          <textarea
            disabled={argPending}
            placeholder="Outline why this delivery does not meet your specifications..."
            value={argumentText}
            onChange={(e) => setArgumentText(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-all duration-300"
          />
          <motion.button
            disabled={argPending || argumentText.trim().length < 5}
            onClick={handleSubmit}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-card hover:bg-primary-hover transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {argPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            <span>Submit Client Argument</span>
          </motion.button>
        </div>
      )}

      {/* 3. Freelancer testimony input form (if not already recorded) */}
      {isFreelancer && !freelancerArgument && (
        <div className="space-y-3">
          <label className="text-xs uppercase text-muted font-semibold block">Submit Freelancer Argument</label>
          <textarea
            disabled={argPending}
            placeholder="Outline why your delivery fulfills the contract requirements..."
            value={argumentText}
            onChange={(e) => setArgumentText(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-all duration-300"
          />
          <motion.button
            disabled={argPending || argumentText.trim().length < 5}
            onClick={handleSubmit}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-card hover:bg-primary-hover transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {argPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            <span>Submit Freelancer Argument</span>
          </motion.button>
        </div>
      )}

      {/* 4. Final Adjudication trigger button (visible to anyone once both testimonies are locked) */}
      {clientArgument && freelancerArgument && (
        <div className="pt-4 border-t border-border">
          <motion.button
            disabled={judgePending}
            onClick={onJudgeDispute}
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
  );
}
