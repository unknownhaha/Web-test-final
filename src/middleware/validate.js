function validatePostInput(req, res, next) {
  const { title, body, tags } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 100) {
    return res.status(400).json({ error: 'Title must be a string between 3 and 100 characters' });
  }

  if (!body || typeof body !== 'string' || body.trim().length < 1 || body.trim().length > 2000) {
    return res.status(400).json({ error: 'Body must be a string between 1 and 2000 characters' });
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags) || tags.length > 5) {
      return res.status(400).json({ error: 'Tags must be an array with at most 5 items' });
    }

    for (const tag of tags) {
      if (typeof tag !== 'string' || tag.trim().length > 20 || !/^[a-zA-Z0-9]+$/.test(tag.trim())) {
        return res.status(400).json({ error: 'Each tag must be alphanumeric and at most 20 characters' });
      }
    }
  }

  next();
}

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

module.exports = { validatePostInput, isValidEmail };
