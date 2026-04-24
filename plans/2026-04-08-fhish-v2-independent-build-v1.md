# FHISH V2 — Independent FHE Protocol Build Plan

## Objective

Build a complete, 100% independent FHISH V2 protocol that does not depend on Zama's gateway infrastructure or Fhenix's precompile runtime. The system uses tfhe-rs WASM for client-side encryption, a self-hosted gateway service with real TFHE decryption, and a custom FHE coprocessor contract that delegates to our gateway for all homomorphic operations.

---

## Accomplished (as of 2026-04-08)

### WASM Initialization — Resolved
`node-tfhe` crashes in Node.js v25 with `RuntimeError: unreachable` during encryption because the WASM captures `self.crypto` (Web Crypto API) which isn't available in Node.js. Solution: use `tfhe` npm (browser WASM package) with local HTTP server to serve the WASM binary, initialized via `tfhe.default(fetch('http://127...'))` with a Response object.

### The BIG BUG — Fixed
SDK's `encrypt()` was putting the entire serialized ciphertext (~4KB) into `handleA` (bytes32 parameter), causing viem to reject with "Size of bytes (263448) does not match expected size (bytes32)". Fixed by changing the contract's `vote()` to accept `bytes calldata ciphertextA, bytes calldata ciphertextB` instead of `bytes32 handleA, bytes proofA, bytes32 handleB, bytes proofB`. The SDK now submits ciphertexts to the gateway via HTTP and passes raw bytes to the contract.

### Gateway — Running
- Uses `tfhe` npm with local HTTP WASM serving (port 8081), polyfill via `tsx --import ./src/polyfill.mjs`
- POST /ciphertext (relayer-auth required): stores ciphertext by keccak256, returns handle
- GET /ciphertext/:handle (relayer-auth required): returns stored ciphertext for decryption
- Keys: TfheClientKey + TfheCompressedPublicKey (1,050,328 bytes PK)
- WASM: 4,956,543 bytes (matching SDK)

### SDK — Built
- `tfhe@1.5.4` installed (matching gateway/contracts)
- `initTfhe()` uses dynamic WASM URL from gateway
- `FhishClient` uses `TfheCompressedPublicKey.deserialize()` + `encrypt_with_compressed_public_key()`
- `createEncryptedInput.encrypt()` now submits ciphertexts to gateway via POST /ciphertext and returns handles (keccak256)
- SDK built: `dist/index.js` (13.56 KB), `dist/index.mjs`, `dist/index.d.ts`

### Demo — Updated
- ABI changed to `vote(bytes ciphertextA, bytes ciphertextB)` — BREAKING CHANGE requiring contract redeployment
- VoteButton now passes ciphertext bytes to vote() instead of handles
- RPC updated to `1rpc.io/sepolia`

### Relayer — Updated
- KMS: new `fetchCiphertext(handle)` method → GET /ciphertext/:handle on gateway
- KMS.decrypt(): if handle is 66 chars (0x + 64 hex = keccak256), fetches ciphertext from gateway first; otherwise treats as raw ciphertext hex
- Auth secret aligned with gateway: `fhish_relayer_secret_v2`

### Contracts — Compiled
- `PrivateVotingV2.vote(bytes, bytes)`: calls Gateway.submitCiphertext() → stores on-chain, returns keccak256 handle; uses handle for FHE ops
- `FhishCoprocessor.verifyCiphertext`: now calls precompile's `addCiphertextMaterial(bytes32,uint256,bytes32,bytes32)` (selector 0x90f30354) with keyId=1, ciphertextDigest=keccak256(ciphertext), snsDigest=keccak256(keccak256(ciphertext))
- All contracts compile with zero errors (only unused variable warnings)

### Files Modified This Session
- `fhish-gateway/src/server.ts`: Added `POST /ciphertext` and `GET /ciphertext/:handle` endpoints, added ethers import
- `packages/fhish-sdk-v2/src/FhishClient.ts`: encrypt() now submits to gateway, added gateway POST call
- `packages/fhish-relayer-v2/src/kms.ts`: Added `fetchCiphertext()` + updated `decrypt()` with handle detection
- `fhish-demo/lib/contracts.ts`: Changed vote ABI from `(bytes32,bytes,bytes32,bytes)` to `(bytes,bytes)`
- `fhish-demo/components/VoteButton.tsx`: Pass ciphertext bytes to vote(), not handles
- `packages/fhish-contracts-v2/contracts/lib/FhishCoprocessor.sol`: verifyCiphertext now imports to precompile, added `_importCiphertext()` helper
- `plans/2026-04-08-fhish-v2-independent-build-v1.md`: Updated with accomplished section and critical bug fix

---



## Architecture Overview

The system follows a three-layer architecture:

**Layer 1 — Client (Browser / SDK)**
The TypeScript SDK uses tfhe-rs WASM compiled for the browser to perform client-side encryption. Users encrypt their votes (0 or 1) locally before submitting transactions. The SDK communicates with our gateway over HTTPS to fetch the public key, CRS, and WASM binary, never exposing the client-side secret key. After encryption, the SDK proactively submits ciphertexts to the off-chain gateway via HTTP POST for relayer access.

**Layer 2 — FHISH Gateway (Node.js Service)**
Our gateway service owns the FHE client key and CRS. It serves the public key, CRS, and WASM binary via REST endpoints, and accepts decryption requests from the relayer. It performs real TFHE decryption using tfhe npm against our own keys, never touching Zama infrastructure. The gateway also maintains an off-chain ciphertext store (POST /ciphertext and GET /ciphertext/:handle) for relayer access to submitted ciphertexts.

**Layer 3 — On-Chain Contracts (Sepolia)**
The PrivateVotingV2 contract accepts raw ciphertext bytes in vote(), submits them to FhishGateway.submitCiphertext() for on-chain storage, and uses the returned keccak256 handle for FHE operations via FhishCoprocessor. When tallying is requested, the FhishGateway receives decrypted results from the relayer and delivers them to the contract via callback. The FhishCoprocessor delegates FHE operations to the Zama FHEVM precompile on Sepolia and calls its addCiphertextMaterial to register ciphertexts before FHE ops.

**Critical Data Flow Fix** (discovered 2026-04-08):
The original design had a critical bug: SDK's encrypt() returned the full serialized ciphertext (~4KB) as a "handle" and tried to pass it as bytes32. The viem library rejected this with "Size of bytes (263448) does not match expected size (bytes32)". The correct pattern is:
  1. SDK encrypts locally → serialized ciphertext bytes (~4KB)
  2. SDK POSTs ciphertext to off-chain gateway → stored by keccak256(ciphertext), returns handle
  3. SDK calls contract.vote(ciphertextA, ciphertextB) → contract calls Gateway.submitCiphertext() for on-chain storage
  4. Contract uses returned handle for FHE ops → coprocessor calls precompile.addCiphertextMaterial(handle, ciphertext) to register
  5. Relayer fetches ciphertext from off-chain gateway via GET /ciphertext/:handle → decrypts → posts result

**Data Flow for Voting:**
 1. User encrypts vote (1 or 0) using SDK with tfhe-rs WASM in browser
 2. SDK POSTs ciphertext to gateway /ciphertext → gateway stores by keccak256, returns handle
 3. SDK calls PrivateVotingV2.vote(ciphertextA, ciphertextB) with raw ciphertext bytes
 4. Contract calls Gateway.submitCiphertext(ciphertext) → on-chain gateway stores ciphertext, returns keccak256(ciphertext) as handle
 5. Contract calls FhishTFHE.asEuint32(handle, ciphertext) → coprocessor calls precompile.addCiphertextMaterial(handle, ciphertext) to register ciphertext, returns handle
 6. Contract accumulates votes using FhishCoprocessor.fheAdd via precompile
 7. Admin calls requestResult() → emits PublicDecryptionRequest with handles (keccak256 of ciphertexts)
 8. Relayer detects event, extracts handles, calls GET /ciphertext/:handle on gateway to fetch ciphertext bytes
 9. Relayer calls POST /decrypt with ciphertext bytes → gateway decrypts with tfhe-rs, returns plaintext
10. Relayer calls FhishGateway.fulfillPublicDecryption(decryptionId, encodedResult, signatures)
11. PrivateVotingV2 receives decrypted tally via callback, updates finalTallyA and finalTallyB

---

## Next Steps (requires user action)

The contract vote() ABI changed from `(bytes32,bytes,bytes32,bytes)` to `(bytes,bytes)`. All deployed contracts must be redeployed.

1. **Restart services** with new code:
   ```bash
   # Terminal 1: Gateway (restart with new endpoints)
   cd fhish-gateway && npm run start
   
   # Terminal 2: Relayer (restart with new KMS)
   cd packages/fhish-relayer-v2 && npm run start
   
   # Terminal 3: Demo (rebuild SDK first, then start)
   cd packages/fhish-sdk-v2 && npm run build
   cd fhish-demo && npm run dev
   ```

2. **Redeploy contracts to Sepolia** (ABI breaking change):
   ```bash
   cd packages/fhish-contracts-v2
   npx hardhat compile
   npx hardhat run scripts/deploy_gateway.ts --network sepolia
   npx hardhat run scripts/deploy_voting.ts --network sepolia
   ```

3. **Update fhish-demo/.env.local** with new contract addresses from deployments.json:
   ```
   NEXT_PUBLIC_VOTING_CONTRACT=<new PrivateVotingV2 address>
   NEXT_PUBLIC_GATEWAY_CONTRACT=<new FhishGateway address>
   ```

4. **Verify end-to-end**: Gateway serves WASM → SDK encrypts + submits to gateway → contract stores + uses handle → Relayer fetches ciphertext from gateway → Relayer decrypts → Relayer posts result → Contract callback updates tallies.

---

## Implementation Plan

### PHASE 0 — Repository Setup

- [ ] **0.1** Initialize git in packages that currently lack it: packages/fhish-sdk-v2, packages/fhish-contracts-v2, packages/fhish-relayer-v2, and fhish-gateway. Run git init in each directory root.

- [ ] **0.2** Create standard .gitignore files for each package covering: node_modules, dist, artifacts, cache, .env, typechain-types, and build outputs.

- [ ] **0.3** Create AGENTS.md in each package documenting the tech stack (runtime, libraries, Solidity version), build commands (npm run build, npx hardhat compile), key file inventory, and testing approach.

- [ ] **0.4** Delete V1 packages that are fully mocked and superseded: fhish-js (mock tfhe), fhish-contracts (plain integer FHE), fhish-relayer (handle%100 shortcut), fhish-demo-contracts (keccak256 XOR voting). Use git rm for clean deletion.

- [ ] **0.5** Archive fhish-core package since its shared types are absorbed into the SDK types.ts file. Keep the directory but mark as deprecated in its README.

- [ ] **0.6** Make initial commits in each package with clean state. Use descriptive messages like "feat: initialize clean repository state for FHISH V2 independent protocol".

### PHASE 1 — Gateway (Node.js + node-tfhe)

- [ ] **1.1** Rewrite fhish-gateway/src/server.ts to remove all Zama gateway URLs and TEST MODE shortcut from the current implementation. The TEST MODE shortcut at lines 114-118 of the existing server.ts accepts short ciphertexts and returns plaintext directly — this must be removed so all decryption goes through proper tfhe-rs decryption.

- [ ] **1.2** Add proper relayer authentication using EIP-712. The FhishGateway on-chain contract validates relayer signatures; the gateway server must also verify that decryption requests come from authorized relayers by validating the x-fhish-relayer-secret header against a whitelist stored in environment variables.

- [ ] **1.3** Consolidate key serving routes. Remove the generic /keys/:filename route. Add explicit endpoints /get-public-key and /get-crs-2048 that serve binary files with correct Content-Type headers.

- [ ] **1.4** Implement /get-public-key binary endpoint that reads fhish_public_key.bin and serves it with Content-Type: application/octet-stream and Cache-Control headers for browser caching.

- [ ] **1.5** Implement /get-crs-2048 binary endpoint that reads fhish_crs_2048.bin and serves it with proper binary headers for SDK consumption.

- [ ] **1.6** Add /health endpoint returning 200 with {status: "ok"} and /ready endpoint that verifies client key is loaded before returning 200.

- [ ] **1.7** Add administrative endpoints for relayer management: POST /admin/add-relayer and GET /admin/relayers. Protect with admin API key from environment variable. Store relayer list in memory (acceptable for MVP; use database for production).

- [ ] **1.8** Add request logging middleware using a correlation ID header (x-request-id or generate UUID). Log: timestamp, method, path, status code, duration, and correlation ID for tracing.

- [ ] **1.9** Add /metrics endpoint exposing Prometheus-format counters and histograms: fhish_gateway_decrypt_requests_total, fhish_gateway_decrypt_duration_seconds, fhish_gateway_decrypt_errors_total, fhish_gateway_key_requests_total.

- [ ] **1.10** Audit fhish-gateway/package.json dependencies. Keep: node-tfhe, express, ethers, dotenv, cors, axios. Remove any unused packages. Add express-rate-limit for DDoS protection.

- [ ] **1.11** Create fhish-gateway/Dockerfile using Node.js 20 alpine image. Copy built files, set NODE_ENV=production, run as non-root user. Create fhish-gateway/docker-compose.yml with the gateway service, environment variables, and volume mounts for keys directory.

- [ ] **1.12** Add startup validation: check that fhish_public_key.bin, fhish_client_key.bin, fhish_crs_2048.bin, and fhish_crs_4096.bin all exist and are non-empty before starting the HTTP server. Fail with descriptive error if any are missing.

- [ ] **1.13** Write integration tests for the /decrypt endpoint covering: valid ciphertext returns correct plaintext, invalid secret header returns 403, missing ciphertext body returns 400, corrupted ciphertext returns 500.

- [ ] **1.14** Write fhish-gateway/.env.example documenting: PORT (default 8080), BASE_URL (public URL of gateway), FHISH_RELAYER_SECRET (shared secret for relayer auth), ADMIN_API_KEY (for admin endpoints), RPC_URL (optional, for future chain reading).

- [ ] **1.15** Regenerate FHE keys using the updated keygen script. Ensure the client key, public key, and CRS are all generated from the same tfhe-rs configuration. Verify ciphertexts generated by the SDK can be decrypted by the gateway using the new keys.

### PHASE 2 — SDK (TypeScript + tfhe-rs WASM)

- [ ] **2.1** Rewrite packages/fhish-sdk-v2/src/FhishClient.ts to remove all fhevmjs imports (currently on line 3). Replace with direct tfhe-rs WASM initialization. Remove all references to https://gateway.sepolia.zama.ai from this file and its test-encrypt.ts companion.

- [ ] **2.2** Add tfhe-rs WASM initialization in the FhishClient constructor or init method. The WASM bundle should be loaded from the tfhe npm package. Initialize the public key from the binary served by our gateway at /get-public-key. Fall back to a bundled public key for offline use.

- [ ] **2.3** Implement encryptUint32 method that takes a number and returns a Uint8Array ciphertext using tfhe-rs compact encryption. The encryption must be probabilistic: encrypting the same value twice must produce different ciphertexts.

- [ ] **2.4** Implement encryptBool method that takes a boolean and returns a Uint8Array ciphertext using tfhe-rs boolean encryption.

- [ ] **2.5** Implement encryptUint64 method that takes a bigint and returns a Uint8Array ciphertext using tfhe-rs 64-bit unsigned integer encryption.

- [ ] **2.6** Add ciphertextToHex utility that converts Uint8Array ciphertext to a hex string prefixed with 0x for contract interaction. Also add hexToCiphertext for decoding.

- [ ] **2.7** Implement createEncryptedInput method returning a structure compatible with our coprocessor's verifyCiphertext call. The structure should include handles (Uint8Array array) and inputProof (Uint8Array). The proof can be a deterministic signature of the ciphertext for the MVP.

- [ ] **2.8** Add generateKeypair method that generates a new FHE client/public keypair for per-user re-encryption keys. Store client key in browser localStorage (encrypted with wallet signature). Return the public key for permit generation.

- [ ] **2.9** Add signPermit method that creates an EIP-712 typed data signature authorizing the contract to use the user's re-encryption key. The permit should include: user address, contract address, public key, and expiry timestamp.

- [ ] **2.10** Rewrite packages/fhish-sdk-v2/src/EncryptionEngine.ts to remove the mock encryption comment currently on line 18. Replace with a call to tfhe-rs encryptUint32 from the WASM bundle.

- [ ] **2.11** Update packages/fhish-sdk-v2/src/types.ts to add: CiphertextBytes type wrapping Uint8Array, EncryptionResult type with ciphertext and proof fields, and FhishKeypair type with publicKey and encryptedPrivateKey.

- [ ] **2.12** Update packages/fhish-sdk-v2/src/index.ts to export all public types and the FhishClient class. Ensure barrel exports are complete for tree-shaking.

- [ ] **2.13** Build the SDK: run tsup to generate dist/index.js, dist/index.mjs, and dist/index.d.ts. Verify the output files exist and are non-empty.

- [ ] **2.14** Write unit tests using Vitest covering: encrypt(42) ciphertext is not equal to 42 as bytes, encrypt(42) called twice produces different ciphertexts, ciphertext length is consistent per type, decrypt known ciphertext returns original value.

- [ ] **2.15** Update packages/fhish-sdk-v2/package.json dependencies. Remove fhevmjs. Add tfhe npm package (or reference bundled WASM assets). Pin versions for reproducibility. Add "types" field pointing to dist/index.d.ts.

- [ ] **2.16** Update check_tfhe.js to verify tfhe-rs WASM initializes correctly. Remove any references to fhevmjs network key fetching. Test that our gateway URL (/get-public-key) returns a valid public key binary.

### PHASE 3 — Contracts V2 (Solidity)

- [ ] **3.1** Rewrite packages/fhish-contracts-v2/contracts/lib/FhishConfig.sol to remove all address(0) placeholders currently in getSepoliaConfig. Replace with the actual deployed addresses of FhishCoprocessor, FhishACL, and FhishKMSVerifier.

- [ ] **3.2** Design and implement FhishCoprocessor contract following the IFhishExecutor interface. Deploy to Sepolia at a deterministic address using CREATE2 with a fixed salt. The contract must implement: fheAdd, fheSub, fheMul, fheDiv, fheEq, fheNe, fheGe, fheGt, fheLe, fheLt, fheIfThenElse, trivialEncrypt, and verifyCiphertext.

- [ ] **3.3** Design the coprocessor operation model: each FHE operation should emit a FHEOpRequested event containing the input handles. The coprocessor can either compute synchronously (using the trusted gateway pattern) or asynchronously. For the MVP, use the trusted gateway pattern where the coprocessor calls an external gateway URL for decryption, then performs the FHE operation on the decrypted values and re-encrypts.

- [ ] **3.4** Rewrite packages/fhish-contracts-v2/contracts/lib/FhishTFHE.sol to call the deployed FhishCoprocessor address instead of address(0). The add, sub, mul, and other FHE operations should delegate to FhishCoprocessor.fheAdd, FhishCoprocessor.fheSub, etc.

- [ ] **3.5** Rewrite packages/fhish-contracts-v2/contracts/gateway/FhishGateway.sol to fix the critical security hole in fulfillPublicDecryption. Add a mapping: mapping(address => bool) public authorizedRelayers. Add require statement: require(authorizedRelayers[msg.sender], "FhishGateway: caller is not authorized"). Add onlyOwner functions: addRelayer(address) and removeRelayer(address).

- [ ] **3.6** Add EIP-712 signature verification in FhishGateway.fulfillPublicDecryption. Define the verification domain separator with chainId, contract address, and version. Verify that the relayer signed a digest of (decryptionId, keccak256(decryptedResult)). Store the gateway's ECDSA public key in the contract for verification.

- [ ] **3.7** Rewrite packages/fhish-contracts-v2/contracts/PrivateVotingV2.sol. The vote function should use FhishTFHE.asEuint32 with the handle and proof parameters. The requestResult function should emit a properly structured event that the relayer can watch. The onDecryptionResult callback should update finalTallyA and finalTallyB with the decrypted values.

- [ ] **3.8** Create packages/fhish-contracts-v2/contracts/lib/FhishACL.sol implementing the IACL interface. Track allowed addresses per ciphertext handle. Use EIP-1153 transient storage (Cancun) for the allowed mapping if the network supports it, with a fallback to regular storage. Implement: allow, allowTransient, isAllowed, allowForDecryption, isAllowedForDecryption, and cleanTransientStorage.

- [ ] **3.9** Deploy FhishACL to Sepolia. Update FhishConfig.sol with the deployed ACL address. The coprocessor and gateway should reference the ACL for access control.

- [ ] **3.10** Create packages/fhish-contracts-v2/contracts/lib/FhishKMSVerifier.sol. This contract verifies ECDSA signatures from the FHISH gateway on decryption results. Implement: verifyDecryptionSignatures that takes handles, decryptedResult, and signatures, and returns bool. Verify the gateway's ECDSA signature over the result.

- [ ] **3.11** Create packages/fhish-contracts-v2/contracts/lib/FhishInputVerifier.sol as a placeholder for future ZK proof verification. For Phase 2 MVP, implement a pass-through verifier that accepts any proof. Document the interface for future Groth16 or PLONK integration.

- [ ] **3.12** Deploy FhishGateway, FhishCoprocessor, FhishACL, FhishKMSVerifier, and FhishInputVerifier to Sepolia in dependency order. Record all deployment transaction hashes and addresses.

- [ ] **3.13** Deploy PrivateVotingV2 to Sepolia, passing the deployed addresses of FhishGateway, FhishACL, and FhishCoprocessor to the constructor. Verify the contract initializes correctly by calling view functions.

- [ ] **3.14** Generate packages/fhish-contracts-v2/deployments.json with the complete deployment record: network name, chainId, block number, all contract addresses, deployment transaction hashes, and deployment timestamps in ISO format.

- [ ] **3.15** Write deployment scripts in packages/fhish-contracts-v2/scripts: deploy_gateway.ts for FhishGateway, deploy_coprocessor.ts for FhishCoprocessor using CREATE2, deploy_acl.ts for FhishACL, deploy_voting.ts for PrivateVotingV2, and verify_deployment.ts that checks all deployed addresses match deployments.json.

- [ ] **3.16** Compile all contracts: run npx hardhat compile. Verify zero compilation errors and zero warnings about unimplemented functions.

- [ ] **3.17** Write Solidity tests covering: voting flow (cast vote with encrypted input, request tally, fulfill result, verify final tally), ACL transient storage (allow, allowTransient, clean), and gateway authorization (authorized relayer succeeds, unauthorized relayer reverts).

- [ ] **3.18** Update the .env.example in packages/fhish-contracts-v2 documenting all required variables: PRIVATE_KEY, SEPOLIA_RPC_URL, GATEWAY_ADDRESS, ACL_ADDRESS, COPROCESSOR_ADDRESS, and all optional verification addresses.

### PHASE 4 — Relayer V2 (TypeScript)

- [ ] **4.1** Rewrite packages/fhish-relayer-v2/src/compute.ts to remove mock KMS comments and implement real decryption calls. The compute method should POST ciphertexts to our gateway at process.env.FHISH_GATEWAY_URL plus /decrypt, with the x-fhish-relayer-secret header.

- [ ] **4.2** Rewrite packages/fhish-relayer-v2/src/kms.ts to use our gateway URL from environment variable. Add retry logic: attempt the HTTP POST up to 3 times with exponential backoff (1s, 2s, 4s). Validate the response has a plaintext field matching expected type.

- [ ] **4.3** Rewrite packages/fhish-relayer-v2/src/listener.ts to watch PublicDecryptionRequest events from FhishGateway. Parse the ctHandles bytes32 array from each event. For each handle, convert to hex string and pass to compute. Use robust polling with block range queries.

- [ ] **4.4** Rewrite packages/fhish-relayer-v2/src/responder.ts to call gateway.fulfillPublicDecryption with the correct function signature: (decryptionId, encodedResults, signatures array). The signatures array should contain the relayer's EIP-712 signature over the results.

- [ ] **4.5** Implement EIP-712 signing in responder.ts. Create a typed domain for FhishGateway with name, version, chainId, and verifyingContract. Sign the message: {decryptionId, keccak256(encodedResults)}. Use ethers.Signer.signTypedData.

- [ ] **4.6** Rewrite packages/fhish-relayer-v2/src/index.ts to update the gateway ABI to match the new FhishGateway interface. Load gateway address from GATEWAY_ADDRESS env var. Load gateway URL from FHISH_GATEWAY_URL env var (HTTP endpoint, not on-chain address).

- [ ] **4.7** Add health monitoring: poll fhish-gateway /health endpoint every 30 seconds. If /health returns non-200, log an error and set a degraded mode flag. Alert if gateway is unreachable for more than 5 consecutive checks.

- [ ] **4.8** Add transaction resilience: if fulfillPublicDecryption reverts with nonce error, recalculate nonce and retry up to 3 times. If gas estimation fails, use a fixed high gas limit (1,000,000). If the transaction times out, query the chain for the transaction receipt before retrying.

- [ ] **4.9** Add Prometheus metrics using the prom-client library: fhish_relayer_decrypt_requests_total counter, fhish_relayer_decrypt_duration_seconds histogram, fhish_relayer_tx_broadcast_total counter with status label (success/failure), fhish_relayer_gateway_health_status gauge.

- [ ] **4.10** Implement graceful shutdown in packages/fhish-relayer-v2/src/index.ts. Register process.on handlers for SIGTERM and SIGINT. Set a shutdownInProgress flag that listener.ts checks before processing new events. Await all pending HTTP requests in compute.ts using AbortController. Await all pending blockchain transactions in responder.ts. Call process.exit(0) only after all operations complete or timeout after 30 seconds.

- [ ] **4.11** Create packages/fhish-relayer-v2/Dockerfile using Node.js 20 alpine image and packages/fhish-relayer-v2/docker-compose.yml with environment variables, restart policy, and health check configuration.

- [ ] **4.12** Write integration test: mock the gateway HTTP endpoint using nock or wiremock. Verify compute sends correct POST body, receives plaintext, and constructs a valid fulfillPublicDecryption transaction with proper ABI encoding.

- [ ] **4.13** Audit packages/fhish-relayer-v2/package.json: ensure axios is included for HTTP calls, dotenv for environment, express for the health endpoint. Remove unused dependencies.

- [ ] **4.14** Write packages/fhish-relayer-v2/.env.example documenting: RPC_URL (Sepolia JSON-RPC), PRIVATE_KEY (relayer wallet), GATEWAY_ADDRESS (on-chain FhishGateway address), GATEWAY_URL (HTTP URL of gateway service), FHISH_RELAYER_SECRET (shared secret for gateway auth).

### PHASE 5 — Demo Frontend (Next.js)

- [x] **5.1** Rewrite fhish-demo/lib/sdk/FhishClient.ts to import from the newly built @fhish/sdk package. Remove all fhevmjs initialization and Zama gateway URL references. The SDK should be instantiated with our gateway URL from environment variables.

- [x] **5.2** Rewrite fhish-demo/lib/sdk/EncryptionEngine.ts to use real tfhe-rs encryption via the SDK import. Remove the mock encryption comment and implement proper client-side encryption using the SDK's encrypt methods.

- [x] **5.3** Rewrite fhish-demo/lib/fhish.ts to point the gateway URL to our FHISH gateway: process.env.NEXT_PUBLIC_FHISH_GATEWAY_URL. Remove the hardcoded https://gateway.sepolia.zama.ai URL. Load the PrivateVotingV2 address from the V2 deployments.json.

- [x] **5.4** Rewrite fhish-demo/lib/contracts.ts to use the updated PrivateVotingV2 contract ABI with the new vote function signature: `vote(bytes ciphertextA, bytes ciphertextB)`. NOTE: This is a BREAKING CHANGE — existing deployed contracts need to be redeployed.

- [x] **5.5** Update fhish-demo/components/VoteButton.tsx: encrypt vote using SDK, submit to gateway (SDK does this), then call contract.vote(ciphertextA, ciphertextB) with raw ciphertext bytes. For YES vote: ciphertextA = encrypted 1, ciphertextB = empty. For NO vote: ciphertextA = empty, ciphertextB = encrypted 1.

- [ ] **5.6** Update fhish-demo/components/RevealButton.tsx to call requestResult() on the contract. Watch for DecryptionFulfilled event with the voter wallet as a filter. Display the finalTallyA and finalTallyB values from the event.

- [ ] **5.7** Add fhish-demo/components/ProposalCard.tsx to display the encrypted tally handles as hex strings (shown to users as proof that votes are encrypted) alongside the decrypted results once available. Add loading states for pending decryption.

- [x] **5.8** Add fhish-demo/.env.local with NEXT_PUBLIC_FHISH_GATEWAY_URL (our gateway HTTP URL) and NEXT_PUBLIC_VOTING_ADDRESS (deployed PrivateVotingV2 address from deployments.json). NOTE: Must update with new contract addresses after redeployment.

- [x] **5.9** Remove fhish-demo/lib/sdk/test-encrypt.ts and fhish-demo/lib/sdk/debug-keys.js as these are test artifacts not needed in production.

- [x] **5.10** Remove fhish-demo/lib/sdk/types.ts as the types are now sourced from @fhish/sdk.

- [x] **5.11** Update fhish-demo/package.json to add @fhish/sdk as a dependency, referencing the local path packages/fhish-sdk-v2 during development.

- [ ] **5.12** Build the demo: run npm run build in the fhish-demo directory. Fix any TypeScript compilation errors. Verify the build output is clean with zero warnings.

- [ ] **5.13** Run end-to-end test on Sepolia testnet: connect wallet, create a test proposal, cast an encrypted vote, trigger tally request, wait for relayer fulfillment, and verify the decrypted result matches the submitted vote.

### PHASE 6 — Build, Test, Deploy, and Commit

- [ ] **6.1** Compile all contracts in packages/fhish-contracts-v2 using npx hardhat compile. Verify the output shows zero compilation errors and confirms all contracts were compiled with solc 0.8.24.

- [ ] **6.2** Build the SDK in packages/fhish-sdk-v2 using npm run build. Verify dist/index.js, dist/index.mjs, and dist/index.d.ts are generated and non-empty.

- [ ] **6.3** Start the gateway server and run curl tests: GET /health returns 200, GET /get-public-key returns binary, POST /decrypt with valid ciphertext returns correct plaintext, POST /decrypt without auth returns 403.

- [ ] **6.4** Start the relayer and verify it connects to the gateway health endpoint, watches FhishGateway events on Sepolia, and logs startup messages correctly.

- [ ] **6.5** Deploy all contracts to Sepolia in dependency order: first FhishACL, then FhishCoprocessor (CREATE2), then FhishGateway, then FhishKMSVerifier and FhishInputVerifier, finally PrivateVotingV2. Use the deployment scripts from Phase 3.

- [ ] **6.6** Update all deployments.json files with the final Sepolia contract addresses, chainId, and deployment metadata. Verify all addresses are valid Ethereum addresses.

- [ ] **6.7** Start the demo frontend and verify it loads without console errors, displays proposal cards, and the connect wallet flow works with wagmi/rainbowkit.

- [ ] **6.8** Verify all deployed contracts on Etherscan: check the source code is verified, the constructor arguments match expected values, and the events are emitting correctly by watching recent transactions.

- [ ] **6.9** Run TypeScript type checking: run tsc --noEmit in packages/fhish-sdk-v2, packages/fhish-relayer-v2, and fhish-demo. Fix any type errors before proceeding.

- [ ] **6.10** Make git commits at each phase boundary with descriptive messages: "feat(gateway): add tfhe-rs decryption without test mode", "feat(sdk): replace fhevmjs with tfhe-rs WASM", "feat(contracts): deploy FhishCoprocessor and FhishGateway", "feat(relayer): implement EIP-712 signed fulfillment", "feat(demo): integrate with V2 SDK and contracts".

---

## Verification Criteria

- [ ] Gateway /decrypt returns correct plaintext for tfhe-rs ciphertexts of known values. Test by encrypting 42 in the SDK, sending the ciphertext to /decrypt, and verifying the response is 42.

- [ ] SDK encrypt produces non-plaintext ciphertext. Verify encrypt(42) does not return 0x2a or any small integer as the ciphertext value.

- [ ] SDK encryption is probabilistic. Call encrypt(42) twice and verify the resulting hex strings are different.

- [ ] PrivateVotingV2.vote transaction succeeds on Sepolia with gas estimation below 5,000,000 gas.

- [ ] Relayer detects PublicDecryptionRequest events from FhishGateway and successfully calls gateway /decrypt for each handle in the event.

- [ ] FhishGateway.fulfillPublicDecryption reverts when called by an address that is not in the authorizedRelayers mapping.

- [ ] PrivateVotingV2.getEncryptedTallies returns non-zero bytes32 values after at least one vote has been cast.

- [ ] PrivateVotingV2.onDecryptionResult callback updates finalTallyA and finalTallyB storage slots with the decrypted values from the fulfillment.

- [ ] Demo frontend renders without TypeScript errors and the Next.js build completes with zero warnings.

- [ ] Full end-to-end voting flow on Sepolia: cast vote (encrypted) -> request tally -> relayer fulfills -> reveal results in the UI within 2 minutes.

- [ ] grep for zama.ai returns zero matches in all TypeScript and Solidity source files under packages/, fhish-gateway/, and fhish-demo/lib/.

- [ ] grep for TEST MODE or ctBytes.length in fhish-gateway/src/server.ts returns zero matches, confirming the test shortcut was removed.

---

## Potential Risks and Mitigations

1. **tfhe-rs WASM bundle size**
   - Risk: tfhe-rs WebAssembly binary is large, potentially 15-25MB, impacting SDK load time in browser environments.
   - Mitigation: Use dynamic import to load the WASM only when first encryption is needed. Configure the bundler to place the WASM in a separate chunk with long cache lifetime. Consider offering a lightweight version with only uint32 support for the MVP.

2. **Deterministic coprocessor address conflict**
   - Risk: Using CREATE2 with a fixed salt to deploy FhishCoprocessor at a deterministic address may conflict with an existing contract at that address on Sepolia, causing deployment to fail or deploy to the wrong contract.
   - Mitigation: Before deploying, query Sepolia at the planned address to verify no contract exists there. If conflict detected, use a different salt derived from a salt value plus keccak256 of the contract bytecode. Document the chosen address in FhishConfig.sol.

3. **Gateway is a centralized trust anchor**
   - Risk: The FHISH gateway owns the FHE client key. If the gateway is compromised, all ciphertexts can be decrypted by an attacker.
   - Mitigation: Implement multi-party KMS where the FHE key is split using Shamir Secret Sharing across multiple gateway nodes. Add EIP-712 signing so relayers can detect a compromised gateway. Log all decryption requests for audit.

4. **Async FHE operations introduce latency and complexity**
   - Risk: Each FHE operation (vote accumulation) requires a gateway round-trip, making the voting transaction asynchronous. Users may not see immediate confirmation.
   - Mitigation: Design the contract to accept votes optimistically (with a pending state) and resolve the FHE accumulation asynchronously. Provide clear UI states for pending vs confirmed votes.

5. **node-tfhe API breaking changes**
   - Risk: The node-tfhe npm package may change its API between minor versions, breaking gateway decryption.
   - Mitigation: Pin the node-tfhe version in package.json using exact versioning. Add integration tests in CI that verify decryption works with the pinned version. Document the exact version and installation command.

6. **Transient storage not supported on all EVM networks**
   - Risk: FhishACL uses EIP-1153 transient storage for the allowed mapping, but this requires the Cancun hardfork. Networks running pre-Cancun EVM will fail.
   - Mitigation: Add network detection in FhishACL constructor. If the network does not support transient storage (check by comparing gas cost), fall back to regular storage with cleanup in the same transaction. Write Solidity tests for both paths.

7. **No ZK proof verification on encrypted inputs (Phase 2 MVP gap)**
   - Risk: Without ZK proofs, a malicious user could submit fake encrypted values that are not valid TFHE ciphertexts, potentially breaking vote tallying.
   - Mitigation: For Phase 2 MVP, rely on the gateway KMS signature to prove ciphertext authenticity. Schedule Phase 3 to add FhishInputVerifier with Groth16 or PLONK ZK proof verification. Document this as a known limitation in the SPEC.md.

---

## Alternative Approaches Considered

1. **ZK proof system (PLONK or Groth16) instead of TFHE for client-side encryption**
   - Rejected: ZK proofs for general-purpose integer computation require complex circuits and significant proving time. TFHE is purpose-built for privacy-preserving computation on integers and provides native homomorphism without proof overhead.

2. **Fhenix native EVM precompile at address(128)**
   - Rejected for testnet use: Fhenix requires running a full Fhenix node rather than a standard Ethereum Sepolia node. We reference the Fhenix architecture pattern but cannot deploy to standard testnets. Only usable when FHISH runs its own Fhenix-based network.

3. **Use Zama FHEVM precompiles on Sepolia as the FHE execution layer**
   - Rejected per explicit requirement: FHISH must be fully independent and cannot depend on Zama infrastructure. We reference Zama's architecture patterns (ACL, gateway, coprocessor) but deploy our own contracts.

4. **Synchronous coprocessor with direct gateway calls (no events)**
   - Rejected: A synchronous pattern would require the coprocessor to make external calls and read return values in the same transaction. This is impossible in the EVM since external call results cannot be used in the same transaction for storage writes. The async event-driven pattern is the only viable on-chain approach.

5. **EVM precompile at address(0x80) as a minimal proxy (EIP-1167)**
   - Selected approach: Use CREATE2 with a fixed salt to deploy a minimal proxy clone (EIP-1167) at address(0x80) for a deterministic coprocessor address. This mimics Fhenix's precompile pattern while remaining deployable on standard EVM networks. If CREATE2 fails on a network, fall back to storing the coprocessor address in FhishConfig.sol.

---

## Package Dependency Graph

fhish-demo (Next.js web application):
  Depends on @fhish/sdk for client-side encryption
    Which depends on tfhe-rs WebAssembly bundled in the SDK
      Which consumes fhish_public_key.bin from our gateway
  Depends on PrivateVotingV2 contract on Sepolia

fhish-demo (Next.js):
  Submits transactions to PrivateVotingV2 on Sepolia
    PrivateVotingV2 uses FhishTFHE library for encrypted operations
      FhishTFHE calls FhishCoprocessor at deterministic address
        FhishCoprocessor emits FHEOpRequested events for gateway processing

fhish-relayer-v2 (Node.js service):
  Watches FhishGateway events on Sepolia via JSON-RPC polling
  Calls fhish-gateway over HTTPS at /decrypt endpoint
  Broadcasts fulfillment transactions to FhishGateway on Sepolia

fhish-gateway (Node.js service):
  Serves fhish_public_key.bin and fhish_crs_2048.bin via HTTP
  Reads fhish_client_key.bin from filesystem for tfhe-rs decryption
  Accepts decryption requests from authorized relayers only

packages/fhish-contracts-v2 (Hardhat project):
  Deploys FhishACL, FhishCoprocessor, FhishGateway, and PrivateVotingV2 to Sepolia
  Generates deployments.json as the source of truth for all contract addresses
