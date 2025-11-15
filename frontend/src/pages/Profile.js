import React, { useEffect, useMemo, useState } from 'react'
import { getPosts } from '../utils/api'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { userName } = useAuth()
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

  const mine = useMemo(() => posts.filter(p => (p.author?.name || '').toLowerCase() === (userName || '').toLowerCase()), [posts, userName])

  return (
    <div className="feed">
      <h1>Your Posts</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {mine.map((p) => (
        <div key={p._id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>{p.title}</h3>
            <span>Votes: {p.votes ?? 0}</span>
          </div>
          {Array.isArray(p.tags) && p.tags.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {p.tags.map((t) => (
                <span key={t} style={{ marginRight: 8, background: '#f0f0f0', padding: '2px 6px', borderRadius: 4 }}>#{t}</span>
              ))}
            </div>
          )}
        </div>
      ))}
      {!loading && !error && mine.length === 0 && (
        <p>No posts yet.</p>
      )}
    </div>
  )
}

export default Profile
