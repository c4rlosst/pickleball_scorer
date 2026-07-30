import { useId, useReducer, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
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
  const groupId = useId()

  return (
    <div className="flex gap-2">
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative flex-1 overflow-hidden py-2.5 rounded-lg text-sm border transition-colors duration-200 active:scale-[0.96] ${
              isActive
                ? 'border-amber-300 text-neutral-950 font-semibold'
                : 'border-white/10 text-neutral-300 shadow-inner shadow-black/40 hover:border-white/25'
            }`}
          >
            {isActive ? (
              <motion.span
                layoutId={`${groupId}-highlight`}
                className="absolute inset-0 bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_2px_12px_rgba(245,158,11,0.5)]"
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
            ) : (
              <span className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-black/40" />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function Panel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black p-4">
      <label className="text-sm font-semibold tracking-wide text-neutral-400">{label}</label>
      {children}
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
    <div className="w-full max-w-[420px] mx-auto p-6 flex flex-col gap-5">
      <h2 className="text-center text-white text-xl font-semibold">New Game</h2>

      <Panel label="Match Type">
        <Segmented
          value={matchType}
          onChange={setMatchType}
          options={[
            { value: 'singles', label: 'Singles' },
            { value: 'doubles', label: 'Doubles' },
          ]}
        />
      </Panel>

      <Panel label="Play To">
        <Segmented
          value={pointTarget}
          onChange={setPointTarget}
          options={[11, 15, 21].map((n) => ({ value: n, label: String(n) }))}
        />
        <label className="flex items-center gap-2 text-sm text-neutral-200">
          <input
            type="checkbox"
            checked={winByTwo}
            onChange={(e) => setWinByTwo(e.target.checked)}
            className="w-[18px] h-[18px] accent-amber-500 cursor-pointer"
          />
          Win by 2
        </label>
      </Panel>

      <Panel label="First Serve">
        <Segmented
          value={startingServer}
          onChange={setStartingServer}
          options={[
            { value: 0 as Team, label: labels[0] },
            { value: 1 as Team, label: labels[1] },
          ]}
        />
      </Panel>

      <button
        type="button"
        onClick={() => onStart({ matchType, pointTarget, winByTwo, startingServer })}
        className="mt-2 py-4 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-neutral-950 font-bold text-lg shadow-[0_4px_24px_rgba(245,158,11,0.45)] hover:shadow-[0_6px_28px_rgba(245,158,11,0.6)] active:scale-[0.98] transition-all duration-150"
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
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-center">
        <button
          type="button"
          onClick={() => dispatch({ type: 'POINT', team: 0 })}
          disabled={state.gameOver}
          className="block cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-70 disabled:cursor-default disabled:hover:scale-100"
        >
          <StatCard
            value={String(state.scores[0])}
            label={labels[0]}
            className={
              state.servingTeam === 0 ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-black' : ''
            }
          />
        </button>

        <div className="flex flex-col items-center justify-center gap-1 w-[160px] h-[180px] rounded-xl border border-white/10 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black px-3 text-center">
          <span className="text-sm font-semibold text-amber-400">
            {labels[state.servingTeam]}
          </span>
          {state.matchType === 'doubles' ? (
            <>
              <span className="text-7xl font-extrabold leading-none text-white">
                {state.server}
              </span>
              <span className="text-[11px] font-semibold tracking-widest text-neutral-400">
                SERVER
              </span>
            </>
          ) : (
            <>
              <span className="text-6xl leading-none">{'\u{1F3D3}'}</span>
              <span className="text-[11px] font-semibold tracking-widest text-neutral-400">
                SERVING
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: 'POINT', team: 1 })}
          disabled={state.gameOver}
          className="block cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-70 disabled:cursor-default disabled:hover:scale-100"
        >
          <StatCard
            value={String(state.scores[1])}
            label={labels[1]}
            className={
              state.servingTeam === 1 ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-black' : ''
            }
          />
        </button>
      </div>

      {state.gameOver && state.winner !== null && (
        <div className="w-full text-center py-3 rounded-lg bg-amber-950 border border-amber-800 text-amber-400 font-bold text-lg animate-fade-in-up">
          {labels[state.winner]} wins!
        </div>
      )}

      <div className="flex gap-3 w-full max-w-[420px]">
        <button
          type="button"
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={state.history.length === 0}
          className="flex-1 py-3 rounded-[10px] border border-neutral-700 bg-neutral-900 text-neutral-200 text-sm hover:border-amber-400/60 hover:text-amber-400 hover:bg-neutral-800 active:scale-[0.96] disabled:opacity-50 disabled:cursor-default disabled:active:scale-100 transition-all duration-150"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'NEW_GAME' })}
          className="flex-1 py-3 rounded-[10px] border border-neutral-700 bg-neutral-900 text-neutral-200 text-sm hover:border-amber-400/60 hover:text-amber-400 hover:bg-neutral-800 active:scale-[0.96] transition-all duration-150"
        >
          New Game
        </button>
      </div>
    </div>
  )
}

export default Scorer
