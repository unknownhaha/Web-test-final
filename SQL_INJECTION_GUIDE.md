# SQL Injection — How to Prevent (Study File)

> Topic: Lecture 08 — OWASP #3 Injection  
> Related mock exam: `src/middleware/validate.js` (input validation is the first layer)

---

## What is SQL Injection?

**SQL Injection** happens when an attacker sends **malicious SQL** through an input field (login, search, URL param) and your app runs it as part of the query.

```
User input:  ' OR '1'='1
Your query:  SELECT * FROM users WHERE email = '' OR '1'='1' AND password = '...'
Result:      Returns ALL users → attacker logs in without password
```

⭐ **MUST REMEMBER:** Never build SQL by **string concatenation** with user input.

---

## Attack Examples

### 1. Login Bypass

**Vulnerable code:**

```javascript
// ❌ DANGEROUS — user input goes directly into SQL string
const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
db.query(query);
```

**Attacker input:**

| Field | Value |
|-------|-------|
| email | `' OR '1'='1' --` |
| password | `anything` |

**SQL that runs:**

```sql
SELECT * FROM users WHERE email = '' OR '1'='1' --' AND password = 'anything'
-- Everything after -- is a comment → condition always true → login bypass
```

---

### 2. Drop Table (Destructive)

**Vulnerable search:**

```javascript
// ❌ DANGEROUS
const query = `SELECT * FROM posts WHERE title LIKE '%${search}%'`;
```

**Attacker input:**

```
'; DROP TABLE posts; --
```

**SQL that runs:**

```sql
SELECT * FROM posts WHERE title LIKE '%'; DROP TABLE posts; --%'
-- Can delete your entire posts table
```

---

### 3. Steal Data (UNION Attack)

**Attacker input in login email:**

```
' UNION SELECT id, email, passwordHash, role FROM users --
```

**Result:** Attacker gets all user rows including password hashes.

---

## How to Fix — 3 Layers of Defense

```
User Input
    │
    ▼
┌─────────────────┐
│ 1. VALIDATION   │  ← reject bad format (mock exam: validate.js)
└────────┬────────┘
         ▼
┌─────────────────┐
│ 2. PARAMETERIZED│  ← #1 fix for SQL injection
│    QUERIES      │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 3. LEAST        │  ← DB user should not have DROP/ALTER rights
│    PRIVILEGE    │
└─────────────────┘
```

---

## Solution 1: Parameterized Queries (Prepared Statements) ⭐

The database driver treats **user input as data only**, never as SQL commands.

### Raw SQL with `?` placeholders (mysql2)

```javascript
// ✅ SAFE — values are sent separately from the query structure
const sql = 'SELECT * FROM users WHERE email = ? AND passwordHash = ?';
const [rows] = await db.execute(sql, [email, passwordHash]);
```

### Named placeholders (pg / PostgreSQL)

```javascript
// ✅ SAFE
const sql = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(sql, [email]);
```

### How it works internally

```
Step 1: DB parses query structure:  SELECT * FROM users WHERE email = ?
Step 2: DB binds value separately:  ' OR '1'='1' --
Step 3: Value treated as plain text → no match → login fails ✅
```

⭐ **Rule:** The query **structure** is fixed. User input can only fill **values**, never change **logic**.

---

## Solution 2: Use an ORM

ORMs (Prisma, Sequelize, TypeORM) use parameterized queries by default.

```javascript
// ✅ SAFE — Sequelize parameterizes automatically
const user = await User.findOne({ where: { email } });

// ✅ SAFE — Prisma
const user = await prisma.user.findUnique({ where: { email } });
```

⚠️ ORM **raw queries** can still be unsafe if you concatenate strings:

```javascript
// ❌ STILL DANGEROUS even with ORM
await sequelize.query(`SELECT * FROM users WHERE email = '${email}'`);
```

---

## Solution 3: Input Validation (First Layer)

From your mock exam — `src/middleware/validate.js`:

```javascript
// Reject malformed input BEFORE it reaches any query
if (!title || typeof title !== 'string' || title.trim().length < 3) {
  return res.status(400).json({ error: 'Invalid title' });
}
```

Validation **alone is not enough** for SQL injection — always combine with parameterized queries.

| Approach | Stops SQL Injection? |
|----------|---------------------|
| Validation only | ❌ Not sufficient alone |
| Parameterized queries | ✅ Primary fix |
| Both together | ✅✅ Best (Defense in Depth) |

---

## Side-by-Side: Vulnerable vs Safe

### Login route

```javascript
// ❌ VULNERABLE
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
  const user = await db.query(query);
  // ...
});

// ✅ SAFE
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  const [rows] = await db.execute(sql, [email.trim()]);
  const user = rows[0];

  const valid = user && await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  // ...
});
```

### Search posts

```javascript
// ❌ VULNERABLE
const sql = `SELECT * FROM posts WHERE title LIKE '%${search}%'`;

// ✅ SAFE
const sql = 'SELECT * FROM posts WHERE title LIKE ?';
const [rows] = await db.execute(sql, [`%${search}%`]);
```

### Get post by ID

```javascript
// ❌ VULNERABLE — even numeric-looking input can attack
const sql = `SELECT * FROM posts WHERE id = ${req.params.id}`;

// ✅ SAFE
const sql = 'SELECT * FROM posts WHERE id = ?';
const [rows] = await db.execute(sql, [Number(req.params.id)]);
```

---

## Mock Exam vs Real SQL

Your mock exam uses an **in-memory array**, not SQL:

```javascript
// src/db/data.js — array lookup (no SQL = no SQL injection here)
function findUserByEmail(email) {
  return users.find((u) => u.email === email);
}
```

But in a **real exam or production app** with MySQL/PostgreSQL, you must use parameterized queries.

**Mapping mock exam → real SQL:**

| Mock exam (array) | Real SQL equivalent |
|-------------------|---------------------|
| `findUserByEmail(email)` | `SELECT * FROM users WHERE email = ?` |
| `findPostById(id)` | `SELECT * FROM posts WHERE id = ?` |
| `validatePostInput()` | Still needed before query |
| `bcrypt.compare()` | Still needed after fetching user |

---

## NoSQL Injection (Bonus — also in Lecture 08)

MongoDB can have similar issues if you pass raw objects from user input:

```javascript
// ❌ DANGEROUS — attacker sends: { "email": { "$gt": "" }, "password": { "$gt": "" } }
const user = await db.collection('users').findOne(req.body);

// ✅ SAFE — extract and validate specific fields
const { email, password } = req.body;
if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email' });
const user = await db.collection('users').findOne({ email: email.trim() });
```

---

## Quick Checklist for Exam

- [ ] Never use `` `SELECT ... '${userInput}'` `` (template literal concat)
- [ ] Always use `?` or `$1` placeholders
- [ ] Pass values as **second argument** array
- [ ] Validate input on **server-side** first
- [ ] Use **bcrypt** for passwords (never store/compare plain text)
- [ ] DB user should have **least privilege** (no DROP/ALTER in production)

---

## Practice Questions

**Q1:** Why does `' OR '1'='1` bypass login?  
**A:** It closes the string, adds `OR true`, and comments out the rest — making WHERE always true.

**Q2:** Does `isValidEmail()` alone prevent SQL injection?  
**A:** No. It helps but parameterized queries are the primary fix.

**Q3:** Is this safe? `` db.query(`SELECT * FROM posts WHERE id = ${parseInt(id)}`) ``  
**A:** No. Always use placeholders — `parseInt` doesn't stop all attacks and is not a security control.

---

## See Also

- Runnable demo: `src/examples/sqlInjection.demo.js`
- Mock exam validation: `src/middleware/validate.js`
- Mock exam login (safe pattern): `src/routes/auth.js`
- Study guide: `STUDY_GUIDE.md` → Lecture 08 section
