import Image from "next/image"
import Link from "next/link"

import { companylink, companyname, siteicon, sitename } from "@/settings/main"

export function Footer() {
  return (
    <footer className="flex h-16 w-full flex-wrap items-center justify-center gap-4 border-t px-2 py-3 text-sm text-foreground sm:justify-between sm:gap-0 sm:px-4 sm:py-0 lg:px-8">
      <p className="items-center">
        &copy; {new Date().getFullYear()}{" "}
        <Link
          title={sitename}
          aria-label={sitename}
          className="font-semibold"
          href={companylink}
        >
          {companyname}
        </Link>
        .
      </p>
      <div className="hidden items-center md:block">
        <Link
          className="font-semibold"
          href={companylink}
          title={companyname}
          aria-label={companyname}
          target="_blank"
        >
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Powered by</span>
            <span className="font-bold text-primary">{companyname}</span>
          </div>
        </Link>
      </div>
    </footer>
  )
}
