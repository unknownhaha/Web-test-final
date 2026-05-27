// ============================================================
// B2 — Server-Side Validation
// Topic: Lecture 08 — validate input on server (not just client)
// Golden rule: "Validate at the server" — client validation is UX only
// ============================================================

function validatePostInput(req, res, next) {
  // Extract fields from POST/PUT request body
  const { title, body, tags } = req.body;

  // --- TITLE validation ---
  // Must exist, be a string, and length 3–100 after trim
  if (!title || typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 100) {
    // 400 Bad Request = client sent invalid data
    return res.status(400).json({ error: 'Title must be a string between 3 and 100 characters' });
  }

  // --- BODY validation ---
  // Must exist, be a string, and length 1–2000 after trim
  if (!body || typeof body !== 'string' || body.trim().length < 1 || body.trim().length > 2000) {
    return res.status(400).json({ error: 'Body must be a string between 1 and 2000 characters' });
  }

  // --- TAGS validation (optional field) ---
  // Only validate if client actually sent tags
  if (tags !== undefined) {
    // Must be an array with at most 5 items
    if (!Array.isArray(tags) || tags.length > 5) {
      return res.status(400).json({ error: 'Tags must be an array with at most 5 items' });
    }

    // Check each tag individually (allow-list: alphanumeric only)
    for (const tag of tags) {
      if (typeof tag !== 'string' || tag.trim().length > 20 || !/^[a-zA-Z0-9]+$/.test(tag.trim())) {
        return res.status(400).json({ error: 'Each tag must be alphanumeric and at most 20 characters' });
      }
    }
  }

  // All checks passed → pass control to the next middleware/route handler
  next();
}

// Helper: check if email string looks like a valid email
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  // Basic pattern: something@somewhere.domain
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

module.exports = { validatePostInput, isValidEmail };
