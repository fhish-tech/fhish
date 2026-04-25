# 🐟 Fhish: DoraHacks Hackathon Video Script

**Duration**: ~3 Minutes
**Topic**: Private FHE Rollups on Initia

---

## 🎬 Scene 1: The Hook
**Visual**: Fhish logo morphing into Initia Interwoven graphic.
**Audio (VO)**: "The blockchain is a glass house. While transparency ensures trust, it’s a barrier for privacy-sensitive applications like DAO voting, confidential DeFi, and private identity. Meet Fhish—the specialized FHE rollup stack built natively for the Initia ecosystem."

---

## 🎬 Scene 2: The Problem
**Visual**: Standard block explorer showing raw transaction data. Red X over "Confidentiality".
**Audio (VO)**: "Currently, every vote cast and every asset moved is public. Existing privacy solutions are either siloed or rely on proprietary cloud decrypters. Fhish changes that by bringing decentralized, self-hosted Fully Homomorphic Encryption to Initia’s Interwoven network."

---

## 🎬 Scene 3: Demo - The CLI
**Visual**: Terminal recording. Running `fhish keys generate-fhe`.
**Audio (VO)**: "It all starts with the Fhish CLI. Forked from Initia’s Weave CLI, it allows developers to generate secure FHE evaluation keys natively. No external service, no trusted setup. Just your machine generating the cryptographic backbone for your private rollup."

---

## 🎬 Scene 4: Demo - The Frontend
**Visual**: `fhish-demo` screen. Clicking "Connect Wallet" (using Initia Interwoven Kit).
**Audio (VO)**: "On the frontend, users experience seamless privacy. Using the Initia Interwoven Kit, we connect securely to our MiniEVM rollup. When casting a vote, our WASM-powered SDK encrypts the data directly in the browser."

---

## 🎬 Scene 5: The Technical Magic
**Visual**: Diagram showing Ciphertext -> Gateway -> Relayer -> Decryption.
**Audio (VO)**: "A content-addressed handle is submitted to the MiniEVM, while the heavy 16KB ciphertext blob stays in our Fhish Gateway. The tally remains encrypted on-chain until the reveal phase, where our off-chain Relayer performs the heavy decryption in a secure WASM sandbox and pushes the result back to Initia."

---

## 🎬 Scene 6: The Vision
**Visual**: Dynamic logo animation with "Privacy is Natively Interwoven".
**Audio (VO)**: "Fhish is more than just a rollup; it’s the privacy layer Initia has been waiting for. Secure, independent, and natively interwoven. Let’s build a private future on Initia together. Visit us at fhish-tech on GitHub."

---
