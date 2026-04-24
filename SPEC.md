# FHISH V2 TECHNICAL SPEC

FHISH V2 is a **100% independent** Fully Homomorphic Encryption (FHE) infrastructure for EVM chains. No Zama services, no external dependencies.

## Core Principles

1. **Zero External Dependencies**: All FHE code built from tfhe-rs source
2. **Full-Stack Ownership**: WASM, SDK, Gateway, Relayer - all ours
3. **Privacy First**: Sensitive data never leaves encrypted state on-chain
4. **Shortint Optimization**: Small ciphertexts (~2-4KB) for practical use

## Independent Stack

### What We Build
```
tfhe-rs source (_references/zama/tfhe-rs/)
        │
        ▼ (wasm-pack build)
fhish-wasm (packages/fhish-wasm/)
        │
        ├──▶ Browser WASM (pkg/)
        │           │
        │           ▼
        │    fhish-sdk-v2 (RainbowKit integration)
        │
        └──▶ Node.js WASM (pkg-node/)
                    │
                    ▼
             fhish-gateway (decryption server)
```

### What We DON'T Use
- ❌ `tfhe` npm package (browser WASM - requires Web Workers)
- ❌ `node-tfhe` package (Node.js FHE - external dependency)
- ❌ `fhevmjs` (Zama's JS SDK)
- ❌ `fhenix.js` (Fhenix SDK)
- ❌ Zama hosted services (relayer.testnet.zama.cloud)
- ❌ Fhenix hosted services

## Key Components

### 1. fhish-wasm (`packages/fhish-wasm/`)

**Custom WASM bindings built from tfhe-rs source code.**

Features:
- **Shortint types**: `FhisShortintUint2`, `FhisShortintConfig`, `FhisShortintClientKey`, `FhisShortintPublicKey`, `FhisShortintServerKey`
- **Operations**: add, sub, mul on ciphertexts
- **Serialization**: bincode for compact storage
- **Two targets**: `web` (browser) and `nodejs` (gateway)

Build:
```bash
# Browser
wasm-pack build --target web --out-dir pkg

# Node.js
wasm-pack build --target nodejs --out-dir pkg-node
```

### 2. fhish-sdk-v2 (`packages/fhish-sdk-v2/`)

**TypeScript SDK for browser-based encryption.**

Features:
- Uses `fhish-wasm` (browser target)
- RainbowKit/wagmi integration for real wallet connection
- Encrypts votes in-browser (~2-4KB ciphertexts)
- Fetches public key from FHISH gateway
- No external FHE services contacted

### 3. fhish-gateway (`fhish-gateway/`)

**Self-hosted decryption gateway (Node.js).**

Features:
- Uses `fhish-wasm` (Node.js target)
- Owns the FHE client key
- Decrypts ciphertexts on request
- No external decryption services
- Docker-ready for production

Endpoints:
- `GET /health` - Health check
- `GET /ready` - Readiness (keys loaded)
- `GET /get-public-key` - Public key for SDK
- `POST /decrypt` - Decrypt ciphertext (auth required)

### 4. fhish-demo (`fhish-demo/`)

**Demo application with RainbowKit wallet connection.**

Features:
- Real wallet integration (not mock)
- `/proposal/[id]` page with voting
- VoteButton encrypts in-browser
- RevealButton decrypts results

## Ciphertext Comparison

| Type | Size | Encryption | Decryption |
|------|------|------------|------------|
| `shortint` (Uint2) | ~2-4 KB | ~50ms | ~100ms |
| `FheUint32` | ~263 KB | ~500ms | ~2s |

**We use shortint for voting** - smaller, faster, sufficient.

## FHE Types Implemented

### Shortint (Primary for Voting)
```typescript
// Browser (fhish-sdk-v2)
import { FhishClient } from 'fhish-sdk-v2';
const client = await FhishClient.init(gatewayUrl);
const encryptedVote = await client.encryptVote(true); // YES = 1

// Gateway (fhish-gateway)
import { FhisShortintClientKey, FhisShortintUint2 } from 'fhish-wasm';
const result = ciphertext.decrypt(clientKey);
```

### Types Available
- `FhisShortintUint2` - 2-bit integer (~2-4KB ciphertext)
- `FhisShortintConfig` - Configuration (PARAM_MESSAGE_2_CARRY_2_KS_PBS)
- `FhisShortintClientKey` - Client-side key (never exposed)
- `FhisShortintPublicKey` - Public key for encryption
- `FhisShortintServerKey` - Server-side key for homomorphic ops

## Security Model

1. **Private Key Ownership**: Gateway owns the client key, never exposed
2. **Public Key Distribution**: Public key shared with SDK for encryption
3. **Encrypted Voting**: Votes encrypted client-side, never in plaintext
4. **On-Chain Computation**: Homomorphic addition for vote tallying
5. **Authorized Decryption**: Gateway decrypts only authorized requests

## Performance Targets

- Browser encryption: < 100ms for shortint
- Gateway decryption: < 500ms
- End-to-end reveal: < 5s on Sepolia

## File Structure

```
fhish/
├── packages/fhish-wasm/
│   ├── src/
│   │   ├── lib.rs              # WASM module
│   │   ├── shortint_ops.rs      # Shortint operations
│   │   ├── keys.rs             # Key types
│   │   └── ...
│   ├── pkg/                    # Browser WASM output
│   └── pkg-node/               # Node.js WASM output
│
├── packages/fhish-sdk-v2/
│   ├── src/FhishClient.ts      # Main client
│   └── dist/                   # Built SDK
│
├── fhish-gateway/
│   ├── src/server.ts           # Express server
│   └── keys/                   # Generated keys
│
└── _references/zama/tfhe-rs/   # Reference source (DO NOT MODIFY)
```
