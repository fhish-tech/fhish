import { ThemeProvider } from "@/providers/theme"

import { ViewTransitions } from "@/lib/transition"

export const Providers: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ViewTransitions>{children}</ViewTransitions>
    </ThemeProvider>
  )
}
