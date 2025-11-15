import React, { useEffect, useMemo, useState } from 'react'
import { getPosts } from '../utils/api'

function Leaderboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const all = await getPosts()
        setPosts(Array.isArray(all) ? all : [])
      } catch (err) {
        setError(err.message || 'Failed to load posts')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const sorted = useMemo(() => {
    return [...posts].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
  }, [posts])

  return (
    <div className="feed">
      <h1>Leaderboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {sorted.map((p, i) => (
        <div key={p._id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3 style={{ margin: 0 }}>#{i + 1} {p.title}</h3>
            <span>Votes: {p.votes ?? 0}</span>
          </div>
          <div style={{ fontSize: 12, color: '#ccc' }}>by {p.author?.name || 'Unknown'}</div>

          {/* show main content (excerpt if long) */}
          <p style={{ marginTop: 8, color: '#333' }}>
            {p.content
              ? (p.content.length > 300 ? `${p.content.slice(0, 300)}…` : p.content)
              : ''}
          </p>
        </div>
      ))}
      {!loading && !error && sorted.length === 0 && (
        <p>No posts yet.</p>
      )}
    </div>
  )
}

export default Leaderboard
