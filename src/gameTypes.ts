export type MatchType = 'singles' | 'doubles'
export type Team = 0 | 1

export const TEAM_LABELS: Record<MatchType, [string, string]> = {
  singles: ['Player A', 'Player B'],
  doubles: ['Team A', 'Team B'],
}

// Team 1 = neon orange, Team 2 = neon green (like a pickleball ball)
export interface TeamAccent {
  hex: string
  ring: string
  text: string
  border: string
  glow: string
  bannerBg: string
  hoverBorder: string
  hoverText: string
  pill: string
  pillBorder: string
  accent: string
}

export const TEAM_ACCENT: [TeamAccent, TeamAccent] = [
  {
    hex: '#ff7a00',
    ring: 'ring-[#ff7a00]',
    text: 'text-[#ff7a00]',
    border: 'border-[#ff7a00]/50',
    glow: 'shadow-[0_0_24px_rgba(255,122,0,0.55)]',
    bannerBg: 'bg-[#3a1a00]',
    hoverBorder: 'hover:border-[#ff7a00]/60',
    hoverText: 'hover:text-[#ff7a00]',
    pill: 'bg-gradient-to-b from-[#ff9c33] to-[#ff7a00] shadow-[0_2px_16px_rgba(255,122,0,0.55)]',
    pillBorder: 'border-[#ff7a00]',
    accent: 'accent-[#ff7a00]',
  },
  {
    hex: '#c6ff00',
    ring: 'ring-[#c6ff00]',
    text: 'text-[#c6ff00]',
    border: 'border-[#c6ff00]/50',
    glow: 'shadow-[0_0_24px_rgba(198,255,0,0.55)]',
    bannerBg: 'bg-[#1f2900]',
    hoverBorder: 'hover:border-[#c6ff00]/60',
    hoverText: 'hover:text-[#c6ff00]',
    pill: 'bg-gradient-to-b from-[#d8ff4d] to-[#c6ff00] shadow-[0_2px_16px_rgba(198,255,0,0.55)]',
    pillBorder: 'border-[#c6ff00]',
    accent: 'accent-[#c6ff00]',
  },
]

export interface SetupOptions {
  matchType: MatchType
  pointTarget: number
  winByTwo: boolean
  startingServer: Team
  labels: [string, string]
}

export interface Snapshot {
  scores: [number, number]
  servingTeam: Team
  server: 1 | 2
  firstServeOfGame: boolean
  gameOver: boolean
  winner: Team | null
}

export interface GameState extends Snapshot {
  matchType: MatchType
  pointTarget: number
  winByTwo: boolean
  labels: [string, string]
  history: Snapshot[]
}

// Trimmed view broadcast to remote viewers - no undo history needed over the wire.
export type PublicGameState = Omit<GameState, 'history'>

export function toPublicState(state: GameState): PublicGameState {
  const { history: _history, ...publicState } = state
  return publicState
}

export type Action =
  | { type: 'SETUP'; setup: SetupOptions }
  | { type: 'POINT'; team: Team }
  | { type: 'UNDO' }
  | { type: 'NEW_GAME' }

export function snapshot(state: GameState): Snapshot {
  return {
    scores: [...state.scores],
    servingTeam: state.servingTeam,
    server: state.server,
    firstServeOfGame: state.firstServeOfGame,
    gameOver: state.gameOver,
    winner: state.winner,
  }
}

export function createGameState({
  matchType,
  pointTarget,
  winByTwo,
  startingServer,
  labels,
}: SetupOptions): GameState {
  return {
    matchType,
    pointTarget,
    winByTwo,
    labels,
    scores: [0, 0],
    servingTeam: startingServer,
    server: 2, // start-of-game exception: first serving side only gets one server turn
    firstServeOfGame: true,
    gameOver: false,
    winner: null,
    history: [],
  }
}

export function checkWin(scores: [number, number], pointTarget: number, winByTwo: boolean): Team | null {
  const [a, b] = scores
  if (a === b) return null
  const leader: Team = a > b ? 0 : 1
  const leadScore = scores[leader]
  const otherScore = scores[leader === 0 ? 1 : 0]
  if (leadScore >= pointTarget && (!winByTwo || leadScore - otherScore >= 2)) {
    return leader
  }
  return null
}

export function reducer(state: GameState | null, action: Action): GameState | null {
  switch (action.type) {
    case 'SETUP':
      return createGameState(action.setup)

    case 'POINT': {
      if (!state || state.gameOver) return state
      const team = action.team
      const prev = snapshot(state)
      const scores: [number, number] = [...state.scores]
      let { servingTeam, server, firstServeOfGame } = state

      if (team === servingTeam) {
        // serving side won the rally: point scored, same server continues
        scores[team] += 1
      } else if (state.matchType === 'singles') {
        // singles: no server rotation, immediate side-out
        servingTeam = team
      } else if (firstServeOfGame) {
        // doubles start-of-game exception: immediate side-out on first loss
        servingTeam = team
        server = 1
        firstServeOfGame = false
      } else if (server === 1) {
        // first server lost the rally: second server on same team serves next
        server = 2
      } else {
        // second server lost the rally: side-out to the other team
        servingTeam = team
        server = 1
      }

      const winner = checkWin(scores, state.pointTarget, state.winByTwo)

      return {
        ...state,
        scores,
        servingTeam,
        server,
        firstServeOfGame,
        gameOver: winner !== null,
        winner,
        history: [...state.history, prev],
      }
    }

    case 'UNDO': {
      if (!state || state.history.length === 0) return state
      const prev = state.history[state.history.length - 1]
      return {
        ...state,
        ...prev,
        history: state.history.slice(0, -1),
      }
    }

    case 'NEW_GAME':
      return null

    default:
      return state
  }
}
