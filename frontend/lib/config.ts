import { http, createConfig } from "wagmi";
import { defineChain } from "viem";

// Define the Somnia Testnet chain configuration using Viem
export const somniaTestnet = defineChain({
  id: 50312,
  name: "Somnia Testnet",
  nativeCurrency: {
    name: "Somnia Token",
    symbol: "STT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://dream-rpc.somnia.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Shannon Explorer",
      url: "https://shannon-explorer.somnia.network",
    },
  },
});

// Configure wagmi Config
export const config = createConfig({
  chains: [somniaTestnet],
  transports: {
    [somniaTestnet.id]: http(),
  },
});

// Contract deployment address of AbiCore.sol (Abraham: replace with deployed address!)
export const ABICORE_CONTRACT_ADDRESS = "0x0654943E0c6B9184620f1da0cfD62Ba3A386ddC8";

// Somnia Agent Platform contract — used to query the required fee before judging
export const SOMNIA_PLATFORM_ADDRESS = "0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776";

// Minimal ABI for reading getRequestDeposit() from the Somnia Agent Platform
export const SOMNIA_PLATFORM_ABI = [
  {
    name: "getRequestDeposit",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
