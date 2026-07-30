import { useLayoutEffect, useReducer, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import StatCard from '@/components/ui/stat-card'

type MatchType = 'singles' | 'doubles'
type Team = 0 | 1

const TEAM_LABELS: Record<MatchType, [string, string]> = {
  singles: ['Player A', 'Player B'],
  doubles: ['Team A', 'Team B'],
}

// Team 1 = neon orange, Team 2 = neon green (like a pickleball ball)
interface TeamAccent {
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
}

const TEAM_ACCENT: [TeamAccent, TeamAccent] = [
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
  },
]

interface SetupOptions {
  matchType: MatchType
  pointTarget: number
  winByTwo: boolean
  startingServer: Team
  labels: [string, string]
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
  labels: [string, string]
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

function createGameState({ matchType, pointTarget, winByTwo, startingServer, labels }: SetupOptions): GameState {
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
  pillVariants,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  pillVariants?: string[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [rect, setRect] = useState<{ left: number; width: number } | null>(null)
  const activeIndex = options.findIndex((o) => o.value === value)

  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current
      const btn = buttonRefs.current[activeIndex]
      if (container && btn) {
        const containerBox = container.getBoundingClientRect()
        const btnBox = btn.getBoundingClientRect()
        setRect({ left: btnBox.left - containerBox.left, width: btnBox.width })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activeIndex, options.length])

  return (
    <div ref={containerRef} className="relative flex gap-2">
      {rect && (
        <motion.div
          className={`absolute top-0 bottom-0 rounded-lg transition-colors duration-300 ${
            pillVariants?.[activeIndex] ??
            'bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_2px_12px_rgba(245,158,11,0.5)]'
          }`}
          animate={{ left: rect.left, width: rect.width }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      {options.map((option, i) => {
        const isActive = value === option.value
        return (
          <button
            key={String(option.value)}
            ref={(el) => {
              buttonRefs.current[i] = el
            }}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative z-10 flex-1 py-2.5 rounded-lg text-sm border transition-colors duration-200 active:scale-[0.96] ${
              isActive
                ? 'text-neutral-950 font-semibold border-transparent'
                : 'border-white/10 text-neutral-300 shadow-inner shadow-black/40 hover:border-white/25'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function TeamNameInput({
  names,
  onChange,
  max,
  placeholder,
}: {
  names: string[]
  onChange: (names: string[]) => void
  max: number
  placeholder: string
}) {
  const [draft, setDraft] = useState('')

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && names.length < max) {
      onChange([...names, trimmed])
    }
    setDraft('')
  }

  const remove = (index: number) => {
    onChange(names.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      {names.length < max && (
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              commit()
            }
          }}
          placeholder={placeholder}
          maxLength={20}
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400/60"
        />
      )}
      {names.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {names.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 pl-3 pr-2 py-1 text-sm text-amber-300"
            >
              {name}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove ${name}`}
                className="flex h-4 w-4 items-center justify-center rounded-full text-amber-400/70 hover:text-amber-300 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
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
  const [namesA, setNamesA] = useState<string[]>([])
  const [namesB, setNamesB] = useState<string[]>([])
  const defaultLabels = TEAM_LABELS[matchType]
  const isDoubles = matchType === 'doubles'
  const maxPerTeam = isDoubles ? 2 : 1

  const changeMatchType = (next: MatchType) => {
    setMatchType(next)
    const cap = next === 'doubles' ? 2 : 1
    setNamesA((prev) => prev.slice(0, cap))
    setNamesB((prev) => prev.slice(0, cap))
  }

  const labels: [string, string] = [
    namesA.length > 0 ? namesA.join(' & ') : defaultLabels[0],
    namesB.length > 0 ? namesB.join(' & ') : defaultLabels[1],
  ]

  return (
    <div className="w-full max-w-[420px] mx-auto p-6 flex flex-col gap-5">
      <h2 className="text-center text-white text-xl font-semibold">New Game</h2>

      <Panel label="Match Type">
        <Segmented
          value={matchType}
          onChange={changeMatchType}
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
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-500">
              {defaultLabels[0]} {isDoubles ? 'players' : 'name'}
            </span>
            <TeamNameInput
              names={namesA}
              onChange={setNamesA}
              max={maxPerTeam}
              placeholder={defaultLabels[0]}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-500">
              {defaultLabels[1]} {isDoubles ? 'players' : 'name'}
            </span>
            <TeamNameInput
              names={namesB}
              onChange={setNamesB}
              max={maxPerTeam}
              placeholder={defaultLabels[1]}
            />
          </div>
        </div>
        <Segmented
          value={startingServer}
          onChange={setStartingServer}
          options={[
            { value: 0 as Team, label: labels[0] },
            { value: 1 as Team, label: labels[1] },
          ]}
          pillVariants={[TEAM_ACCENT[0].pill, TEAM_ACCENT[1].pill]}
        />
      </Panel>

      <button
        type="button"
        onClick={() => onStart({ matchType, pointTarget, winByTwo, startingServer, labels })}
        className={`mt-2 py-4 rounded-xl text-neutral-950 font-bold text-lg active:scale-[0.98] transition-all duration-300 ${TEAM_ACCENT[startingServer].pill}`}
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

  const labels = state.labels

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
              state.servingTeam === 0
                ? `ring-2 ring-offset-2 ring-offset-black transition-colors duration-300 ${TEAM_ACCENT[0].ring} ${TEAM_ACCENT[0].glow}`
                : ''
            }
          />
        </button>

        <div
          className={`flex flex-col items-center justify-center gap-1 w-[160px] h-[180px] rounded-xl border bg-gradient-to-br from-neutral-800 via-neutral-900 to-black px-3 text-center transition-all duration-300 ${TEAM_ACCENT[state.servingTeam].border} ${TEAM_ACCENT[state.servingTeam].glow}`}
        >
          <span className={`text-sm font-semibold transition-colors duration-300 ${TEAM_ACCENT[state.servingTeam].text}`}>
            {labels[state.servingTeam]}
          </span>
          {state.matchType === 'doubles' ? (
            <>
              <span className="text-7xl font-extrabold leading-none text-white">
                {state.server}
              </span>
              <span className="text-[11px] font-semibold tracking-widest text-neutral-400">
                server
              </span>
            </>
          ) : (
            <>
              <span className="text-6xl leading-none">{'\u{1F3D3}'}</span>
              <span className="text-[11px] font-semibold tracking-widest text-neutral-400">
                serving
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
              state.servingTeam === 1
                ? `ring-2 ring-offset-2 ring-offset-black transition-colors duration-300 ${TEAM_ACCENT[1].ring} ${TEAM_ACCENT[1].glow}`
                : ''
            }
          />
        </button>
      </div>

      {state.gameOver && state.winner !== null && (
        <div
          className={`w-full text-center py-3 rounded-lg border font-bold text-lg animate-fade-in-up transition-colors duration-300 ${TEAM_ACCENT[state.winner].bannerBg} ${TEAM_ACCENT[state.winner].border} ${TEAM_ACCENT[state.winner].text}`}
        >
          {labels[state.winner]} wins!
        </div>
      )}

      <div className="flex gap-3 w-full max-w-[420px]">
        <button
          type="button"
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={state.history.length === 0}
          className={`flex-1 py-3 rounded-[10px] border border-neutral-700 bg-neutral-900 text-neutral-200 text-sm hover:bg-neutral-800 active:scale-[0.96] disabled:opacity-50 disabled:cursor-default disabled:active:scale-100 transition-all duration-150 ${TEAM_ACCENT[state.servingTeam].hoverBorder} ${TEAM_ACCENT[state.servingTeam].hoverText}`}
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'NEW_GAME' })}
          className={`flex-1 py-3 rounded-[10px] border border-neutral-700 bg-neutral-900 text-neutral-200 text-sm hover:bg-neutral-800 active:scale-[0.96] transition-all duration-150 ${TEAM_ACCENT[state.servingTeam].hoverBorder} ${TEAM_ACCENT[state.servingTeam].hoverText}`}
        >
          New Game
        </button>
      </div>
    </div>
  )
}

export default Scorer
