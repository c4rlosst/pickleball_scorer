import { useReducer, useState } from 'react'
import StatCard from '@/components/ui/stat-card'

type MatchType = 'singles' | 'doubles'
type Team = 0 | 1

const TEAM_LABELS: Record<MatchType, [string, string]> = {
  singles: ['Player A', 'Player B'],
  doubles: ['Team A', 'Team B'],
}

interface SetupOptions {
  matchType: MatchType
  pointTarget: number
  winByTwo: boolean
  startingServer: Team
}

interface Snapshot {
  scores: [number, number]
  servingTeam: Team
  server: 1 | 2
  firstServeOfGame: boolean
  gameOver: boolean
  winner: Team | null
}

interface GameState extends Snapshot {
  matchType: MatchType
  pointTarget: number
  winByTwo: boolean
  history: Snapshot[]
}

type Action =
  | { type: 'SETUP'; setup: SetupOptions }
  | { type: 'POINT'; team: Team }
  | { type: 'UNDO' }
  | { type: 'NEW_GAME' }

function snapshot(state: GameState): Snapshot {
  return {
    scores: [...state.scores],
    servingTeam: state.servingTeam,
    server: state.server,
    firstServeOfGame: state.firstServeOfGame,
    gameOver: state.gameOver,
    winner: state.winner,
  }
}

function createGameState({ matchType, pointTarget, winByTwo, startingServer }: SetupOptions): GameState {
  return {
    matchType,
    pointTarget,
    winByTwo,
    scores: [0, 0],
    servingTeam: startingServer,
    server: 2, // start-of-game exception: first serving side only gets one server turn
    firstServeOfGame: true,
    gameOver: false,
    winner: null,
    history: [],
  }
}

function checkWin(scores: [number, number], pointTarget: number, winByTwo: boolean): Team | null {
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

function reducer(state: GameState | null, action: Action): GameState | null {
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

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 py-2.5 rounded-lg text-sm border transition-colors ${
            value === option.value
              ? 'bg-green-600 border-green-600 text-white font-semibold'
              : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-neutral-500'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function Setup({ onStart }: { onStart: (setup: SetupOptions) => void }) {
  const [matchType, setMatchType] = useState<MatchType>('doubles')
  const [pointTarget, setPointTarget] = useState(11)
  const [winByTwo, setWinByTwo] = useState(true)
  const [startingServer, setStartingServer] = useState<Team>(0)
  const labels = TEAM_LABELS[matchType]

  return (
    <div className="w-full max-w-[420px] mx-auto p-6 flex flex-col gap-6">
      <h2 className="text-center text-white text-xl font-semibold">New Game</h2>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-neutral-400">Match Type</label>
        <Segmented
          value={matchType}
          onChange={setMatchType}
          options={[
            { value: 'singles', label: 'Singles' },
            { value: 'doubles', label: 'Doubles' },
          ]}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-neutral-400">Play To</label>
        <Segmented
          value={pointTarget}
          onChange={setPointTarget}
          options={[11, 15, 21].map((n) => ({ value: n, label: String(n) }))}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-200">
        <input
          type="checkbox"
          checked={winByTwo}
          onChange={(e) => setWinByTwo(e.target.checked)}
          className="accent-green-600"
        />
        Win by 2
      </label>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-neutral-400">First Serve</label>
        <Segmented
          value={startingServer}
          onChange={setStartingServer}
          options={[
            { value: 0 as Team, label: labels[0] },
            { value: 1 as Team, label: labels[1] },
          ]}
        />
      </div>

      <button
        type="button"
        onClick={() => onStart({ matchType, pointTarget, winByTwo, startingServer })}
        className="mt-2 py-3.5 rounded-[10px] bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors"
      >
        Start Game
      </button>
    </div>
  )
}

function Scorer() {
  const [state, dispatch] = useReducer(reducer, null)

  if (!state) {
    return <Setup onStart={(setup) => dispatch({ type: 'SETUP', setup })} />
  }

  const labels = TEAM_LABELS[state.matchType]

  return (
    <div className="w-full max-w-[680px] mx-auto p-4 flex flex-col gap-6 items-center">
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap items-center justify-center">
        {([0, 1] as const).map((team) => (
          <div key={team} className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'POINT', team })}
              disabled={state.gameOver}
              className="block cursor-pointer disabled:opacity-70 disabled:cursor-default"
            >
              <StatCard
                value={String(state.scores[team])}
                label={labels[team]}
                className={
                  state.servingTeam === team
                    ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-black'
                    : ''
                }
              />
            </button>
            <span className="h-6 text-sm font-semibold text-amber-400">
              {state.servingTeam === team
                ? `${'\u{1F3D3}'} ${state.matchType === 'doubles' ? `Server ${state.server}` : 'Serving'}`
                : ''}
            </span>
          </div>
        ))}
      </div>

      {state.gameOver && state.winner !== null && (
        <div className="w-full text-center py-3 rounded-lg bg-green-950 border border-green-800 text-green-400 font-bold text-lg">
          {labels[state.winner]} wins!
        </div>
      )}

      <div className="flex gap-3 w-full max-w-[420px]">
        <button
          type="button"
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={state.history.length === 0}
          className="flex-1 py-3 rounded-[10px] border border-neutral-700 bg-neutral-900 text-neutral-200 text-sm hover:border-neutral-500 disabled:opacity-50 disabled:cursor-default transition-colors"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'NEW_GAME' })}
          className="flex-1 py-3 rounded-[10px] border border-neutral-700 bg-neutral-900 text-neutral-200 text-sm hover:border-neutral-500 transition-colors"
        >
          New Game
        </button>
      </div>
    </div>
  )
}

export default Scorer
