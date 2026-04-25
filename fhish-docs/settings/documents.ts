import { Paths } from "@/lib/pageroutes"

export const Documents: Paths[] = [
  {
    title: "Introduction",
    href: "",
  },
  {
    title: "Architecture",
    href: "/architecture",
    items: [
      {
        title: "The FHE Gateway",
        href: "/gateway",
      },
      {
        title: "The FHE Relayer",
        href: "/relayer",
      },
      {
        title: "FHE Precompiles",
        href: "/precompiles",
      },
    ],
  },
  {
    title: "Fhish Core",
    href: "/core",
    items: [
      {
        title: "FHE Protocol",
        href: "/protocol",
      },
      {
        title: "MiniEVM Integration",
        href: "/minievm",
      },
      {
        title: "WASM Engine",
        href: "/wasm",
      },
    ],
  },
  {
    spacer: true,
  },
  {
    title: "Getting Started",
    href: "/getting-started",
    items: [
      {
        title: "CLI Installation",
        href: "/installation",
      },
      {
        title: "Quickstart Guide",
        href: "/quickstart",
      },
    ],
  },
  {
    spacer: true,
  },
  {
    title: "Developer Guides",
    href: "/developers",
    items: [
      {
        title: "Writing FHE Contracts",
        href: "/writing-contracts",
      },
      {
        title: "CLI Reference",
        href: "/cli-reference",
      },
    ],
  },
]
