/**
 * TODO (B2): Implement server-side validation
 * See MOCK_EXAM.md for rules
 */

function validatePostInput(req, res, next) {
  // TODO: Validate title, body, tags
  // Return 400 with { error: "..." } on failure
  // Call next() on success

  next(); // REMOVE THIS — currently passes everything (intentional bug)
}

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

module.exports = { validatePostInput, isValidEmail };
