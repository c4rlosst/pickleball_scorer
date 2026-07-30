import StatCard from '@/components/ui/stat-card'
import PickleballIcon from '@/components/PickleballIcon'
import { TEAM_ACCENT, checkWin, type PublicGameState, type Team } from './gameTypes'

export default function ScoreboardView({
  state,
  onPoint,
}: {
  state: PublicGameState
  onPoint?: (team: Team) => void
}) {
  const labels = state.labels

  // Only the serving team can score the next rally, so they're the only one
  // who can be at match point.
  const hypotheticalScores: [number, number] = [...state.scores]
  hypotheticalScores[state.servingTeam] += 1
  const matchPointTeam: Team | null =
    !state.gameOver && checkWin(hypotheticalScores, state.pointTarget, state.winByTwo) === state.servingTeam
      ? state.servingTeam
      : null

  const renderCard = (team: Team) => {
    const card = (
      <StatCard
        value={String(state.scores[team])}
        label={labels[team]}
        className={
          state.servingTeam === team
            ? `ring-2 ring-offset-2 ring-offset-black transition-colors duration-300 ${TEAM_ACCENT[team].ring} ${TEAM_ACCENT[team].glow}`
            : ''
        }
      />
    )

    if (!onPoint) {
      return <div className="block">{card}</div>
    }

    return (
      <button
        type="button"
        onClick={() => onPoint(team)}
        disabled={state.gameOver}
        className="block cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-70 disabled:cursor-default disabled:hover:scale-100"
      >
        {card}
      </button>
    )
  }

  return (
    <div className="w-full max-w-[680px] mx-auto flex flex-col gap-6 items-center">
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 flex items-center justify-center">
            {matchPointTeam === 0 && (
              <span
                className={`text-sm font-bold ${TEAM_ACCENT[0].text} ${state.winByTwo ? 'animate-pulse' : ''}`}
              >
                Match Point
              </span>
            )}
          </div>
          {renderCard(0)}
        </div>

        <div
          className={`flex flex-col items-center justify-center gap-1 w-[160px] h-[180px] rounded-xl border bg-gradient-to-br from-neutral-800 via-neutral-900 to-black px-3 text-center transition-all duration-300 ${TEAM_ACCENT[state.servingTeam].border} ${TEAM_ACCENT[state.servingTeam].glow}`}
        >
          <span
            className={`text-sm font-semibold transition-colors duration-300 ${TEAM_ACCENT[state.servingTeam].text}`}
          >
            {labels[state.servingTeam]}
          </span>
          {state.matchType === 'doubles' ? (
            <>
              <span className="text-7xl font-extrabold leading-none text-white">{state.server}</span>
              <span className="text-[11px] font-semibold tracking-widest text-neutral-400">server</span>
            </>
          ) : (
            <>
              <PickleballIcon className="w-16 h-16" />
              <span className="text-[11px] font-semibold tracking-widest text-neutral-400">serving</span>
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="h-6 flex items-center justify-center">
            {matchPointTeam === 1 && (
              <span
                className={`text-sm font-bold ${TEAM_ACCENT[1].text} ${state.winByTwo ? 'animate-pulse' : ''}`}
              >
                Match Point
              </span>
            )}
          </div>
          {renderCard(1)}
        </div>
      </div>

      {state.gameOver && state.winner !== null && (
        <div
          className={`w-full text-center py-3 rounded-lg border font-bold text-lg animate-fade-in-up transition-colors duration-300 ${TEAM_ACCENT[state.winner].bannerBg} ${TEAM_ACCENT[state.winner].border} ${TEAM_ACCENT[state.winner].text}`}
        >
          {labels[state.winner]} wins!
        </div>
      )}
    </div>
  )
}
