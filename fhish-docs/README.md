# 📚 Fhish Documentation

The **Fhish Documentation** is the primary source of technical and user-facing information for the Fhish ecosystem. It provides comprehensive guides, API references, and architectural deep-dives for developers building private applications on Initia.

## 🚀 Key Content
- **Introduction**: Overview of Fhish's mission to bring privacy to Initia.
- **Protocol Architecture**: Detailed explanation of the FHE stack, Gateway, and Relayer.
- **Developer SDK**: Technical references for the `fhish-sdk-v2`.
- **FHE Guide**: Documentation on how to use Fully Homomorphic Encryption for private smart contracts.
- **MiniEVM Integration**: Guides for deploying on Initia's interwoven stack.

## 🛠️ Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS
- **Interactions**: Framer Motion
- **Content**: MDX-based documentation

---

## 🚀 Getting Started

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
- `settings/`: Configuration for site metadata and branding.
- `lib/`: Logic for parsing MDX and generating sidebars.

## 🌍 Contributing
To update the documentation, modify the markdown files in the `contents/` directory. All changes should follow the standard technical documentation style guide.
