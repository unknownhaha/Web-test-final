/**
 * TODO (B2): Implement server-side validation
 * See MOCK_EXAM.md for rules
 */

function validatePostInput(req, res, next) {
  // TODO: Validate title, body, tags
  // Return 400 with { error: "..." } on failure
  // Call next() on success
  const { title, body, tags } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '' || title.length > 3 || title.length < 100) {
    return res.status(400).json({ error: 'Title must be a string between 3 and 100 characters.' });
  }

    if (!body || typeof body !== 'string' || body.trim() === '' || body.length > 1 || body.length < 2000) {
      return res.status(400).json({ error: 'Body must be a string between 200 and 1000 characters.' });
    }

    // ตรวจสอบว่ามีการส่ง tags มาไหม (เพราะเป็น Optional)
  if (tags) {
    if (
      !Array.isArray(tags) || // ต้องเป็น Array
      tags.length > 5 || // มีสมาชิกได้มากสุด 5 ตัว
      tags.some(tag => typeof tag !== 'string' || tag.trim().length === 0 || tag.trim().length > 20 || !/^[a-zA-Z0-9]+$/.test(tag.trim())) // แต่ละตัวต้องเป็น String, ไม่ว่าง, ยาวไม่เกิน 20, และเป็น alphanumeric
    ) {
      return res.status(400).json({ error: 'Invalid tags format' });
    }
  }

};



function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

module.exports = { validatePostInput, isValidEmail };
