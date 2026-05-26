# DO NOT OPEN UNTIL YOU FINISH THE MOCK EXAM

---

## Part A — Theory Answers

### A1. Event Loop
**Output:** `1`, `5`, `3`, `4`, `2`

Synchronous code runs first (1, 5). Then the event loop drains the **microtask queue** completely (Promise `.then` → 3, `queueMicrotask` → 4). Only then does it take one **macrotask** from the task queue (`setTimeout` → 2).

### A2. Promise Combinators

| Scenario | Combinator | On one rejection |
|----------|------------|------------------|
| Need both user + posts | `Promise.all` | Entire thing rejects |
| First response wins | `Promise.race` | Rejects if first settled promise rejects |
| Status of all uploads | `Promise.allSettled` | Never rejects; each result has `status` |

### A3. AuthN vs AuthZ
JWT after login only proves **identity** (AuthN). The `role` claim must be **verified server-side on every protected route** (AuthZ). A user could modify a client-side role flag or use a token with `role: "user"` and still hit DELETE if the server only checks "is logged in."

**Attack:** Alice (user) sends `DELETE /api/posts/1` — if the route only calls `authenticate` without `authorize('admin')` or owner check, she deletes Bob's post.

### A4. Validation vs Sanitization
- **Validation first** at server (reject bad input).
- Allow-list example: title must match `/^[a-zA-Z0-9\s.,!?-]{3,100}$/` or simply enforce type + length.
- Client-side validation is UX only — attackers bypass with curl/Postman.

### A5. Web Workers
**Can:** fetch/XHR, IndexedDB, setTimeout  
**Cannot:** DOM access (`document`), `window` object, UI events  

**Service Worker** when you need offline caching, network proxy, push notifications — not for one-off heavy math (use Dedicated Worker).

### A6. Service Worker Lifecycle
Order: **registered** → **installing** → **waiting** → **activating**

`event.waitUntil(promise)` keeps the install phase alive until caching/preload finishes.

### A7. Testing Levels
1. Integration  
2. Unit  
3. System / E2E  
4. Acceptance  

### A8. Boundary Values (examples)
- `""` (empty — invalid)
- `"ab"` (2 chars — invalid, below min)
- `"abc"` (3 chars — valid minimum)
- 100-char string (valid maximum)
- 101-char string (invalid, above max)

### A9. OWASP Match
1-B, 2-A, 3-D, 4-C

---

## Part B — Coding Reference

Key patterns to check your implementation against:
- `Promise.all([mockFetchUser(), mockFetchPosts()])`
- `bcrypt.compare(password, user.passwordHash)`
- `jwt.verify(token, secret, { algorithms: ['HS256'] })`
- Owner check: `post.userId === req.user.sub || req.user.role === 'admin'`

---

## Part C — Sample Bug Report

**Title:** Non-admin user can delete another user's post via DELETE /api/posts/:id  

**Severity:** Critical  
**Priority:** P1  
**Module:** Posts API / Access Control  

**Steps to Reproduce:**
1. Login as alice@mock.test, obtain JWT
2. `DELETE /api/posts/1` with Authorization header
3. Post id 1 (owned by Bob) is removed

**Expected:** 403 Forbidden — only admin may delete  
**Actual:** 204 No Content — post deleted  

**Environment:** localhost:3000, Node 20  
