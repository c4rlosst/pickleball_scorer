import { useEffect, useLayoutEffect, useReducer, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ref, set } from 'firebase/database'
import ScoreboardView from './ScoreboardView'
import { database, isLiveSyncConfigured } from '@/lib/firebase'
import { generateRoomCode } from '@/lib/roomCode'
import {
  TEAM_ACCENT,
  TEAM_LABELS,
  reducer,
  toPublicState,
  type MatchType,
  type SetupOptions,
  type Team,
} from './gameTypes'

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

  const activeAccent = TEAM_ACCENT[startingServer]

  return (
    <div className="w-full max-w-[420px] mx-auto p-6 flex flex-col gap-5">
      <h2
        className={`text-center text-2xl whitespace-nowrap transition-colors duration-300 ${activeAccent.text}`}
        style={{
          fontFamily: "'Kaushan Script', cursive",
          textShadow: `0 0 12px ${activeAccent.hex}, 0 0 28px ${activeAccent.hex}90`,
        }}
      >
        "age is just a number, and so is the score."
      </h2>

      <Panel label="Match Type">
        <Segmented
          value={matchType}
          onChange={changeMatchType}
          options={[
            { value: 'singles', label: 'Singles' },
            { value: 'doubles', label: 'Doubles' },
          ]}
          pillVariants={[activeAccent.pill, activeAccent.pill]}
        />
      </Panel>

      <Panel label="Play To">
        <Segmented
          value={pointTarget}
          onChange={setPointTarget}
          options={[11, 15, 21].map((n) => ({ value: n, label: String(n) }))}
          pillVariants={[activeAccent.pill, activeAccent.pill, activeAccent.pill]}
        />
        <label className="flex items-center gap-2 text-sm text-neutral-200">
          <input
            type="checkbox"
            checked={winByTwo}
            onChange={(e) => setWinByTwo(e.target.checked)}
            className={`w-[18px] h-[18px] cursor-pointer transition-colors duration-300 ${activeAccent.accent}`}
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

function LiveShare({ roomCode, onStop }: { roomCode: string | null; onStop: () => void }) {
  const [copied, setCopied] = useState(false)

  if (!isLiveSyncConfigured) {
    return (
      <div className="w-full max-w-[420px] rounded-[10px] border border-neutral-700 bg-neutral-900 px-3 py-2 text-center text-xs text-neutral-500">
        Live sync isn't configured yet — add your Firebase project keys to .env to enable it.
      </div>
    )
  }

  if (!roomCode) return null

  const copyCode = () => {
    navigator.clipboard?.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="w-full max-w-[420px] flex items-center justify-between gap-3 rounded-[10px] border border-lime-400/40 bg-lime-500/10 px-4 py-3">
      <div>
        <div className="text-[11px] font-semibold tracking-widest text-lime-300">live · room code</div>
        <button
          type="button"
          onClick={copyCode}
          className="text-2xl font-extrabold tracking-[0.2em] text-lime-300"
        >
          {roomCode}
        </button>
        {copied && <div className="text-[11px] text-lime-400">Copied!</div>}
      </div>
      <button
        type="button"
        onClick={onStop}
        className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:border-red-400/60 hover:text-red-400 transition-colors"
      >
        Stop sharing
      </button>
    </div>
  )
}

function Scorer() {
  const [state, dispatch] = useReducer(reducer, null)
  const [roomCode, setRoomCode] = useState<string | null>(null)

  // Push the latest state to Firebase whenever it changes while live sharing.
  useEffect(() => {
    if (!roomCode || !state || !database) return
    void set(ref(database, `games/${roomCode}`), toPublicState(state))
  }, [roomCode, state])

  const goLive = () => {
    if (!database) return
    setRoomCode(generateRoomCode())
  }

  const stopSharing = () => {
    if (roomCode && database) {
      void set(ref(database, `games/${roomCode}`), null)
    }
    setRoomCode(null)
  }

  if (!state) {
    return <Setup onStart={(setup) => dispatch({ type: 'SETUP', setup })} />
  }

  return (
    <div className="w-full max-w-[680px] mx-auto p-4 flex flex-col gap-6 items-center">
      <ScoreboardView state={state} onPoint={(team) => dispatch({ type: 'POINT', team })} />

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

      {roomCode ? (
        <LiveShare roomCode={roomCode} onStop={stopSharing} />
      ) : isLiveSyncConfigured ? (
        <button
          type="button"
          onClick={goLive}
          className="w-full max-w-[420px] py-3 rounded-[10px] border border-lime-400/40 text-lime-300 text-sm font-semibold hover:bg-lime-500/10 active:scale-[0.98] transition-all duration-150"
        >
          Go live — control from this phone
        </button>
      ) : (
        <LiveShare roomCode={null} onStop={stopSharing} />
      )}
    </div>
  )
}

export default Scorer
