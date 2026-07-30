import { createContext, useContext, useState, type ReactNode } from 'react'
import { TEAM_ACCENT, type TeamAccent } from './gameTypes'

interface AccentContextValue {
  accent: TeamAccent
  setAccent: (accent: TeamAccent) => void
}

const AccentContext = createContext<AccentContextValue>({
  accent: TEAM_ACCENT[0],
  setAccent: () => {},
})

export function AccentProvider({ children }: { children: ReactNode }) {
  const [accent, setAccent] = useState<TeamAccent>(TEAM_ACCENT[0])
  return <AccentContext.Provider value={{ accent, setAccent }}>{children}</AccentContext.Provider>
}

export function useAccent() {
  return useContext(AccentContext)
}
