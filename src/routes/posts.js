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

router.get('/', (req, res) => {
  res.json(posts);
});

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

router.put('/:id', authenticate, validatePostInput, (req, res) => {
  const post = findPostById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  if (post.userId !== req.user.sub && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { title, body, tags = post.tags } = req.body;
  post.title = title.trim();
  post.body = body.trim();
  post.tags = tags;
  res.json(post);
});

router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const index = posts.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Post not found' });

  posts.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
