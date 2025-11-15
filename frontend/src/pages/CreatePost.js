import React, { useState } from 'react'
import { createPost } from '../utils/api'
import { useAuth } from '../context/AuthContext'

function CreatePost() {
  const { isAuthenticated } = useAuth()
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      return
    }
    const tagsArray = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
    try {
      setSubmitting(true)
      const res = await createPost({ title: title.trim(), content: content.trim(), tags: tagsArray })
      setSuccess(`Created post ${res._id}`)
      setTitle('')
      setTags('')
      setContent('')
    } catch (err) {
      setError(err.message || 'Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="create-post-wrapper">
      <h1>Create Post</h1>
      {error && <p className="cp-error">{error}</p>}
      {success && <p className="cp-success">{success}</p>}
      <form className="create-post-form" onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            className="cp-input"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Post title"
          />
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea
            className="cp-textarea"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your post content here..."
            rows={6}
          />
        </div>
        <div className="form-group">
          <label>Tags (comma-separated)</label>
          <input
            className="cp-input"
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="e.g. intro, hello"
          />
        </div>
        <button className="create-btn" type="submit" disabled={submitting || !isAuthenticated}>
          {submitting ? 'Creating...' : 'Create Post'}
        </button>
        {!isAuthenticated && <span className="cp-info">Login to create posts</span>}
      </form>
    </div>
  )
}

export default CreatePost
