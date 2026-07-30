import { useReducer, useState } from 'react'
import './Scorer.css'

const TEAM_LABELS = {
  singles: ['Player A', 'Player B'],
  doubles: ['Team A', 'Team B'],
}

function snapshot(state) {
  return {
    scores: [...state.scores],
    servingTeam: state.servingTeam,
    server: state.server,
    firstServeOfGame: state.firstServeOfGame,
    gameOver: state.gameOver,
    winner: state.winner,
  }
}

function createGameState({ matchType, pointTarget, winByTwo, startingServer }) {
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

function checkWin(scores, pointTarget, winByTwo) {
  const [a, b] = scores
  const leader = a === b ? null : a > b ? 0 : 1
  if (leader === null) return null
  const leadScore = scores[leader]
  const otherScore = scores[leader === 0 ? 1 : 0]
  if (leadScore >= pointTarget && (!winByTwo || leadScore - otherScore >= 2)) {
    return leader
  }
  return null
}

function reducer(state, action) {
  switch (action.type) {
    case 'SETUP':
      return createGameState(action.setup)

    case 'POINT': {
      if (state.gameOver) return state
      const team = action.team
      const prev = snapshot(state)
      const scores = [...state.scores]
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
      if (state.history.length === 0) return state
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

function Setup({ onStart }) {
  const [matchType, setMatchType] = useState('doubles')
  const [pointTarget, setPointTarget] = useState(11)
  const [winByTwo, setWinByTwo] = useState(true)
  const [startingServer, setStartingServer] = useState(0)
  const labels = TEAM_LABELS[matchType]

  return (
    <div className="setup">
      <h2>New Game</h2>

      <div className="field">
        <label>Match Type</label>
        <div className="segmented">
          <button
            type="button"
            className={matchType === 'singles' ? 'active' : ''}
            onClick={() => setMatchType('singles')}
          >
            Singles
          </button>
          <button
            type="button"
            className={matchType === 'doubles' ? 'active' : ''}
            onClick={() => setMatchType('doubles')}
          >
            Doubles
          </button>
        </div>
      </div>

      <div className="field">
        <label>Play To</label>
        <div className="segmented">
          {[11, 15, 21].map((n) => (
            <button
              key={n}
              type="button"
              className={pointTarget === n ? 'active' : ''}
              onClick={() => setPointTarget(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={winByTwo}
            onChange={(e) => setWinByTwo(e.target.checked)}
          />
          Win by 2
        </label>
      </div>

      <div className="field">
        <label>First Serve</label>
        <div className="segmented">
          <button
            type="button"
            className={startingServer === 0 ? 'active' : ''}
            onClick={() => setStartingServer(0)}
          >
            {labels[0]}
          </button>
          <button
            type="button"
            className={startingServer === 1 ? 'active' : ''}
            onClick={() => setStartingServer(1)}
          >
            {labels[1]}
          </button>
        </div>
      </div>

      <button
        type="button"
        className="start-button"
        onClick={() => onStart({ matchType, pointTarget, winByTwo, startingServer })}
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
    <div className="scorer">
      <div className="score-panels">
        {[0, 1].map((team) => (
          <button
            key={team}
            type="button"
            className={`score-panel${state.servingTeam === team ? ' serving' : ''}`}
            onClick={() => dispatch({ type: 'POINT', team })}
            disabled={state.gameOver}
          >
            <span className="team-label">{labels[team]}</span>
            <span className="score">{state.scores[team]}</span>
            {state.servingTeam === team && (
              <span className="serve-indicator">
                {'\u{1F3D3}'} {state.matchType === 'doubles' ? `Server ${state.server}` : 'Serving'}
              </span>
            )}
          </button>
        ))}
      </div>

      {state.gameOver && (
        <div className="game-over-banner">{labels[state.winner]} wins!</div>
      )}

      <div className="controls">
        <button
          type="button"
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={state.history.length === 0}
        >
          Undo
        </button>
        <button type="button" onClick={() => dispatch({ type: 'NEW_GAME' })}>
          New Game
        </button>
      </div>
    </div>
  )
}

export default Scorer
