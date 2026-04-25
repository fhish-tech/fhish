import { Paths } from "@/lib/pageroutes"

export const Documents: Paths[] = [
  {
    title: "Introduction",
    href: "",
  },
  {
    title: "Protocol Architecture",
    href: "/architecture",
  },
  {
    title: "Protocol Core",
    href: "/protocol",
    items: [
      {
        title: "Smart Contracts",
        href: "/smart-contracts",
      },
      {
        title: "FHEVM Privacy",
        href: "/fhevm",
      },
      {
        title: "AMM Pools & Yield",
        href: "/amm-pools",
      },
    ],
  },
  {
    title: "Fhish Core",
    href: "/core",
    items: [
      {
        title: "Overview",
        href: "/overview",
      },
    ],
  },
  {
    spacer: true,
  },
  {
    title: "Applications",
    href: "/apps",
    items: [
      {
        title: "Merchant App",
        href: "/merchant-app",
      },
      {
        title: "Shopping App",
        href: "/shopping-app",
      },
      {
        title: "Checkout App",
        href: "/checkout-app",
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
        title: "Installation",
        href: "/installation",
      },
    ],
  },
  {
    spacer: true,
  },
  {
    title: "Developer Guide",
    href: "/developers",
  },
]
