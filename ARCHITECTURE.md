# FHISH V2 ARCHITECTURE

**100% Independent FHE Stack - No External Dependencies**

## Overview

FHISH V2 consists of three independent layers, all built from tfhe-rs source code:

1. **Client Layer** - Browser-based WASM encryption
2. **Contract Layer** - On-chain FHE operations (EVM)
3. **Gateway Layer** - Self-hosted decryption server

```
┌────────────────────────────────────────────────────────────────────┐
│                         ARCHITECTURE                                │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐         ┌──────────────┐        ┌─────────────┐ │
│  │   BROWSER    │         │   ETHEREUM   │        │   GATEWAY   │ │
│  │              │         │   (Sepolia)   │        │  (Node.js)  │ │
│  │ ┌──────────┐ │         │ ┌──────────┐ │        │ ┌─────────┐ │ │
│  │ │RainbowKit│ │         │ │  Fhish   │ │        │ │ Express │ │ │
│  │ └────┬─────┘ │         │ │Coproces-│ │        │ └────┬────┘ │ │
│  │      │       │         │ │  sor     │ │        │      │      │ │
│  │      ▼       │         │ └────┬─────┘ │        │      ▼      │ │
│  │ ┌──────────┐ │ Encrypt  │      │        │        │ ┌─────────┐ │ │
│  │ │ FhishSDK │─┼──────────┼──────┼────────┼────────┼▶│ fhish- │ │ │
│  │ │   V2     │ │  Vote    │      │        │        │ │  wasm   │ │ │
│  │ └────┬─────┘ │         │      ▼        │        │ │ (Node) │ │ │
│  │      │       │         │ ┌──────────┐ │        │ └────┬────┘ │ │
│  │      ▼       │         │ │ Decrypt  │ │        │      │      │ │
│  │ ┌──────────┐ │         │ │ Request  │ │◀───────┼──────┘      │ │
│  │ │ fhish-   │ │         │ └────┬─────┘ │        │             │ │
│  │ │ wasm     │ │         │      │        │        │             │ │
│  │ │ (Web)    │ │         │      │ Result │        │             │ │
│  │ └──────────┘ │         │      ▼        │        │             │ │
│  └──────────────┘         │  Revealed     │        └─────────────┘ │
│                           └───────────────┘                         │
│                                                                     │
│  NO EXTERNAL SERVICES - ALL FHE COMPUTE IS SELF-HOSTED              │
└────────────────────────────────────────────────────────────────────┘
```

## Layer 1: Client SDK (`packages/fhish-sdk-v2/`)

### Technology
- **Runtime**: Browser (WebAssembly)
- **Language**: TypeScript
- **FHE Engine**: `fhish-wasm` (our custom WASM, NOT `tfhe` npm)
- **Wallet**: RainbowKit + wagmi (real wallet, not mock)

### Components

```
fhish-sdk-v2/
├── src/
│   ├── FhishClient.ts        # Main entry point
│   ├── EncryptionEngine.ts   # WASM wrapper
│   └── types.ts              # TypeScript types
└── dist/                     # Built output
```

### Key Responsibilities
1. Fetch public key from FHISH gateway
2. Initialize `fhish-wasm` in browser
3. Encrypt votes using shortint (Uint2)
4. Provide encrypted ciphertext to contract
5. Handle wallet signing with wagmi

### Independence
- ❌ Does NOT use `fhevmjs`
- ❌ Does NOT use `tfhe` npm
- ❌ Does NOT contact Zama services
- ✅ Uses our custom `fhish-wasm`

## Layer 2: Contract Layer (`packages/fhish-coprocessor/`)

### Technology
- **Chain**: Ethereum (Sepolia)
- **Language**: Solidity
- **Framework**: Hardhat

### Components

```
fhish-coprocessor/
├── contracts/
│   ├── FhishTFHE.sol         # FHE types (euint32, ebool, etc.)
│   ├── FhishCoprocessor.sol   # Decryption requests
│   └── PrivateVoting.sol     # Example: private voting
└── scripts/                   # Deployment
```

### Key Responsibilities
1. Store encrypted votes on-chain
2. Perform homomorphic operations (addition)
3. Emit decryption request events
4. Receive decrypted results from gateway

## Layer 3: Gateway (`fhish-gateway/`)

### Technology
- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **FHE Engine**: `fhish-wasm` (Node.js target, NOT `node-tfhe`)
- **HTTP**: Express 5

### Components

```
fhish-gateway/
├── src/
│   ├── server.ts             # Express server
│   └── types.ts              # Request/response types
├── keys/                      # Generated FHE keys
├── pkg/                       # fhish-wasm Node.js build
└── scripts/
    └── keygen.ts             # Key generation
```

### Key Responsibilities
1. Generate and store FHE keys (client key stays private)
2. Serve public key to SDK
3. Decrypt ciphertexts on authenticated request
4. Never expose client key

### Independence
- ❌ Does NOT use `node-tfhe`
- ❌ Does NOT use Zama gateway
- ✅ Uses our custom `fhish-wasm` (Node.js build)

## Data Flow

### Voting Flow
```
1. User connects wallet (RainbowKit)
           │
           ▼
2. SDK fetches public key from gateway
           │
           ▼
3. User clicks "Vote YES"
           │
           ▼
4. SDK encrypts (YES=1) using fhish-wasm
           │  ~2KB ciphertext
           ▼
5. Encrypted vote sent to contract
           │
           ▼
6. Contract stores ciphertext, adds to tally
           │
           ▼
7. User clicks "Reveal Results"
           │
           ▼
8. Gateway decrypts tally (fhish-wasm Node.js)
           │
           ▼
9. Results displayed (e.g., "YES: 42, NO: 15")
```

### WASM Build Process
```
tfhe-rs source (_references/zama/tfhe-rs/)
        │
        ▼
┌───────────────────────────────────────┐
│        wasm-pack build                 │
│                                       │
│  ┌─────────────┐   ┌──────────────┐  │
│  │ --target web │   │ --target      │  │
│  │              │   │ nodejs        │  │
│  └──────┬───────┘   └───────┬──────┘  │
│         │                    │         │
│         ▼                    ▼         │
│  ┌─────────────┐   ┌──────────────┐  │
│  │   pkg/      │   │  pkg-node/   │  │
│  │  (Browser)  │   │  (Node.js)   │  │
│  └─────────────┘   └──────────────┘  │
│                                       │
└───────────────────────────────────────┘
        │                    │
        ▼                    ▼
┌───────────────┐   ┌──────────────────┐
│ fhish-sdk-v2  │   │   fhish-gateway   │
│   (Browser)   │   │    (Node.js)     │
└───────────────┘   └──────────────────┘
```

## Security Model

### Key Management
```
┌─────────────────────────────────────────────────────────┐
│                    FHISH GATEWAY                         │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │            FHE Client Key                          │ │
│  │  - Generated in gateway                           │ │
│  │  - NEVER exposed to external services             │ │
│  │  - Used only for decryption                        │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│                          ▼                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │            FHE Public Key                          │ │
│  │  - Derived from client key                         │ │
│  │  - Shared with SDK (gateway → SDK)               │ │
│  │  - Used for encryption only                        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Authentication
- Gateway uses `x-fhish-relayer-secret` header
- ECDSA signatures for transaction authorization
- No public decryption endpoint

## External Dependencies

**NONE.**

We use tfhe-rs source code as a reference implementation (`_references/zama/tfhe-rs/`), but we build our own WASM from scratch.

### What We Reference
- `_references/zama/tfhe-rs/` - Git submodule for tfhe-rs source
- `_references/zama/fhevm-solidity/` - Reference for Solidity FHE types
- `_references/fhenix/` - Reference for Fhenix approach

### What We Don't Use
- `npm install tfhe` - Browser package
- `npm install node-tfhe` - Node.js package
- `npm install fhevmjs` - Zama JS SDK
- Any Zama hosted services
- Any Fhenix hosted services

## Deployment

### Development
```bash
# 1. Build WASM
cd packages/fhish-wasm
wasm-pack build --target web --out-dir pkg
wasm-pack build --target nodejs --out-dir pkg-node

# 2. Install gateway deps
cd fhish-gateway && npm install

# 3. Generate keys
npm run keygen

# 4. Start gateway
npm run dev

# 5. Start demo
cd ../../fhish-demo && npm run dev
```

### Production
```bash
# Docker
cd fhish-gateway
docker compose up -d

# Keys mounted from secrets
# Gateway exposed on port 8080
```
