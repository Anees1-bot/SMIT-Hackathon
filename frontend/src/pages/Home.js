import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getPosts, votePost, getComments, createComment, voteComment, deleteComment, deletePost } from "../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, logout, userName } = useAuth();
  const navigate = useNavigate();
  const [commentsByPost, setCommentsByPost] = useState({});
  const [newCommentByPost, setNewCommentByPost] = useState({});
  const [showComposerByPost, setShowComposerByPost] = useState({});
  const [modal, setModal] = useState({ show: false, type: '', message: '', onConfirm: null });

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPosts();
      setPosts(Array.isArray(data) ? data : []);
      // Load comments for each post
      const map = {};
      await Promise.all((Array.isArray(data) ? data : []).map(async (p) => {
        try {
          const comm = await getComments(p._id);
          map[p._id] = Array.isArray(comm) ? comm : [];
        } catch (_) {
          map[p._id] = [];
        }
      }));
      setCommentsByPost(map);
    } catch (err) {
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onVote = async (id, type) => {
    try {
      await votePost(id, type);
      fetchPosts();
    } catch (err) {
      setError(err.message || "Failed to vote");
    }
  };

  const toggleComposer = (postId) => {
    setShowComposerByPost((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const onCreateComment = async (postId) => {
    const text = (newCommentByPost[postId] || "").trim();
    if (!text) return;
    try {
      await createComment(postId, text);
      setNewCommentByPost((prev) => ({ ...prev, [postId]: "" }));
      setShowComposerByPost((prev) => ({ ...prev, [postId]: false }));
      const comm = await getComments(postId);
      setCommentsByPost((prev) => ({ ...prev, [postId]: Array.isArray(comm) ? comm : [] }));
    } catch (err) {
      setError(err.message || 'Failed to add comment');
    }
  };

  const onVoteComment = async (commentId, type, postId) => {
    try {
      await voteComment(commentId, type);
      const comm = await getComments(postId);
      setCommentsByPost((prev) => ({ ...prev, [postId]: Array.isArray(comm) ? comm : [] }));
    } catch (err) {
      setError(err.message || 'Failed to vote comment');
    }
  };

  const showModal = (type, message, onConfirm) => {
    setModal({ show: true, type, message, onConfirm });
  };

  const hideModal = () => {
    setModal({ show: false, type: '', message: '', onConfirm: null });
  };

  const onDeletePost = async (postId, authorName) => {
    // Check if user is the owner
    if (!userName || !authorName || authorName.toLowerCase() !== userName.toLowerCase()) {
      showModal('error', 'Unauthorized: You can only delete your own posts.', null);
      return;
    }
    
    showModal('confirm', 'Are you sure you want to delete this post?', async () => {
      try {
        await deletePost(postId);
        fetchPosts();
        hideModal();
      } catch (err) {
        const errorMsg = err.message || 'Failed to delete post';
        if (errorMsg.includes('Forbidden') || errorMsg.includes('Unauthorized')) {
          showModal('error', 'Unauthorized: You can only delete your own posts.', null);
        } else {
          setError(errorMsg);
          hideModal();
        }
      }
    });
  };

  const onDeleteComment = async (commentId, authorName, postId) => {
    if (!userName || (authorName || '').toLowerCase() !== userName.toLowerCase()) {
      showModal('error', 'Unauthorized: You can only delete your own comments.', null);
      return;
    }
    
    showModal('confirm', 'Are you sure you want to delete this comment?', async () => {
      try {
        await deleteComment(commentId);
        const comm = await getComments(postId);
        setCommentsByPost((prev) => ({ ...prev, [postId]: Array.isArray(comm) ? comm : [] }));
        hideModal();
      } catch (err) {
        const errorMsg = err.message || 'Failed to delete comment';
        if (errorMsg.includes('Forbidden') || errorMsg.includes('Unauthorized')) {
          showModal('error', 'Unauthorized: You can only delete your own comments.', null);
        } else {
          setError(errorMsg);
          hideModal();
        }
      }
    });
  };

  const onLogout = () => {
    try { logout(); } catch (_) {}
    navigate('/login');
  };

  return (
    <div className="feed">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingLeft: '20px', paddingRight: '20px' }}>
        <h1><span style={{ paddingTop: '5px' }}>Community</span> Feed</h1>
        {isAuthenticated ? (
          <button onClick={onLogout}>Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {posts.map((p) => (
        <div key={p._id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>
              <Link to={`/posts/${p._id}`}>{p.title}</Link>
            </h3>
            <span>Votes: {p.votes ?? 0}</span>
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            by {p.author?.name || 'Unknown'}
          </div>
          {/* Post content */}
          <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
            {p.content}
          </div>
          {Array.isArray(p.tags) && p.tags.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {p.tags.map((t) => (
                <span key={t} style={{ marginRight: 8, background: '#f0f0f0', padding: '2px 6px', borderRadius: 4 }}>#{t}</span>
              ))}
            </div>
          )}
          <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button disabled={!isAuthenticated} onClick={() => onVote(p._id, 'upvote')}>Upvote</button>
            <button disabled={!isAuthenticated} onClick={() => onVote(p._id, 'downvote')}>Downvote</button>
            <button disabled={!isAuthenticated} onClick={() => toggleComposer(p._id)}>Add Comment</button>
            {userName && p.author?.name && p.author.name.toLowerCase() === userName.toLowerCase() && (
              <button 
                onClick={() => onDeletePost(p._id, p.author.name)}
                style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', boxShadow: '0 6px 16px rgba(220, 38, 38, 0.3)' }}
              >
                Delete Post
              </button>
            )}
            {!isAuthenticated && <span style={{ fontSize: 12, color: '#999' }}>Login to vote/comment</span>}
          </div>

          {showComposerByPost[p._id] && (
            <div style={{ marginTop: 8 }}>
              <textarea
                placeholder={isAuthenticated ? 'Add a comment...' : 'Login to comment'}
                value={newCommentByPost[p._id] || ''}
                onChange={(e) => setNewCommentByPost((prev) => ({ ...prev, [p._id]: e.target.value }))}
                rows={3}
                style={{ width: '100%', padding: 8 }}
                disabled={!isAuthenticated}
              />
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button disabled={!isAuthenticated || !(newCommentByPost[p._id] || '').trim()} onClick={() => onCreateComment(p._id)}>Post Comment</button>
                <button onClick={() => { toggleComposer(p._id); setNewCommentByPost((prev) => ({ ...prev, [p._id]: '' })); }}>Cancel</button>
              </div>
            </div>
          )}

          {(commentsByPost[p._id] || []).map((c) => (
            <div key={c._id} style={{ borderTop: '1px solid #eee', paddingTop: 8, marginTop: 8 }}>
              <div style={{ fontSize: 12, color: '#888' }}>by {c.author?.name || 'Unknown'}</div>
              <div style={{ whiteSpace: 'pre-wrap', margin: '6px 0' }}>{c.content}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>Votes: {c.votes ?? 0}</span>
                <button disabled={!isAuthenticated} onClick={() => onVoteComment(c._id, 'upvote', p._id)}>Upvote</button>
                <button disabled={!isAuthenticated} onClick={() => onVoteComment(c._id, 'downvote', p._id)}>Downvote</button>
                {userName && c.author?.name && c.author.name.toLowerCase() === userName.toLowerCase() && (
                  <button 
                    onClick={() => onDeleteComment(c._id, c.author.name, p._id)}
                    style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', boxShadow: '0 6px 16px rgba(220, 38, 38, 0.3)' }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
      
      {/* Custom Modal - Rendered via Portal */}
      {modal.show && createPortal(
        <div className="modal-overlay" onClick={modal.type === 'error' ? hideModal : undefined}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-icon ${modal.type}`}>
              {modal.type === 'error' ? '⚠️' : '❓'}
            </div>
            <h3 className="modal-title">{modal.type === 'error' ? 'Unauthorized' : 'Confirm Delete'}</h3>
            <p className="modal-message">{modal.message}</p>
            <div className="modal-actions">
              {modal.type === 'confirm' && (
                <>
                  <button className="modal-btn modal-btn-cancel" onClick={hideModal}>Cancel</button>
                  <button 
                    className="modal-btn modal-btn-confirm" 
                    onClick={() => {
                      if (modal.onConfirm) modal.onConfirm();
                    }}
                  >
                    Delete
                  </button>
                </>
              )}
              {modal.type === 'error' && (
                <button className="modal-btn modal-btn-ok" onClick={hideModal}>OK</button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default Home;
