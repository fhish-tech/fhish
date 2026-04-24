# Fhish Private FHE Rollup Stack

Fhish is a comprehensive Fully Homomorphic Encryption (FHE) rollup stack designed to bring privacy-preserving smart contracts to the Initia ecosystem. It allows developers to deploy private applications on an EVM-compatible layer where transaction data remains encrypted off-chain, and computations are fulfilled securely via an FHE co-processor infrastructure.

## Stack Overview

The repository is structured as a monorepo containing all the necessary components to run a localized FHE rollup:

1. **`fhish-cli/`**: The main Go-based orchestration CLI (forked from Initia `weave-cli`). It dynamically manages the provisioning of the rollup node, key generation, and smart contract deployments.
2. **`fhish-gateway/`**: A Node.js API server that acts as a decentralized ciphertext data-availability layer, storing heavy 16KB FHE blobs off-chain to save EVM gas costs.
3. **`packages/fhish-relayer-v2/`**: A daemon that watches the EVM for FHE execution requests, decrypts ciphertexts via WASM bindings, and commits the results back on-chain.
4. **`packages/fhish-contracts-v2/`**: The core Solidity contracts including the `FhishGateway` router and a sample `PrivateVotingV2` application.
5. **`packages/fhish-sdk-v2/`**: The TypeScript SDK used by frontends and verifiers to encrypt data and interact with the Gateway.
6. **`packages/fhish-wasm/`**: Rust `tfhe-rs` bindings compiled to WASM, providing native node/browser FHE primitives.

## Quickstart (Docker Verification)

The fastest way to verify the stack locally is by running the End-to-End Docker verification suite, which spins up the entire infrastructure and executes an encrypted vote.

```bash
cd fhish-cli
docker compose -f docker/docker-compose.yml --profile verify up --build
```

This command will:
- Boot an Initia MiniEVM node.
- Start the FHE Gateway and load the 118MB evaluation keys.
- Deploy the smart contracts via Hardhat.
- Run the Relayer.
- Spin up a `verifier` container that casts an encrypted vote `(A=1, B=0)` and successfully polls the chain to assert the decrypted tally.

## Using the CLI natively
The `fhish` CLI can also run natively without Docker:
```bash
cd fhish-cli
go build -o fhish .
./fhish create all
```

## Documentation

- [SPEC.md](SPEC.md) - Technical specification
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [PLAN.md](PLAN.md) - Build process
- [ROADMAP.md](ROADMAP.md) - Future goals

## License

BSD-3-Clause-Clear
