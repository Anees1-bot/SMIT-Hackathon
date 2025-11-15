// backend/Routes/PostRouter.js
const express = require('express');
const router = express.Router();
const PostModel = require('../Models/Post'); // Your Mongoose Post model
const ensureAuthenticated = require('../Middlewares/Auth');
const UserModel = require('../Models/User');
const PostVoteModel = require('../Models/PostVote');

// GET /posts - fetch all posts
router.get('/', async (req, res) => {
  try {
    const posts = await PostModel.find().populate('author', 'name'); // adjust fields as needed
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts', details: err.message });
  }
});

// GET /posts/:id - fetch a single post by id
router.get('/:id', async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id).populate('author', 'name');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post', details: err.message });
  }
});

// POST /posts - create a new post
router.post('/', ensureAuthenticated, async (req, res) => {
  const { title, content, tags } = req.body;
  const author = req.user && req.user._id;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  if (!author) {
    return res.status(403).json({ error: 'Unauthorized: missing user context' });
  }
  if (typeof tags !== 'undefined' && !Array.isArray(tags)) {
    return res.status(400).json({ error: 'Tags must be an array of strings' });
  }
  try {
    const sanitizedTags = Array.isArray(tags) ? tags.map(String) : undefined;
    const newPost = new PostModel({ title, content, tags: sanitizedTags, author });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post', details: err.message });
  }
});

// PUT /posts/:id - update a post (owner only)
router.put('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden: not the author' });
    }
    const { title, content, tags } = req.body;
    if (typeof title !== 'undefined') post.title = String(title);
    if (typeof content !== 'undefined') post.content = String(content);
    if (typeof tags !== 'undefined') {
      if (!Array.isArray(tags)) return res.status(400).json({ error: 'Tags must be an array of strings' });
      post.tags = tags.map(String);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update post', details: err.message });
  }
});

// DELETE /posts/:id - delete a post (owner only)
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden: not the author' });
    }
    await post.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post', details: err.message });
  }
});

// POST /posts/:id/vote - upvote or downvote a post (auth required)
router.post('/:id/vote', ensureAuthenticated, async (req, res) => {
  const { type } = req.body; // type: 'upvote' or 'downvote'
  if (!['upvote', 'downvote'].includes(type)) {
    return res.status(400).json({ error: 'Invalid vote type' });
  }
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const voterId = req.user && req.user._id;
    if (!voterId) {
      return res.status(403).json({ error: 'Unauthorized: missing user context' });
    }

    // Enforce: a user can only vote once per post, but allow changing the vote
    const existingVote = await PostVoteModel.findOne({ userId: voterId, postId: post._id });
    if (existingVote) {
      if (existingVote.type === type) {
        return res.json({ success: true, votes: post.votes, id: post._id, message: 'Vote unchanged' });
      }

      // Change vote: adjust aggregate and reputations by a single-step delta (+1/-1)
      const changingFrom = existingVote.type;
      const changingTo = type;

      // Votes delta: down -> up = +1, up -> down = -1
      const votesDelta = changingTo === 'upvote' ? 1 : -1;
      post.votes += votesDelta;
      await post.save();

      // Persist the new vote type
      existingVote.type = changingTo;
      await existingVote.save();

      // Reputation adjustments for change
      try {
        const authorId = post.author;
        if (authorId) {
          const author = await UserModel.findById(authorId);
          if (author) {
            // Apply only the effect of the new vote
            // Upvote => +10 to author, Downvote => -2 to author
            const authorDelta = changingTo === 'upvote' ? 10 : -2;
            author.score += authorDelta;
            await author.save();
          }
        }
        const voter = await UserModel.findById(voterId);
        if (voter) {
          // Voter gets +2 when giving an upvote; 0 for downvote
          const voterDelta = changingTo === 'upvote' ? 2 : 0;
          voter.score += voterDelta;
          await voter.save();
        }
      } catch (_) { /* non-fatal */ }

      return res.json({ success: true, votes: post.votes, id: post._id, message: 'Vote updated' });
    }

    // Record the vote and update the aggregate counter
    await PostVoteModel.create({ userId: voterId, postId: post._id, type });
    post.votes += type === 'upvote' ? 1 : -1;
    await post.save();

    // Reputation adjustments
    try {
      const authorId = post.author;
      if (authorId) {
        const author = await UserModel.findById(authorId);
        if (author) {
          author.score += type === 'upvote' ? 10 : -2; // upvote received: +10, downvote received: -2
          await author.save();
        }
      }
      if (voterId) {
        const voter = await UserModel.findById(voterId);
        if (voter && type === 'upvote') {
          voter.score += 2; // user gives upvote: +2
          await voter.save();
        }
      }
    } catch (_) { /* non-fatal */ }

    res.json({ success: true, votes: post.votes, id: post._id });
  } catch (err) {
    // Handle duplicate key error from unique index (user already voted)
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'You have already voted on this post' });
    }
    res.status(500).json({ error: 'Failed to vote', details: err.message });
  }
});


module.exports = router;