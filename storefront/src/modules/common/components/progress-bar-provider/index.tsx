"use client"

import { AppProgressProvider } from "@bprogress/next"

const NProgressProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppProgressProvider
      height="2.5px"
      color="var(--bg-interactive)"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </AppProgressProvider>
  )
}

export default NProgressProvider
