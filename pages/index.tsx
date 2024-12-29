import { useEffect, useState } from 'react'

// Types for clarity
type Player = {
  id: number
  name: string
}

type Match = {
  id: number
  winnerId: number
  loserId: number
  winner: Player
  loser: Player
  playedAt: string
}

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [newPlayerName, setNewPlayerName] = useState('')
  const [winnerId, setWinnerId] = useState<number | undefined>()
  const [loserId, setLoserId] = useState<number | undefined>()

  // Fetch players
  useEffect(() => {
    fetch('/api/players')
      .then((res) => res.json())
      .then((data) => setPlayers(data))
      .catch((err) => console.error('Error fetching players:', err))
  }, [])

  // Fetch matches
  useEffect(() => {
    fetch('/api/matches')
      .then((res) => res.json())
      .then((data) => setMatches(data))
      .catch((err) => console.error('Error fetching matches:', err))
  }, [])

  // Add Player
  const addPlayer = async () => {
    if (!newPlayerName.trim()) return
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlayerName }),
      })
      if (res.ok) {
        const createdPlayer = await res.json()
        setPlayers((prev) => [...prev, createdPlayer])
        setNewPlayerName('')
      }
    } catch (error) {
      console.error(error)
    }
  }

  // Delete Player
  const deletePlayer = async (id: number) => {
    try {
      const res = await fetch(`/api/players?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPlayers((prev) => prev.filter((p) => p.id !== id))
      }
    } catch (error) {
      console.error(error)
    }
  }

  // Record match
  const recordMatch = async () => {
    if (!winnerId || !loserId || winnerId === loserId) {
      alert('Please select two different players.')
      return
    }
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId, loserId }),
      })
      if (res.ok) {
        const newMatch = await res.json()
        setMatches((prev) => [newMatch, ...prev])  // prepend the new match
      }
    } catch (error) {
      console.error(error)
    }
  }

  // Compute leaderboard: sort players by # of wins
  const leaderboard = players
    .map((player) => {
      const wins = matches.filter((m) => m.winnerId === player.id).length
      return { ...player, wins }
    })
    .sort((a, b) => b.wins - a.wins)

  return (
    <div style={{ margin: '2rem' }}>
      <h1>Ping Pong Tracker</h1>

      <section>
        <h2>Add a New Player</h2>
        <input
          type="text"
          placeholder="Player name"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
        />
        <button onClick={addPlayer}>Add Player</button>
      </section>

      <section>
        <h2>Players</h2>
        <ul>
          {players.map((p) => (
            <li key={p.id}>
              {p.name}{' '}
              <button onClick={() => deletePlayer(p.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Record a Match</h2>
        <div>
          <label>Winner: </label>
          <select onChange={(e) => setWinnerId(Number(e.target.value))} value={winnerId || ''}>
            <option value="">-- Select Winner --</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Loser: </label>
          <select onChange={(e) => setLoserId(Number(e.target.value))} value={loserId || ''}>
            <option value="">-- Select Loser --</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <button onClick={recordMatch}>Record Match</button>
      </section>

      <section>
        <h2>Leaderboard</h2>
        <ol>
          {leaderboard.map((p) => (
            <li key={p.id}>
              {p.name} ({p.wins} wins)
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>Recent Matches</h2>
        <table border={1} cellPadding={6} style={{ marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>Match ID</th>
              <th>Winner</th>
              <th>Loser</th>
              <th>Played At</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.winner?.name}</td>
                <td>{m.loser?.name}</td>
                <td>{new Date(m.playedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
