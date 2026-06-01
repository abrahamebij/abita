"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { UserCheck } from "lucide-react";
import { formatEther } from "viem";

interface FreelancerJobCardProps {
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

export default function FreelancerJobCard({ job, statusInfo, index }: FreelancerJobCardProps) {
  return (
    <Link href={`/job/${job.id}`} className="block">
      <motion.div
        layout
        whileHover={{ scale: 1.015, y: -2 }}
        whileTap={{ scale: 0.985 }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
        className="rounded-2xl border border-border bg-card p-6 hover:border-foreground/30 transition-all duration-300 flex flex-col justify-between group hover:shadow-md shadow-sm relative overflow-hidden cursor-pointer h-full"
      >
        {/* Decorative top border highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted font-semibold">Freelancer Portal • Job #{job.id}</span>
            <span className={`rounded-full border px-3 py-0.5 text-xs font-bold font-mono tracking-wide ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 leading-snug line-clamp-3">
            {job.requirements}
          </h3>

          {/* Hiring Client Wallet address section */}
          <div className="flex items-center space-x-2 bg-background border border-border rounded-lg p-2.5">
            <UserCheck className="h-4 w-4 text-muted shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[9px] uppercase text-muted tracking-wider block font-bold">Hiring Client</span>
              <span className="font-mono text-xs text-foreground truncate block">
                {job.client}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <span className="text-[10px] uppercase text-muted tracking-wider block font-bold">Contract Escrow</span>
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
