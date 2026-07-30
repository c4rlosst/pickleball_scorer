import { useEffect, useRef, useState } from 'react'
import { ref, onValue, off } from 'firebase/database'
import ScoreboardView from './ScoreboardView'
import { database, isLiveSyncConfigured } from '@/lib/firebase'
import { TEAM_ACCENT, type PublicGameState } from './gameTypes'
import { useAccent } from './AccentContext'

function CodeInput({ onJoin }: { onJoin: (code: string) => void }) {
  const [code, setCode] = useState('')

  return (
    <div className="w-full max-w-[320px] mx-auto flex flex-col gap-4">
      <h2 className="text-center text-white text-xl font-semibold">Watch a live game</h2>
      <p className="text-center text-sm text-neutral-400">
        Enter the room code shown on the phone that's controlling the score.
      </p>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && code.trim().length === 4) onJoin(code.trim())
        }}
        placeholder="ABCD"
        maxLength={4}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-center text-2xl font-extrabold tracking-[0.3em] text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-lime-400/60"
      />
      <button
        type="button"
        onClick={() => code.trim().length === 4 && onJoin(code.trim())}
        disabled={code.trim().length !== 4}
        className="py-3 rounded-xl bg-gradient-to-b from-lime-400 to-lime-500 text-neutral-950 font-bold disabled:opacity-40 disabled:cursor-default active:scale-[0.98] transition-all duration-150"
      >
        Watch
      </button>
    </div>
  )
}

export default function Watch() {
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [remoteState, setRemoteState] = useState<PublicGameState | null>(null)
  const [status, setStatus] = useState<'connecting' | 'live' | 'not-found'>('connecting')
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const { setAccent } = useAccent()

  useEffect(() => {
    if (remoteState) setAccent(TEAM_ACCENT[remoteState.servingTeam])
  }, [remoteState, setAccent])

  useEffect(() => {
    if (!roomCode || !database) return
    setStatus('connecting')
    const gameRef = ref(database, `games/${roomCode}`)
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val() as PublicGameState | null
      if (data) {
        setRemoteState(data)
        setStatus('live')
      } else {
        setRemoteState(null)
        setStatus('not-found')
      }
    })
    unsubscribeRef.current = () => off(gameRef)
    return () => {
      unsubscribe()
      unsubscribeRef.current?.()
    }
  }, [roomCode])

  if (!isLiveSyncConfigured) {
    return (
      <div className="w-full max-w-[420px] mx-auto text-center text-sm text-neutral-500 p-6 rounded-xl border border-neutral-800">
        Live sync isn't configured yet — add your Firebase project keys to .env to enable watching a live
        game.
      </div>
    )
  }

  if (!roomCode) {
    return <CodeInput onJoin={setRoomCode} />
  }

  return (
    <div className="w-full max-w-[680px] mx-auto p-4 flex flex-col gap-6 items-center">
      {status === 'connecting' && <p className="text-neutral-400 text-sm">Connecting to room {roomCode}…</p>}

      {status === 'not-found' && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-neutral-400 text-sm">
            No live game found for room <span className="font-bold text-neutral-200">{roomCode}</span>.
          </p>
          <button
            type="button"
            onClick={() => setRoomCode(null)}
            className="text-sm text-lime-300 hover:text-lime-200"
          >
            Try a different code
          </button>
        </div>
      )}

      {status === 'live' && remoteState && <ScoreboardView state={remoteState} />}

      {status === 'live' && (
        <button
          type="button"
          onClick={() => setRoomCode(null)}
          className="text-sm text-neutral-500 hover:text-neutral-300"
        >
          Leave room {roomCode}
        </button>
      )}
    </div>
  )
}
