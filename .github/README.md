# Fhish: The Private FHE Layer for Initia 🐟✨

Fhish is a specialized **Fully Homomorphic Encryption (FHE) Rollup Stack** built to bring native on-chain privacy to the **Initia** ecosystem. By leveraging Initia's **Interwoven Rollup** architecture and the **MiniEVM**, Fhish enables developers to build decentralized applications where state remains encrypted even during computation.

## 🌟 Why Fhish on Initia?

Initia provides the perfect foundation for Fhish due to its high-performance, modular infrastructure. Fhish extends this by adding a "Privacy Co-processor" layer:

- **Interwoven Interoperability**: Fhish rollups can seamlessly communicate with other Initia L2s while keeping internal state private.
- **MiniEVM Optimization**: Our stack is specifically tuned for Initia's MiniEVM, providing a familiar Solidity development experience with privacy-preserving primitives.
- **Gas Efficiency**: By using specialized `shortint` types and an off-chain Gateway for ciphertext storage, Fhish minimizes the gas overhead traditionally associated with FHE on EVM.

## 🏗️ The Fhish Stack

Fhish is a complete, end-to-end ecosystem:

- **[fhish-cli](https://github.com/fhish-tech/fhish-cli)**: The developer's Swiss Army Knife. Scaffold, deploy, and manage FHE rollups with a single command. Forked and enhanced from Initia's `weave-cli`.
- **[fhish-gateway](https://github.com/fhish-tech/fhish-gateway)**: A high-performance ciphertext data-availability layer. It stores the heavy FHE blobs (16KB+) off-chain, returning lightweight 32-byte handles to the MiniEVM.
- **[fhish-relayer-v2](https://github.com/fhish-tech/fhish-relayer-v2)**: The "engine room" of privacy. It monitors the chain, retrieves ciphertexts from the Gateway, performs secure decryption via WASM, and fulfills results back to the rollup.
- **[fhish-wasm](https://github.com/fhish-tech/fhish-wasm)**: Pure Rust `tfhe-rs` bindings compiled to WebAssembly. This provides the cryptographic backbone for both the browser (client-side encryption) and the Node.js environment (relayer decryption).
- **[fhish-contracts-v2](https://github.com/fhish-tech/fhish-contracts-v2)**: Developer-friendly Solidity interfaces. Add FHE to your Initia app by simply inheriting from `FhishGatewayCaller`.

## 🛡️ Core Philosophy: Total Independence

Fhish is built from the ground up using **tfhe-rs**. We have zero external service dependencies—no hosted decryption keys, no proprietary cloud providers. 
- **Your Keys**: Generated natively via `fhish keys generate-fhe`.
- **Your Infrastructure**: Self-hosted gateways and relayers.
- **Your Privacy**: End-to-end encryption from the user's wallet to the smart contract fulfillment.

Join us in building the most private corner of the Initia Interwoven network! 🐟🔒
