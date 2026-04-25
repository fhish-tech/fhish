The **Fhish Documentation** is the primary source of technical and user-facing information for the Fhish ecosystem.

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Client ["Client Side"]
        User["User App"]
        WASM["fhish-wasm"]
        User -->|Encrypt| WASM
    end

    subgraph OnChain ["Initia MiniEVM"]
        SC["Smart Contract"]
        Pre["FHE Precompiles"]
        User -->|Encrypted Tx| SC
        SC <-->|Private Logic| Pre
    end

    subgraph Infrastructure ["FHE Stack"]
        Relayer["FHE Relayer"]
        Gateway["FHE Gateway"]
        Relayer <-->|Fetch| SC
        Relayer <-->|Decrypt| Gateway
        Gateway -->|Result| SC
    end

    style User fill:#2563eb,stroke:#fff,color:#fff
    style SC fill:#7c3aed,stroke:#fff,color:#fff
    style Gateway fill:#059669,stroke:#fff,color:#fff
    style Relayer fill:#d97706,stroke:#fff,color:#fff
```

## 🚀 Quick Start with v0.1.8

The documentation site now includes the latest **v0.1.8** "Wizard Way" setup guide. 

### Key CLI Workflows:
- **`fhish create all`**: The new interactive entry point for full stack provisioning.
- **`fhish docker verify`**: The standard way to validate FHE protocol health.
- **`fhish version`**: Ensure you are on the latest release for the hackathon.

---

## 🚀 Local Development

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the documentation portal.

---

## 📁 Directory Structure
- `contents/`: All MDX documentation files.
- `app/`: Next.js page structure for the documentation site.
- `components/`: UI components for the documentation interface.

## 🌍 Contributing
To update the documentation, modify the markdown files in the `contents/` directory.
