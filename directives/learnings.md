# Developer Learnings & Integration Insights

This document captures development notes, integration constraints, and architectural observations discovered during the Abita platform instantiation.

---

## 1. Somnia Agent Integration Insights

### Asynchronous Callback Design
- **Concept:** LLM inference is fundamentally non-deterministic and computationally slow compared to Ethereum block times. Somnia resolves this using a decentralized subcommittee of validators who execute the request off-chain and reach consensus before triggering a callback.
- **Learning:** Smart contracts must be designed to handle this asynchronously. State transitions are split: `judgeDispute` moves the job into a pending adjudication state and maps the `requestId` to the job, while `handleResponse` performs final settlements once the validators callback.

### String-to-Address Conversion in Solidity
- **Observation:** Converting the string output of the LLM back into an Ethereum `address` object on-chain is computationally expensive and error-prone because it requires parsing hexadecimal ASCII characters.
- **Solution:** Since the AI is constrained by `allowedValues` to only return the client's or the freelancer's lowercase address string, we can short-circuit the conversion. We simply format both parties' addresses using Ethers/Solidity into lowercase hex formats and compare them directly using `keccak256`. This reduces gas usage and guarantees safety.

---

## 2. Hardhat configuration & TypeScript Integration

### TypeScript Support
- **Learning:** Hardhat supports TypeScript natively. Using `.ts` extensions for configuration and automation scripts (`hardhat.config.ts`, `deploy.ts`, `test-flow.ts`, and `get-fee.ts`) enables absolute type safety, autocomplete, and robust code verification.
- **Tip:** Ensure `tsconfig.json` is correctly set up with `esModuleInterop: true` and includes the contracts and scripts directory.

---

## 3. Frontend Hydration & Offline Trap Fixes

### Route Hydration Timing
- **Observation:** Next.js dynamic parameters (`params.id`) might be `undefined` during server-side rendering or the first frame of client-side hydration. Calling `BigInt(params.id)` throws an unhandled `TypeError` immediately, crashing the component rendering tree.
- **Solution:** Wrap the parameter parsing in a safe typecheck:
  ```typescript
  const idStr = typeof params?.id === "string" ? params.id : "";
  const jobId = idStr ? BigInt(idStr) : 0n;
  ```

### Smart Full-Page Loading Fallbacks
- **Observation:** Relying on Wagmi's `isLoading` to display a full-screen spinner blocks offline presentation. This happens because query execution retries multiple times when the contract address is empty or when the developer is offline.
- **Solution:** Short-circuit the full-screen spinner if local mock data is already defined for the active ID (`isMock = idStr && MOCK_JOBS[idStr]`). Only show the full-screen spinner if the query is loading AND there is absolutely no mock or cached job data available. This ensures instant offline loading and premium rendering.

### Rule of Hooks (Conditional Invocations)
- **Observation:** Conditional hook invocations, like `const isClient = job ? useAccount().address : false`, violate the core React Rule of Hooks and cause severe runtime rendering failures.
- **Solution:** Unconditionally retrieve variables (`const { address } = useAccount()`) at the top level of the component, and execute evaluation comparisons inside standard conditional variables (`const isClient = job && address ? ... : false`).
