import { createContext, useContext } from 'react'
import { useBlinkProxyDemo } from '../hooks/useBlinkProxyDemo'

const DarkAgentContext = createContext(null)

export function DarkAgentProvider({ children }) {
  const value = useBlinkProxyDemo()
  return <DarkAgentContext.Provider value={value}>{children}</DarkAgentContext.Provider>
}

export function useDarkAgent() {
  const context = useContext(DarkAgentContext)
  if (!context) {
    throw new Error('useDarkAgent must be used within a DarkAgentProvider')
  }
  return context
}
