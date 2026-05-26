# CSS234 Web Programming II — Mock Exam

**Topics:** Concurrency & Network · Web Workers · Security & Testing · Web Testing  
**Duration:** ~2 hours (suggested)  
**Stack:** Express.js + in-memory arrays (no real database)

---

## Instructions

1. Read each part carefully before coding.
2. **Part A** is theory — write answers in a text file or on paper.
3. **Part B** is hands-on — complete the TODOs in this project.
4. Run `npm install` then `npm test` to check your work.
5. Do **not** open `ANSWER_KEY.md` until you finish.

---

## Part A — Theory (40 points)

### A1. Event Loop (5 pts)

What is the **exact output order** of this code? Explain why microtasks run before macrotasks.

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
queueMicrotask(() => console.log('4'));
console.log('5');
```

---

### A2. Promise Combinators (5 pts)


| Scenario                                                       | Which combinator? | Behavior if one promise rejects |
| -------------------------------------------------------------- | ----------------- | ------------------------------- |
| Fetch user + posts together; need **both**                     |                   | ?                               |
| Search autocomplete; take **first** response                   | ?                 | ?                               |
| Batch upload 5 files; need **status of all** even if some fail | ?                 | ?                               |


Fill in the table.

---

### A3. AuthN vs AuthZ (4 pts)

A student says: *"JWT login proves the user is an admin, so we don't need role checks on DELETE routes."*

Explain why this is **wrong**. Give one attack scenario using the mock API (`/api/users` vs `/api/admin/users`).

---

### A4. Validation vs Sanitization (4 pts)

For a blog comment field that allows plain text only:

- Which approach do you use **first** at the server — validation or sanitization?
- Give one **allow-list** validation rule you would apply.
- Why is client-side validation **not enough** for security?

---

### A5. Web Workers (4 pts)

List **two things** a Dedicated Worker **can** do and **two things** it **cannot** do (from the main thread's perspective).

When would you choose a **Service Worker** over a Dedicated Worker?

---

### A6. Service Worker Lifecycle (4 pts)

Put these phases in order: `waiting` → `installing` → `activating` → `registered`

What does `event.waitUntil()` do during the **install** phase?

---

### A7. Testing Pyramid (4 pts)

Classify each as **Unit**, **Integration**, **System/E2E**, or **Acceptance**:

1. `supertest` hits `POST /api/posts` with a fake JWT
2. Testing `validatePostInput()` function alone
3. QA team runs full login → create post → logout flow in staging
4. Customer UAT sign-off before release

---

### A8. Black-Box Boundary Values (5 pts)

`createPost(title, body)` requires `title` length **3–100** characters.

List **5 boundary test inputs** a black-box tester should try (include invalid cases).

---

### A9. OWASP Quick Match (5 pts)

Match the vulnerability to the prevention:


| Vulnerability                                   | Prevention                                  |
| ----------------------------------------------- | ------------------------------------------- |
| 1. SQL/NoSQL Injection                          | A. Deny by default + RBAC                   |
| 2. Broken Access Control                        | B. Parameterized queries / no string concat |
| 3. Sensitive data in `.env` committed to Git    | C. HTTPS + bcrypt for passwords             |
| 4. Cryptographic failures (plaintext passwords) | D. `.gitignore` + `.env.example`            |


---

## Part B — Coding (60 points)

Start the server: `npm run dev`  
Base URL: `http://localhost:3000`

Mock data is pre-loaded in `src/db/data.js`.

---

### B1. Fix Async Concurrency — `src/utils/fetchDashboard.js` (10 pts)

The dashboard loader fetches user profile and posts **sequentially** (slow).  
Refactor to fetch **concurrently** using `Promise.all`.  
Add `try/catch` and return `{ error: message }` on failure instead of crashing.

**Test:** `npm test -- --grep "fetchDashboard"`

---

### B2. Server-Side Validation — `src/middleware/validate.js` (10 pts)

Implement `validatePostInput(req, res, next)`:


| Field   | Rule                                                             |
| ------- | ---------------------------------------------------------------- |
| `title` | Required string, trim, length 3–100                              |
| `body`  | Required string, trim, length 1–2000                             |
| `tags`  | Optional array; max 5 items; each tag alphanumeric, max 20 chars |


Reject invalid input with **400** and `{ error: "..." }`.  
Use **allow-list** thinking — reject unknown fields on POST body if you want bonus points.

**Test:** `npm test -- --grep "validatePostInput"`

---

### B3. JWT Authentication — `src/middleware/auth.js` (15 pts)

Complete:

1. `authenticate` — verify Bearer token from `Authorization` header using `process.env.JWT_SECRET`
2. `authorize(...roles)` — **AuthZ** middleware; return **403** if role not allowed
3. Never accept `alg: "none"` — reject malformed tokens with **401**

Use the mock users:

- `alice@mock.test` / `password123` → role `user`
- `admin@mock.test` / `admin123` → role `admin`

**Test:** `npm test -- --grep "auth middleware"`

---

### B4. Broken Access Control Fix — `src/routes/posts.js` (10 pts)

Currently any logged-in user can edit/delete **any** post. Fix it:

- **GET** `/api/posts` — public (no auth)
- **POST** `/api/posts` — authenticated users only
- **PUT** `/api/posts/:id` — only post **owner** or **admin**
- **DELETE** `/api/posts/:id` — only **admin**

Return **403** for forbidden, **404** if post not found.

**Test:** `npm test -- --grep "posts access control"`

---

### B5. Secure Login Route — `src/routes/auth.js` (5 pts)

Complete `POST /api/auth/login`:

- Validate email format server-side
- Compare password with bcrypt hash (hashes already in mock DB)
- Return JWT with `{ sub, email, role }`, expires in 1h
- Do **not** leak whether email exists ("Invalid credentials" for both cases)

**Test:** `npm test -- --grep "auth login"`

---

### B6. Web Worker Stats — `public/worker.js` + `public/main.js` (10 pts)

Open `http://localhost:3000` in browser.

1. In `worker.js`: compute average word count and longest post title from posts array sent via `postMessage`
2. In `main.js`: spawn worker, post fetched posts, display result in `#stats` without blocking UI
3. Terminate worker after result received

**Manual check:** Click "Load Stats in Worker" — UI must stay responsive.

---

## Part C — Bonus Scenario (optional)

Write a **bug report** (from Lecture 09) for this defect:

> After login as `alice@mock.test`, calling `DELETE /api/posts/1` removes Bob's post.

Include: Title, Severity, Priority, Steps to Reproduce, Expected vs Actual, Module.

---

## Grading Rubric (self-check)


| Score  | Meaning                                  |
| ------ | ---------------------------------------- |
| 80–100 | Strong — ready for exam                  |
| 60–79  | Review JWT, validation, event loop       |
| < 60   | Re-read Lectures 06, 08, 09; redo Part B |


---

## Quick Reference — Mock Accounts


| Email                                     | Password    | Role  |
| ----------------------------------------- | ----------- | ----- |
| [alice@mock.test](mailto:alice@mock.test) | password123 | user  |
| [bob@mock.test](mailto:bob@mock.test)     | password123 | user  |
| [admin@mock.test](mailto:admin@mock.test) | admin123    | admin |


## API Endpoints (when complete)

```
POST   /api/auth/login
GET    /api/posts
POST   /api/posts          (auth)
PUT    /api/posts/:id      (owner or admin)
DELETE /api/posts/:id      (admin only)
GET    /api/users/me       (auth)
GET    /api/admin/users    (admin only)
```

Good luck — you've got this! 🎯