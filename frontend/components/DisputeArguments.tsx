"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Loader2, Gavel, MessageSquare, Brain, ChevronRight } from "lucide-react";

interface DisputeArgumentsProps {
  clientArgument: string;
  freelancerArgument: string;
  isClient: boolean;
  isFreelancer: boolean;
  onSubmitArgument: (argument: string) => void;
  onJudgeDispute: () => void;
  argPending: boolean;
  judgePending: boolean;
  history: { sender: "client" | "freelancer"; text: string; round: number }[];
  status: number;
  pendingRequestId?: bigint;
  jobId?: bigint;
  disputeCount?: number;
}

export default function DisputeArguments({
  clientArgument,
  freelancerArgument,
  isClient,
  isFreelancer,
  onSubmitArgument,
  onJudgeDispute,
  argPending,
  judgePending,
  history,
  status,
  pendingRequestId = 0n,
  jobId = 0n,
  disputeCount = 0,
}: DisputeArgumentsProps) {
  const [argumentText, setArgumentText] = useState("");

  const handleSubmit = () => {
    if (argumentText.trim().length >= 5) onSubmitArgument(argumentText);
  };

  const isDisputed = status === 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-8 space-y-6 shadow-sm"
    >
      <div className="flex items-center space-x-2 pb-4 border-b border-border">
        <MessageSquare className="h-5 w-5 text-primary animate-pulse" />
        <h3 className="text-xl font-bold text-foreground">Dispute Testimony Chat History</h3>
      </div>
      
      {/* 1. Chat History timeline feed */}
      <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
        {history.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl bg-background text-sm text-muted">
            No testimonies submitted yet. Argument history will initialize once testimony is submitted.
          </div>
        ) : (
          history.map((msg, idx) => {
            const isMsgClient = msg.sender === "client";
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex flex-col ${isMsgClient ? "items-start" : "items-end"} space-y-1.5`}
              >
                <div className="flex items-center space-x-2 text-xs">
                  <span className={`font-bold uppercase tracking-wider ${isMsgClient ? "text-primary" : "text-muted"}`}>
                    {isMsgClient ? "Client" : "Freelancer"}
                  </span>
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">
                    Round {msg.round}
                  </span>
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                    isMsgClient
                      ? "rounded-tl-none border border-primary/20 bg-primary/5 text-foreground"
                      : "rounded-tr-none border border-border bg-background text-foreground"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* 2. Client testimony input form */}
      {isDisputed && isClient && !clientArgument && (
        <div className="space-y-3 pt-4 border-t border-border">
          <label className="text-xs uppercase text-muted font-bold block tracking-wide">Submit Client Testimony</label>
          <textarea
            disabled={argPending}
            placeholder="Outline why this delivery does not meet your specifications..."
            value={argumentText}
            onChange={(e) => setArgumentText(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-all duration-300 resize-none"
          />
          <motion.button
            disabled={argPending || argumentText.trim().length < 5}
            onClick={handleSubmit}
            className="flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-bold text-card hover:bg-primary-hover transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {argPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <span>Submit Testimony</span>
          </motion.button>
        </div>
      )}

      {/* 3. Freelancer testimony input form */}
      {isDisputed && isFreelancer && !freelancerArgument && (
        <div className="space-y-3 pt-4 border-t border-border">
          <label className="text-xs uppercase text-muted font-bold block tracking-wide">Submit Freelancer Testimony</label>
          <textarea
            disabled={argPending}
            placeholder="Outline why your delivery fulfills the contract requirements..."
            value={argumentText}
            onChange={(e) => setArgumentText(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-all duration-300 resize-none"
          />
          <motion.button
            disabled={argPending || argumentText.trim().length < 5}
            onClick={handleSubmit}
            className="flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-bold text-card hover:bg-primary-hover transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {argPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <span>Submit Testimony</span>
          </motion.button>
        </div>
      )}

      {/* 4. Final Adjudication trigger / Verdict Navigation button */}
      {isDisputed && (
        <div className="pt-4 border-t border-border">
          {pendingRequestId > 0n ? (
            <Link href={`/job/${jobId}/verdict`} className="w-full block">
              <motion.button
                className="flex w-full items-center justify-center rounded-xl bg-primary py-4 text-base font-bold text-card hover:bg-primary-hover transition-all duration-300 cursor-pointer shadow-md"
              >
                <Brain className="h-5 w-5 mr-2 animate-pulse" />
                <span>View AI Deliberation & Verdict</span>
                <ChevronRight className="h-5 w-5 ml-1" />
              </motion.button>
            </Link>
          ) : (
            clientArgument && freelancerArgument && (
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
            )
          )}
        </div>
      )}

      {/* 5. View AI Verdict for resolved disputes */}
      {(status === 3 || status === 4) && disputeCount > 0 && (
        <div className="pt-4 border-t border-border">
          <Link href={`/job/${jobId}/verdict`} className="w-full block">
            <motion.button
              className="flex w-full items-center justify-center rounded-xl bg-primary py-4 text-base font-bold text-card hover:bg-primary-hover transition-all duration-300 cursor-pointer shadow-md"
            >
              <Brain className="h-5 w-5 mr-2" />
              <span>View AI Verdict & Reasoning</span>
              <ChevronRight className="h-5 w-5 ml-1" />
            </motion.button>
          </Link>
        </div>
      )}
    </motion.div>
  );
}
