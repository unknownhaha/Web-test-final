/**
 * TODO (B2): Implement server-side validation
 * See MOCK_EXAM.md for rules
 */

function validatePostInput(req, res, next) {
  // Check if req.body is an object and not null
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // ใช้ rest operator เพื่อดึง fields ที่เรารู้จัก และเก็บตัวที่เหลือไว้ใน unknownFields
  const { title, body, tags, ...unknownFields } = req.body;

  // โบนัส: ปฏิเสธ (reject) หากมี unknown fields โผล่มาใน POST body (แนวคิด allow-list)
  if (Object.keys(unknownFields).length > 0) {
    return res.status(400).json({ error: 'Unknown fields are not allowed in the request body.' });
  }

  // 1. Validate 'title': Required string, trim, length 3-100
  if (typeof title !== 'string') {
    return res.status(400).json({ error: 'Title is required and must be a string.' });
  }
  const trimmedTitle = title.trim();
  if (trimmedTitle.length < 3 || trimmedTitle.length > 100) {
    return res.status(400).json({ error: 'Title must be between 3 and 100 characters.' });
  }

  // 2. Validate 'body': Required string, trim, length 1-2000
  if (typeof body !== 'string') {
    return res.status(400).json({ error: 'Body is required and must be a string.' });
  }
  const trimmedBody = body.trim();
  if (trimmedBody.length < 1 || trimmedBody.length > 2000) {
    return res.status(400).json({ error: 'Body must be between 1 and 2000 characters.' });
  }

  // 3. Validate 'tags': Optional array; max 5 items; แต่ละ tag เป็น alphanumeric, max 20 chars
  let processedTags = undefined;
  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be an array.' });
    }
    if (tags.length > 5) {
      return res.status(400).json({ error: 'Maximum of 5 tags are allowed.' });
    }
    processedTags = [];
    for (const tag of tags) {
      if (typeof tag !== 'string') {
        return res.status(400).json({ error: 'Each tag must be a string.' });
      }
      const trimmedTag = tag.trim();
      if (trimmedTag.length === 0 || trimmedTag.length > 20) {
        return res.status(400).json({ error: 'Each tag must be between 1 and 20 characters.' });
      }
      if (!/^[a-zA-Z0-9]+$/.test(trimmedTag)) {
        return res.status(400).json({ error: 'Each tag must be alphanumeric.' });
      }
      processedTags.push(trimmedTag);
    }
  }

  // นำค่าที่ผ่านการตรวจสอบและ trim แล้วไปใช้ต่อ (Sanitization / Allow-list replacement)
  req.body = {
    title: trimmedTitle,
    body: trimmedBody,
  };
  if (processedTags !== undefined) {
    req.body.tags = processedTags;
  }

  // ส่งผ่านไปยัง middleware/route ถัดไปเมื่อ validate ผ่านทั้งหมด
  next();
}



function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

module.exports = { validatePostInput, isValidEmail };
