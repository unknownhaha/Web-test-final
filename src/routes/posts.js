// ============================================================
// B4 — Broken Access Control Fix
// Topic: Lecture 08 — OWASP #1 Broken Access Control
// Each route has different permission rules (RBAC + owner check)
// Note: routes use '/' not '/api/posts' because server.js mounts at /api/posts
// ============================================================

const express = require('express');
const {
  posts,           // in-memory array (mock database)
  findPostById,
  getNextPostId,
  incrementPostId
} = require('../db/data');
const { authenticate, authorize } = require('../middleware/auth');
const { validatePostInput } = require('../middleware/validate');

const router = express.Router();

// GET /api/posts — PUBLIC (anyone can read, no login needed)
router.get('/', (req, res) => {
  res.json(posts);
});

// POST /api/posts — AUTHENTICATED users only (must have valid JWT)
router.post('/', authenticate, validatePostInput, (req, res) => {
  const { title, body, tags = [] } = req.body;

  // Create new post object, userId comes from JWT payload (req.user.sub)
  const newPost = {
    id: getNextPostId(),
    userId: req.user.sub,       // link post to the logged-in user
    title: title.trim(),
    body: body.trim(),
    tags,
    createdAt: new Date().toISOString()
  };

  incrementPostId();            // prepare next ID for future posts
  posts.push(newPost);          // save to in-memory array
  res.status(201).json(newPost); // 201 Created
});

// PUT /api/posts/:id — only OWNER of post OR admin can update
router.put('/:id', authenticate, validatePostInput, (req, res) => {
  const post = findPostById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  // Access control check:
  // req.user.sub = logged-in user's ID from JWT
  // post.userId = ID of user who created this post
  // Allow if: you own it OR you are admin
  if (post.userId !== req.user.sub && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Update post fields
  const { title, body, tags = post.tags } = req.body;
  post.title = title.trim();
  post.body = body.trim();
  post.tags = tags;
  res.json(post);
});

// DELETE /api/posts/:id — ADMIN only
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const index = posts.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Post not found' });

  posts.splice(index, 1);       // remove from array
  res.status(204).send();       // 204 No Content = success, no body
});

module.exports = router;
