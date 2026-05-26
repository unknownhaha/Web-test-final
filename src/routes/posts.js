/**
 * TODO (B4): Fix broken access control on PUT/DELETE
 */

const express = require('express');
const {
  posts,
  findPostById,
  getNextPostId,
  incrementPostId
} = require('../db/data');
const { authenticate, authorize } = require('../middleware/auth');
const { validatePostInput } = require('../middleware/validate');

const router = express.Router();

// Public — list all posts
router.get('/', (req, res) => {
  res.json(posts);
});

// Authenticated — create post
router.post('/', authenticate, validatePostInput, (req, res) => {
  const { title, body, tags = [] } = req.body;
  const newPost = {
    id: getNextPostId(),
    userId: req.user.sub,
    title: title.trim(),
    body: body.trim(),
    tags,
    createdAt: new Date().toISOString()
  };
  incrementPostId();
  posts.push(newPost);
  res.status(201).json(newPost);
});

// BUG: Any authenticated user can edit ANY post — fix for exam
router.put('/:id', authenticate, validatePostInput, (req, res) => {
  const post = findPostById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  // TODO: Only owner (post.userId === req.user.sub) OR admin may update

  const { title, body, tags = post.tags } = req.body;
  post.title = title.trim();
  post.body = body.trim();
  post.tags = tags;
  res.json(post);
});

// BUG: Should be admin-only — fix for exam
router.delete('/:id', authenticate, (req, res) => {
  const index = posts.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Post not found' });

  // TODO: Only admin role may delete

  posts.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
