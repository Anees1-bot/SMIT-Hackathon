const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../Middlewares/Auth');
const CommentModel = require('../Models/Comment');
const UserModel = require('../Models/User');

// POST /comments/:id/vote - vote a comment (must come before /:postId to avoid route conflicts)
router.post('/:id/vote', ensureAuthenticated, async (req, res) => {
  const { type } = req.body;
  if (!['upvote', 'downvote'].includes(type)) {
    return res.status(400).json({ error: 'Invalid vote type' });
  }
  try {
    const comment = await CommentModel.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    comment.votes += type === 'upvote' ? 1 : -1;
    await comment.save();
    try {
      const authorId = comment.author;
      const voterId = req.user._id;
      if (authorId) {
        const author = await UserModel.findById(authorId);
        if (author) {
          author.score += type === 'upvote' ? 5 : -2; // +5 upvote received, -2 downvote received
          await author.save();
        }
      }
      if (voterId && type === 'upvote') {
        const voter = await UserModel.findById(voterId);
        if (voter) {
          voter.score += 2; // user gives upvote: +2
          await voter.save();
        }
      }
    } catch (_) { /* non-fatal */ }
    res.json({ success: true, votes: comment.votes, id: comment._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to vote', details: err.message });
  }
});

// DELETE /comments/:id - delete own comment (must come before /:postId to avoid route conflicts)
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const comment = await CommentModel.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (String(comment.author) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden: not the author' });
    }
    await comment.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment', details: err.message });
  }
});

// GET /comments/:postId - get comments for a post (less specific route comes last)
router.get('/:postId', async (req, res) => {
  try {
    const comments = await CommentModel.find({ postId: req.params.postId })
      .sort({ createdAt: 1 })
      .populate('author', 'name');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments', details: err.message });
  }
});

// POST /comments/:postId - create a comment (less specific route comes last)
router.post('/:postId', ensureAuthenticated, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });
  try {
    const comment = new CommentModel({
      postId: req.params.postId,
      content,
      author: req.user._id,
    });
    await comment.save();
    const populated = await comment.populate('author', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create comment', details: err.message });
  }
});

module.exports = router;

