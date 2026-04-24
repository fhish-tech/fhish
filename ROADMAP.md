# FHISH V2 ROADMAP

**Fully Independent FHE Infrastructure - No External Dependencies**

---

## Phase 1: V2 Baseline (Q2 2026) - CURRENT ✅ IN PROGRESS

### Milestone 1.1: Independent WASM ✅
- [x] Build fhish-wasm from tfhe-rs source
- [x] Implement shortint types (~2-4KB ciphertexts)
- [x] Browser WASM target (RainbowKit integration)
- [x] Node.js WASM target (gateway)
- [x] Build process: `wasm-pack build`

### Milestone 1.2: SDK ✅
- [x] fhish-sdk-v2 TypeScript package
- [x] Browser-based encryption
- [x] RainbowKit/wagmi wallet integration
- [x] Public key fetching from gateway
- [x] Vote encryption support

### Milestone 1.3: Gateway ✅
- [x] Self-hosted decryption gateway
- [x] Node.js WASM integration
- [x] Key generation
- [x] Health/readiness endpoints
- [x] Prometheus metrics
- [ ] **IN PROGRESS**: Fix WASM memory issue

### Milestone 1.4: Demo 🔄
- [x] VoteButton component (encrypted voting)
- [x] RevealButton component (decryption)
- [x] RainbowKit wallet connection
- [ ] **IN PROGRESS**: End-to-end testing
- [ ] Sepolia deployment

### Milestone 1.5: Documentation ✅
- [x] README.md (updated)
- [x] SPEC.md (independent architecture)
- [x] ARCHITECTURE.md (WASM-based)
- [x] PLAN.md (completed steps)
- [x] ROADMAP.md (this file)

---

## Phase 2: V2 Completion (Q2-Q3 2026)

### Contract Layer
- [ ] Deploy FhishCoprocessor to Sepolia
- [ ] PrivateVoting contract verification
- [ ] On-chain vote tallying
- [ ] Decryption request handling

### SDK Enhancements
- [ ] Multi-vote batching
- [ ] Vote cancellation support
- [ ] Vote delegation support
- [ ] Comprehensive error handling

### Gateway Enhancements
- [ ] Multiple key support (key rotation)
- [ ] Rate limiting
- [ ] Request authentication (ECDSA)
- [ ] Docker production image
- [ ] Kubernetes deployment manifests

---

## Phase 3: Multi-Chain Support (Q3-Q4 2026)

### Chain Compatibility
- [ ] Arbitrum One
- [ ] Base (Coinbase L2)
- [ ] Optimism
- [ ] Conflux eSpace
- [ ] zkSync Era

### Cross-Chain Features
- [ ] Unified SDK for all chains
- [ ] Bridge-compatible voting
- [ ] Cross-chain result aggregation

---

## Phase 4: FHE Type Expansion (Q4 2026)

### Additional Types
- [ ] `FhisUint8` - 1-byte integers (~4KB ciphertext)
- [ ] `FhisUint16` - 2-byte integers (~8KB ciphertext)
- [ ] `FhisUint32` - 4-byte integers (~16KB ciphertext)
- [ ] `FhisBool` - Boolean (~2KB ciphertext)

### Advanced Operations
- [ ] Comparison operators (lt, gt, eq)
- [ ] Bitwise operations
- [ ] Conditional execution (mux)
- [ ] Threshold decryption

---

## Phase 5: Decentralized Relayer Network (2027+)

### Multi-Relayer Setup
- [ ] Multiple independent gateways
- [ ] Threshold decryption (t-of-n)
- [ ] Gateway discovery protocol
- [ ] Gateway load balancing

### Trustless Relayers
- [ ] Stake-based relayer network
- [ ] Slashing for malicious behavior
- [ ] Reputation system
- [ ] ZK proofs for relayer honesty

---

## Phase 6: Ecosystem & Tools (2027+)

### Developer Tools
- [ ] VSCode extension (FHE Solidity support)
- [ ] Hardhat plugin (@fhish/hardhat)
- [ ] Foundry integration
- [ ] Remix plugin

### Infrastructure
- [ ] FHISH Explorer (encrypted tx viewer)
- [ ] Gateway monitoring dashboard
- [ ] SDK analytics
- [ ] Voting verification tools

### Applications
- [ ] Private NFT auctions
- [ ] Blind auctions
- [ ] Private DeFi governance
- [ ] Anonymous credentials
- [ ] Sealed-bid contracts

---

## Completed Features

### ✅ Core
- Shortint FHE types (~2-4KB ciphertexts)
- Browser WASM encryption (RainbowKit)
- Self-hosted gateway (Node.js WASM)
- Vote encryption/decryption
- Homomorphic addition (vote tallying)

### ✅ Infrastructure
- tfhe-rs reference source (_references/zama/tfhe-rs/)
- Custom WASM build (packages/fhish-wasm/)
- TypeScript SDK (packages/fhish-sdk-v2/)
- Demo application (fhish-demo/)

### ✅ Documentation
- Technical specification (SPEC.md)
- Architecture documentation (ARCHITECTURE.md)
- Build plan (PLAN.md)
- Roadmap (ROADMAP.md)

---

## Dependencies

**ZERO external FHE dependencies.**

We reference tfhe-rs source in `_references/zama/tfhe-rs/` but build our own WASM from scratch.

### What We Use
- tfhe-rs source (reference only, git submodule)
- wasm-pack (for building WASM)
- Rust toolchain
- Node.js 20+
- RainbowKit + wagmi (wallet)

### What We DON'T Use
- ❌ `tfhe` npm package
- ❌ `node-tfhe` package
- ❌ `fhevmjs`
- ❌ Zama hosted services
- ❌ Fhenix SDK or services

---

## Version History

| Version | Date | Status |
|---------|------|--------|
| v2.0.0-alpha | Apr 2026 | In Development |
| v1.x | 2024 | Zama-based (deprecated) |
