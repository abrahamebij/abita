"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { User } from "lucide-react";
import { formatEther } from "viem";

interface ClientJobCardProps {
  job: {
    id: number;
    client: string;
    freelancer: string;
    escrowAmount: bigint;
    requirements: string;
    status: number;
    disputeCount: number;
  };
  statusInfo: {
    label: string;
    color: string;
  };
  index: number;
}

export default function ClientJobCard({ job, statusInfo, index }: ClientJobCardProps) {
  const isClosed = job.status === 4;

  return (
    <Link href={`/job/${job.id}`} className="block">
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
        className={`rounded-2xl border border-border bg-card p-6 flex flex-col justify-between relative overflow-hidden h-full ${
          isClosed
            ? "shadow-sm opacity-75"
            : "hover:border-primary/45 hover:shadow-md transition-all duration-300 cursor-pointer group"
        }`}
      >
        {/* Decorative top border highlight */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${isClosed ? "bg-muted" : "bg-primary/80"}`} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted font-semibold">Client Portal • Job #{job.id}</span>
            <span className={`rounded-full border px-3 py-0.5 text-xs font-bold font-mono tracking-wide ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          <h3 className={`text-lg font-bold tracking-tight text-foreground transition-colors duration-300 leading-snug line-clamp-3 ${
            isClosed ? "" : "group-hover:text-primary"
          }`}>
            {job.requirements}
          </h3>

          {/* Hired Freelancer Wallet address section */}
          <div className="flex items-center space-x-2 bg-background border border-border rounded-lg p-2.5">
            <User className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[9px] uppercase text-muted tracking-wider block font-bold">Hired Freelancer</span>
              <span className="font-mono text-xs text-foreground truncate block">
                {job.freelancer}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <span className="text-[10px] uppercase text-muted tracking-wider block font-bold">Staked Escrow</span>
              <span className="text-base font-extrabold text-foreground">
                {formatEther(job.escrowAmount)} STT
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted tracking-wider block font-bold">AI Disputes</span>
              <span className="font-mono text-xs font-bold text-foreground">
                {job.disputeCount} of 5
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
