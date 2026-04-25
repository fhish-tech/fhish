# Fhish: The Private FHE Layer for Initia 🐟✨

## 📝 Description

Fhish is a comprehensive **Fully Homomorphic Encryption (FHE) Rollup Stack** designed to bring native on-chain privacy to the **Initia** ecosystem. 

In the current blockchain landscape, transparency is a double-edged sword. While it ensures trust, it prevents the adoption of use cases that require strict confidentiality—such as private DAO voting, hidden-order-book DeFi, and secure identity management. 

Fhish solves this by providing a "Privacy Co-processor" layer that operates seamlessly on Initia's **Interwoven Rollup** architecture. By leveraging Initia’s high-performance infrastructure and our custom **MiniEVM** FHE primitives, Fhish allows developers to build decentralized applications where state remains encrypted even during computation.

## 🚀 Key Features

- **Native Initia Integration**: Specifically tuned for [Initia's](https://initia.xyz/) Interwoven network. Fhish rollups can communicate with other L2s while maintaining internal state encryption.
- **Total Infrastructure Independence**: Unlike other FHE solutions, Fhish is 100% self-hosted. We use pure Rust [`tfhe-rs`](https://github.com/zama-ai/tfhe-rs) bindings compiled to WebAssembly. No proprietary cloud decrypters, no external API dependencies—your keys, your privacy.
- **High Performance & Gas Efficiency**: We solve the "Heavy Ciphertext Problem" by using an off-chain Decryption Gateway. Large FHE blobs (16KB+) are stored off-chain, and only lightweight 32-byte "handles" are processed on the MiniEVM, reducing gas costs by 99%.
- **Developer-Centric Tooling**: Our [`fhish-cli`](https://github.com/fhish-tech/fhish-cli) (forked from Initia’s `weave-cli`) provides a 1-click experience to scaffold, deploy, and verify an FHE-private rollup in minutes.

## 🛠️ How it Works (The Fhish Stack)

1. **Client-Side Encryption**: Users encrypt their data (e.g., a vote) directly in their browser using our WASM-powered SDK.
2. **Ciphertext Gateway**: The encrypted blob is sent to the [Fhish Gateway](https://github.com/fhish-tech/fhish-gateway), which returns a content-addressed 32-byte handle.
3. **MiniEVM Interaction**: The user submits the handle to a smart contract on the Initia rollup. The contract performs homomorphic operations on these handles.
4. **FHE Relayer**: An off-chain daemon monitors the chain for "Decryption Requests." It retrieves the ciphertexts, decrypts them in a secure WASM sandbox using evaluation keys, and submits the results back on-chain.

## 🔗 Links

- **Main Monorepo**: [https://github.com/fhish-tech/fhish](https://github.com/fhish-tech/fhish)
- **FHISH CLI**: [https://github.com/fhish-tech/fhish-cli](https://github.com/fhish-tech/fhish-cli)
- **Decryption Gateway**: [https://github.com/fhish-tech/fhish-gateway](https://github.com/fhish-tech/fhish-gateway)
- **Live Demo**: [https://github.com/fhish-tech/fhish-demo](https://github.com/fhish-tech/fhish-demo)
- **WASM FHE Bindings**: [https://github.com/fhish-tech/fhish-wasm](https://github.com/fhish-tech/fhish-wasm)
- **FHE Contracts**: [https://github.com/fhish-tech/fhish-contracts-v2](https://github.com/fhish-tech/fhish-contracts-v2)

## 🌐 Vision

Our mission is to make privacy a default primitive for the Initia ecosystem. We believe that for mass adoption to occur, users must have the same level of privacy they expect from traditional web applications, without sacrificing the decentralization and security of the blockchain.

## 💻 Tech Stack

- **Cryptographic Core**: Rust (`tfhe-rs`), WebAssembly (WASM).
- **Rollup Infrastructure**: Initia SDK, MiniEVM, Cosmos SDK.
- **Tooling**: Go (CLI), Hardhat (Smart Contracts), Next.js (Frontend).
- **Orchestration**: Docker, Ethers.js.

---

**Built for the Initia Interwoven framework. 🐟🔒**
