import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-blue-500/10 text-blue-400 shadow hover:bg-blue-500/20",
    secondary: "border-transparent bg-white/5 text-white/60 hover:bg-white/10",
    destructive: "border-transparent bg-red-500/10 text-red-500 shadow hover:bg-red-500/20",
    outline: "text-white/40 border-white/10",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-bold transition-colors uppercase tracking-wider",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
