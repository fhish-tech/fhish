# FHISH V2 BUILD PLAN

**Independent FHE Infrastructure - No External Dependencies**

## Principle

Build everything from tfhe-rs source code. Reference Zama/Fhenix for understanding, but NEVER use their packages directly.

## Current Status: ✅ WORKING END-TO-END

### What Works

1. **fhish-wasm** - Custom WASM from tfhe-rs source ✅
   - Browser WASM: `pkg/` - async initialization ✅
   - Node.js WASM: `pkg-node/` ✅
   - FhisUint32 encryption/decryption ✅
   - FhisBool encryption/decryption ✅

2. **fhish-gateway** - Self-hosted decryption ✅
   - Uses fhish-wasm (NOT tfhe npm) ✅
   - Auto-generates keys on first startup ✅
   - Keys loaded from `keys/` directory ✅
   - `/get-public-key` endpoint ✅
   - `/decrypt` endpoint with auth ✅
   - `/ciphertext` endpoint ✅

3. **fhish-sdk-v2** - Browser SDK ✅
   - TypeScript SDK ✅
   - RainbowKit/wagmi integration ✅
   - WASM loads via dynamic import ✅
   - Built to `dist/` ✅

4. **fhish-demo** - Demo app ✅
   - Builds successfully ✅
   - `/demo` page with voting UI ✅
   - `/proposal/[id]` page ✅
   - VoteButton component ✅
   - RevealButton component ✅

### Known Limitations

1. **FhisUint32 used instead of shortint** (~263KB ciphertext vs ~2-4KB)
   - Shortint public key generation fails due to WASM memory limits
   - FhisUint32 works perfectly
   - This is acceptable for the demo

2. **Server key is large** (~120MB)
   - Only needed for homomorphic operations
   - Not needed for encryption/decryption

## Quick Start

### 1. Start Gateway
```bash
cd fhish-gateway
FHISH_RELAYER_SECRET=test-secret npx tsx src/server.ts
```

### 2. Start Demo
```bash
cd fhish-demo
npm run dev
```

### 3. Open Browser
Navigate to http://localhost:3000/demo

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER                                    │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │ RainbowKit  │───▶│ FhishSDK    │───▶│ fhish-wasm      │  │
│  │ (Wallet)    │    │   V2        │    │  (Browser WASM)  │  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
│                            │                                  │
│                            │ fetch /get-public-key             │
│                            ▼                                  │
│                     ┌─────────────┐                           │
│                     │ Gateway     │                           │
│                     │ :8080       │                           │
│                     └─────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ POST /ciphertext
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FHISH GATEWAY (Node.js)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ fhish-wasm (Node WASM)                                  │  │
│  │ - Stores ciphertexts                                     │  │
│  │ - Decrypts on /decrypt request                          │  │
│  │ - Uses local client key                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              │ decrypt(value)                   │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Keys: client_key.bin (24KB), public_key.bin (1MB)     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
fhish/
├── packages/
│   ├── fhish-wasm/              # WASM from tfhe-rs source
│   │   ├── src/                 # Rust source
│   │   │   └── shortint_ops.rs  # Shortint types
│   │   ├── pkg/                 # Browser WASM (async init)
│   │   └── pkg-node/            # Node.js WASM
│   │
│   ├── fhish-sdk-v2/            # TypeScript SDK
│   │   ├── src/FhishClient.ts  # Main client
│   │   └── dist/               # Built output
│   │
│   └── fhish-coprocessor/       # (Future) On-chain FHE
│
├── fhish-gateway/               # Decryption gateway
│   ├── src/server.ts           # Express server
│   └── keys/                   # Generated keys
│
├── fhish-demo/                  # Demo application
│   ├── app/demo/page.tsx       # Demo page
│   ├── app/proposal/[id]/      # Voting page
│   ├── components/
│   │   ├── VoteButton.tsx      # Vote with encryption
│   │   └── RevealButton.tsx    # Reveal results
│   └── lib/sdk/               # WASM for browser
│
├── fhish-cli/           # Private FHE Weave CLI
│   ├── main.go                 # Entry point
│   ├── cmd/                    # CLI commands
│   └── Makefile                # Build script
│
└── _references/                # Reference source (read-only)
    └── zama/tfhe-rs/          # tfhe-rs source
```

## Testing

### Test Encryption/Decryption
```bash
cd packages/fhish-wasm/pkg-node
node -e "
const wasm = require('./fhish_wasm.js');
const fs = require('fs');
wasm.init_panic_hook();

const publicKey = wasm.FhisCompactPublicKey.deserialize(
  fs.readFileSync('../../fhish-gateway/keys/fhish_public_key.bin')
);
const clientKey = wasm.FhisClientKey.deserialize(
  fs.readFileSync('../../fhish-gateway/keys/fhish_client_key.bin')
);

const ct = wasm.FhisUint32.encrypt_with_public_key(42, publicKey);
const decrypted = ct.decrypt(clientKey);
console.log('Encrypted 42, decrypted:', decrypted);
"
```

### Gateway Endpoints
```bash
# Health check
curl http://localhost:8080/health

# Get public key
curl http://localhost:8080/get-public-key

# Submit ciphertext
curl -X POST http://localhost:8080/ciphertext \
  -H "Content-Type: application/json" \
  -d '{"ciphertext": "0x..."}'

# Decrypt (requires auth)
curl -X POST http://localhost:8080/decrypt \
  -H "x-fhish-relayer-secret: test-secret" \
  -H "Content-Type: application/json" \
  -d '{"ciphertext": "0x..."}'
```

## Ciphertext Sizes

| Type | Ciphertext Size | Encryption | Decryption |
|------|----------------|------------|------------|
| `FhisUint32` | ~263 KB | ✅ Works | ✅ Works |
| `FhisBool` | ~263 KB | ✅ Works | ✅ Works |
| `shortint` | ~2-4 KB | ⚠️ Key gen fails | ⚠️ N/A |

## Next Steps

1. **Deploy to Sepolia** - Deploy contracts and test on mainnet
2. **Shortint optimization** - Generate keys natively (not WASM)
3. **FHE operations** - Add server-side homomorphic operations
4. **Multi-vote batching** - Encrypt multiple votes in one transaction
