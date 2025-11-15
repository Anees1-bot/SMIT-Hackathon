import React, { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { getPostById, votePost, updatePost, deletePost, getComments, createComment, voteComment, deleteComment } from '../utils/api'
import { useAuth } from '../context/AuthContext'

function PostDetails() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState('')
  const { isAuthenticated, userName } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [showComposer, setShowComposer] = useState(false)
  const location = useLocation()

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getPostById(id)
      setPost(data)
      setEditTitle(data.title || '')
      setEditContent(data.content || '')
      setEditTags(Array.isArray(data.tags) ? data.tags.join(', ') : '')
      const comm = await getComments(id)
      setComments(Array.isArray(comm) ? comm : [])
    } catch (err) {
      setError(err.message || 'Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('comment')) {
      setShowComposer(true)
    }
  }, [location.search])

  const onVote = async (type) => {
    try {
      await votePost(id, type)
      load()
    } catch (err) {
      setError(err.message || 'Failed to vote')
    }
  }

  const isOwner = !!(post && post.author && post.author.name && userName && post.author.name.toLowerCase() === userName.toLowerCase())

  const onSave = async () => {
    try {
      await updatePost(id, {
        title: editTitle,
        content: editContent,
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean)
      })
      setIsEditing(false)
      await load()
    } catch (err) {
      setError(err.message || 'Failed to update post')
    }
  }

  const onDelete = async () => {
    if (!window.confirm('Delete this post?')) return
    try {
      await deletePost(id)
      window.history.back()
    } catch (err) {
      setError(err.message || 'Failed to delete post')
    }
  }

  const onCreateComment = async () => {
    if (!newComment.trim()) return
    try {
      await createComment(id, newComment.trim())
      setNewComment('')
      setShowComposer(false)
      await load()
    } catch (err) {
      setError(err.message || 'Failed to add comment')
    }
  }

  const onVoteComment = async (cid, type) => {
    try {
      await voteComment(cid, type)
      await load()
    } catch (err) {
      setError(err.message || 'Failed to vote comment')
    }
  }

  const onDeleteComment = async (cid, authorName) => {
    if (!userName || (authorName || '').toLowerCase() !== userName.toLowerCase()) return
    if (!window.confirm('Delete this comment?')) return
    try {
      await deleteComment(cid)
      await load()
    } catch (err) {
      setError(err.message || 'Failed to delete comment')
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (!post) return <p>Post not found</p>

  return (
    <div style={{ maxWidth: 720 }}>
      {isEditing ? (
        <>
          <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
          <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={8} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
          <input value={editTags} onChange={e => setEditTags(e.target.value)} placeholder="tags, comma, separated" style={{ width: '100%', padding: 8, marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button onClick={onSave} disabled={!isAuthenticated}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <h1>{post.title}</h1>
          <div style={{ color: '#666', marginBottom: 8 }}>by {post.author?.name || 'Unknown'}</div>
          <div style={{ whiteSpace: 'pre-wrap', marginBottom: 12 }}>{post.content}</div>
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {post.tags.map(t => (
                <span key={t} style={{ marginRight: 8, background: '#f0f0f0', padding: '2px 6px', borderRadius: 4 }}>#{t}</span>
              ))}
            </div>
          )}
        </>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <strong>Votes: {post.votes ?? 0}</strong>
        <button disabled={!isAuthenticated} onClick={() => onVote('upvote')}>Upvote</button>
        <button disabled={!isAuthenticated} onClick={() => onVote('downvote')}>Downvote</button>
        <button
          disabled={!isAuthenticated}
          onClick={() => {
            setShowComposer(true);
            try { const el = document.getElementById('comments'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) {}
          }}
        >
          Add Comment
        </button>
        {isOwner && !isEditing && (
          <>
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={onDelete}>Delete</button>
          </>
        )}
      </div>

      <div id="comments" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Comments</h3>
          <button disabled={!isAuthenticated} onClick={() => setShowComposer((v) => !v)}>
            {showComposer ? 'Close' : 'Add Comment'}
          </button>
        </div>
        {comments.map(c => (
          <div key={c._id} style={{ borderTop: '1px solid #333', paddingTop: 8, marginTop: 8 }}>
            <div style={{ fontSize: 12, color: '#aaa' }}>by {c.author?.name || 'Unknown'}</div>
            <div style={{ whiteSpace: 'pre-wrap', margin: '6px 0' }}>{c.content}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span>Votes: {c.votes ?? 0}</span>
              <button disabled={!isAuthenticated} onClick={() => onVoteComment(c._id, 'upvote')}>Upvote</button>
              <button disabled={!isAuthenticated} onClick={() => onVoteComment(c._id, 'downvote')}>Downvote</button>
              {userName && c.author?.name && c.author.name.toLowerCase() === userName.toLowerCase() && (
                <button onClick={() => onDeleteComment(c._id, c.author.name)}>Delete</button>
              )}
            </div>
          </div>
        ))}
        {showComposer && (
          <div style={{ marginTop: 12 }}>
            <textarea
              placeholder={isAuthenticated ? 'Add a comment...' : 'Login to comment'}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: 8 }}
              disabled={!isAuthenticated}
            />
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button disabled={!isAuthenticated || !newComment.trim()} onClick={onCreateComment}>Post Comment</button>
              <button onClick={() => { setShowComposer(false); setNewComment(''); }}>Cancel</button>
            </div>
            {!isAuthenticated && <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>Login to comment</div>}
          </div>
        )}
      </div>
    </div>
  )
}

export default PostDetails

