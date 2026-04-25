import { Link } from "lib/transition"

import { PageRoutes } from "@/lib/pageroutes"
import { buttonVariants } from "@/components/ui/button"

export default function Home() {
  return (
    <section className="flex min-h-[86.5vh] flex-col items-center justify-center px-2 py-8 text-center bg-background">
      <div className="flex flex-col items-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-8xl bg-linear-to-b from-primary to-primary/60 bg-clip-text text-transparent">
          Fhish
        </h1>
        <p className="text-xl text-muted-foreground max-w-[700px] leading-relaxed">
          The privacy-first FHE Rollup stack built for the Initia network.
          Compute on encrypted data with high throughput and seamless developer experience.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href={`/docs${PageRoutes[0].href}`}
            className={buttonVariants({ className: "px-8 h-12 text-lg font-medium", size: "lg" })}
          >
            Get Started
          </Link>
          <Link
            href="https://github.com/fhish-tech"
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({
              variant: "outline",
              className: "px-8 h-12 text-lg font-medium bg-background/50 backdrop-blur-sm",
              size: "lg"
            })}
          >
            GitHub
          </Link>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-6xl mx-auto px-4">
        {[
          { title: "FHE Privacy", description: "Compute on encrypted data without ever revealing the underlying plaintext." },
          { title: "Initia Interwoven", description: "Built specifically for Initia's high-performance rollup architecture." },
          { title: "Developer First", description: "Standard Solidity support with powerful FHE precompiles and CLI." }
        ].map((feature, i) => (
          <div key={i} className="flex flex-col items-center p-6 rounded-2xl border bg-card/50 backdrop-blur-xs hover:border-primary/50 transition-colors">
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
