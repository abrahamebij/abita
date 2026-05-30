"use client";

import React, { useState, useEffect, useRef } from "react";
import { WagmiProvider, useAccount } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { config } from "../lib/config";

/**
 * @notice AuthGuard Component
 * Centralized Route Guard wrapper that secures all portal features (dashboard, post, job).
 * If a wallet is disconnected, it blocks access and redirects to the landing page instantly.
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, status, address } = useAccount();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const prevConnectedRef = useRef(isConnected);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Monitor connection states and execute dynamic redirection
  useEffect(() => {
    if (mounted && status !== "connecting" && status !== "reconnecting") {
      const isProtectedRoute = pathname !== "/";
      if (isProtectedRoute && !isConnected) {
        router.push("/");
      }
    }
  }, [mounted, isConnected, status, pathname, router]);

  // Centralized single connection toast notification
  useEffect(() => {
    if (mounted && isConnected && !prevConnectedRef.current && address) {
      toast.success("Wallet connected successfully!", {
        description: `Active Account: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    }
    if (mounted) {
      prevConnectedRef.current = isConnected;
    }
  }, [mounted, isConnected, address]);

  // Show a neutral slate-loading state during hydration and state checks
  if (!mounted || status === "connecting" || status === "reconnecting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-8 w-8 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  // Prevent flash of protected layouts before Next.js redirect executes
  const isProtectedRoute = pathname !== "/";
  if (isProtectedRoute && !isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-8 w-8 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * @notice Providers Wrapper
 * Injects WAGMI wallet configurations, TanStack queries, and centralized authentication guards.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // cache for 1 minute
      },
    },
  }));

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AuthGuard>{children}</AuthGuard>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
