# CSS234 Web Programming II — Study Guide

> สรุปจาก Lecture 06, 07, 08, 09 + code ตัวอย่างจาก mock exam project  
> ใช้ทบทวนก่อนสอบ — ดู **⭐ MUST REMEMBER** ก่อน

---

## Table of Contents

1. [Lecture 06 — Concurrency & Network](#lecture-06--concurrency--network)
2. [Lecture 07 — Web Workers](#lecture-07--web-workers)
3. [Lecture 08 — Security & Testing](#lecture-08--security--testing)
4. [Lecture 09 — Web Testing](#lecture-09--web-testing)
5. [Quick Exam Cheat Sheet](#quick-exam-cheat-sheet)

---

# Lecture 06 — Concurrency & Network

## 1. JavaScript Engine (V8)

| Concept | ความหมาย |
|---------|----------|
| **V8** | JS engine ของ Google — ใช้ใน Chrome และ Node.js |
| **JIT Compiler** | แปลง bytecode → machine code ตอน runtime เพื่อ performance |
| **Ignition** | Interpreter — แปลง AST → bytecode, รันเร็ว, เก็บ profiling data |
| **TurboFan** | Optimizing compiler — compile "hot" code เป็น machine code |
| **De-optimization** | ถ้า type เปลี่ยน runtime → engine ทิ้ง optimized code, กลับ Ignition (ช้าลง) |

⭐ **MUST REMEMBER:** JavaScript เป็น **dynamic typing** → type เปลี่ยนได้ runtime → ทำให้ de-optimize ได้

---

## 2. Single-Threaded & Main Thread

```
Main Thread ทำได้ทีละอย่าง:
  ├── Execute JS (Call Stack)
  ├── Parse HTML/CSS
  └── Render UI
```

Browser มี **Web APIs** คนละ thread (DOM, fetch, setTimeout) แต่ **JS engine เอง** single-threaded

⭐ **MUST REMEMBER:** Long-running task บน main thread → **UI jank / frozen** (เช่น parse CSV 50MB, image filter)

**Demo — block main thread** (จาก `public/main.js`):

```javascript
// ❌ Blocks UI 2 วินาที
blockBtn.addEventListener('click', () => {
  const start = Date.now();
  while (Date.now() - start < 2000) { /* freeze */ }
});
```

---

## 3. Event Loop & Task Queues

```
┌─────────────┐
│  Call Stack │  ← synchronous code รันก่อน
└──────┬──────┘
       │ stack ว่าง?
       ▼
┌─────────────────┐
│ Microtask Queue │  ← Promise.then, queueMicrotask, MutationObserver
│  (drain ALL)    │
└──────┬──────────┘
       ▼
┌─────────────────┐
│ Macrotask Queue │  ← setTimeout, setInterval, I/O, UI rendering
│  (one at a time)│
└─────────────────┘
```

⭐ **MUST REMEMBER — Golden Rule:**  
**Microtasks ต้องหมดก่อน** macrotask ถัดไป

**Classic exam question:**

```javascript
console.log('A');
setTimeout(() => console.log('B'), 0);   // macrotask
Promise.resolve().then(() => console.log('C')); // microtask
console.log('D');

// Output: A → D → C → B
```

**Extended version (จาก mock exam Part A1):**

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
queueMicrotask(() => console.log('4'));
console.log('5');

// Output: 1 → 5 → 3 → 4 → 2
```

---

## 4. Async Evolution: Callbacks → Promises → Async/Await

| Phase | ปัญหา / ข้อดี |
|-------|--------------|
| **Callbacks** | Callback Hell, inversion of control |
| **Promises (ES6)** | Pending / Fulfilled / Rejected, chain `.then()` |
| **Async/Await (ES8)** | Syntactic sugar บน Promises, อ่านเหมือน sync |

**Async/Await + error handling:**

```javascript
async function loadData() {
  try {
    const data = await fetchData();
    renderUI(data);
  } catch (error) {
    showFallbackUI();
  }
}
```

**Demo จาก `src/utils/fetchDashboard.js`:**

```javascript
// ❌ Sequential — ~200ms (100 + 100)
const user = await mockFetchUser();
const posts = await mockFetchPosts();

// ✅ Concurrent — ~100ms
const [user, posts] = await Promise.all([
  mockFetchUser(),
  mockFetchPosts()
]);
```

---

## 5. Promise Combinators

⭐ **MUST REMEMBER — มักออกสอบจับคู่**

| Combinator | ใช้เมื่อ | ถ้า 1 ตัว reject |
|------------|---------|-----------------|
| `Promise.all([p1, p2])` | ต้องการผลลัพธ์ **ครบทุกตัว** | **reject ทั้งก้อน** |
| `Promise.race([p1, p2])` | เอาตัวที่ **เสร็จก่อน** | reject ถ้าตัวแรกที่ settle reject |
| `Promise.allSettled([p1, p2])` | ต้องการ **status ทุกตัว** | **ไม่ reject** — แต่ละตัวมี `{ status, value/reason }` |

```javascript
// Fetch user + posts พร้อมกัน
const [userRes, postsRes] = await Promise.all([
  fetch('/api/user'),
  fetch('/api/posts')
]);
```

---

## 6. Fetch API

```javascript
// GET
const res = await fetch('/api/posts');
const data = await res.json();

// POST with JSON body
const res = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ title: 'Hello', body: 'World' })
});
```

| Option | ใช้ทำอะไร |
|--------|----------|
| `method` | GET, POST, PUT, DELETE |
| `headers` | Content-Type, Authorization, API keys |
| `body` | `JSON.stringify(data)` สำหรับ POST/PUT |

⭐ **MUST REMEMBER:** **CORS** = browser security — server ต้อง allow cross-origin เอง

---

## 7. AbortController — Cancel Requests

⭐ **Use case:** search box พิมพ์เร็ว → cancel request เก่า

```javascript
const controller = new AbortController();

fetch('/search?q=apple', { signal: controller.signal });

// user พิมพ์ต่อ → cancel
controller.abort();
```

---

## 8. Client-Side Storage

| Storage | Sync/Async | ใช้กับ | ข้อจำกัด |
|---------|-----------|--------|----------|
| **localStorage** | Sync (block main thread) | token, theme | string เท่านั้น, ขนาดเล็ก |
| **sessionStorage** | Sync | session data | หายเมื่อปิด tab |
| **IndexedDB** | Async | JSON ขนาดใหญ่, offline | NoSQL, ใช้จาก Worker ได้ |
| **Cache API** | Async | Request/Response objects | PWA, app shell |

⭐ **MUST REMEMBER — Exam scenario:**  
Offline dashboard + JSON data → **IndexedDB** (async, structured, worker-accessible)

---

# Lecture 07 — Web Workers

## 1. Why Web Workers?

```
Main Thread          Worker Thread (background)
     │                      │
     │  postMessage(data)   │
     │ ──────────────────►  │
     │                      │ heavy computation
     │  onmessage(result)   │
     │ ◄──────────────────  │
     │                      │
  UI stays responsive!
```

⭐ **MUST REMEMBER:** Worker รันคนละ thread → **UI ไม่ค้าง**

---

## 2. Types of Workers

| Type | ความสัมพันธ์ | ใช้เมื่อ |
|------|-------------|---------|
| **Dedicated Worker** | 1 script ↔ 1 worker | heavy math, parse CSV/JSON |
| **Shared Worker** | หลาย tab/script แชร์ worker เดียว | sync state ข้าม tab (same origin) |
| **Service Worker** | network proxy | offline, push, background sync |

---

## 3. Dedicated Worker — Code Pattern

**Main thread** (`public/main.js`):

```javascript
const worker = new Worker('worker.js');

worker.onmessage = (e) => {
  console.log(e.data); // { avgWordCount, longestTitle, postCount }
  worker.terminate();  // ⭐ terminate หลังได้ผล — จาก main thread
};

worker.postMessage(posts); // Structured Clone — copy ไม่ share
```

**Worker thread** (`public/worker.js`):

```javascript
onmessage = (e) => {
  const posts = e.data;
  // ... heavy work ...
  postMessage({ avgWordCount, longestTitle, postCount });
  // ❌ อย่า terminate() ใน worker file — ให้ main thread ทำ
};
```

⭐ **MUST REMEMBER — Worker CAN vs CANNOT**

| ✅ CAN | ❌ CANNOT |
|--------|----------|
| fetch, XMLHttpRequest | DOM (`document`) |
| IndexedDB, WebSockets | `window` object |
| setTimeout, setInterval | UI events (click, scroll) |

**Communication:** `postMessage()` + `onmessage` — data ถูก **copy** (Structured Clone Algorithm)

**Terminate:**
- Main: `worker.terminate()`
- Inside worker: `self.close()`

**Errors:** listen `onerror` → ได้ `message`, `filename`, `lineno`

---

## 4. Shared Workers

```javascript
// Main thread — ต้องใช้ .port
const sw = new SharedWorker('shared-worker.js');
sw.port.start();
sw.port.postMessage('hello');

// Inside SharedWorker
onconnect = (e) => {
  const port = e.ports[0];
  port.onmessage = (ev) => { /* ... */ };
};
```

⭐ **MUST REMEMBER:** Shared Worker ต้อง **same origin** + ใช้ **MessagePort** (`.port.start()`)

---

## 5. Service Workers

### Concept
- **Programmable network proxy** ระหว่าง app กับ network
- ต้อง **HTTPS** (หรือ localhost ตอน dev)

### Lifecycle ⭐ MUST REMEMBER

```
register → installing → waiting → activating → active
```

| Phase | Event | ทำอะไร |
|-------|-------|--------|
| **Registration** | `navigator.serviceWorker.register('/sw.js')` | feature detect ก่อน |
| **Installing** | `install` | pre-cache app shell; `event.waitUntil(promise)` |
| **Waiting** | — | SW ใหม่รอ tab เก่าปิด |
| **Activating** | `activate` | ลบ cache เก่า; `clients.claim()` |

**Key APIs:**

```javascript
// Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log(reg.scope))
    .catch(err => console.error(err));
}

// Install — cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then(cache => cache.addAll(['/', '/style.css', '/app.js']))
  );
  self.skipWaiting(); // ใช้ด้วย caution — บังคับ activate ทันที
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(/* delete old caches */);
  clients.claim(); // control tabs ทันทีโดยไม่ต้อง refresh
});

// Fetch — intercept network
self.addEventListener('fetch', (event) => {
  event.respondWith(/* cache or network strategy */);
});
```

### Caching Strategies ⭐

| Strategy | เหมาะกับ |
|----------|---------|
| **Cache First, Network Fallback** | static assets (images, CSS, JS) |
| **Network First, Cache Fallback** | dynamic API data |

⭐ **Best practice:** วาง `sw.js` ที่ **root** เพื่อ control scope กว้างสุด  
⭐ **Dev tip:** Chrome DevTools → Application → Service Workers → "Update on reload"

---

# Lecture 08 — Security & Testing

## 1. OWASP Top 10 (สรุปที่มักออก)

| # | Risk | Prevention |
|---|------|------------|
| Broken Access Control | Deny by default, RBAC, check ทุก route |
| Cryptographic Failures | HTTPS, bcrypt, ไม่ใช้ MD5/SHA1 สำหรับ password |
| Injection | Parameterized queries, input validation |
| Insecure Design | Threat modeling ตั้งแต่ design phase |
| Security Misconfiguration | เปลี่ยน default password, ปิด feature ที่ไม่ใช้ |
| Vulnerable Components | update dependencies, patch strategy |
| Auth Failures | MFA, rate limit, strong password policy |

---

## 2. AuthN vs AuthZ ⭐ MUST REMEMBER

| | Authentication (AuthN) | Authorization (AuthZ) |
|---|----------------------|----------------------|
| คำถาม | คุณคือใคร? | คุณทำได้ไหม? |
| ตัวอย่าง | Login, password, JWT issue | Role check, owner check |
| analogy | ประตูบ้าน | ลิ้นชักข้างใน |

**Demo จาก mock exam:**

```javascript
// AuthN — ยืนยันตัวตน (src/middleware/auth.js)
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  req.user = decoded; // { sub, email, role }
  next();
}

// AuthZ — ตรวจสิทธิ์
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

```javascript
// Broken Access Control fix (src/routes/posts.js)
// PUT — owner หรือ admin เท่านั้น
if (post.userId !== req.user.sub && req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Forbidden' });
}

// DELETE — admin เท่านั้น
router.delete('/:id', authenticate, authorize('admin'), handler);
```

⭐ **HTTP Status ที่ต้องจำ:**
- **401** = ไม่ได้ login / token ไม่ valid
- **403** = login แล้ว แต่ **ไม่มีสิทธิ์**
- **404** = ไม่พบ resource

---

## 3. RBAC vs ABAC

| | RBAC | ABAC |
|---|------|------|
| อิงจาก | Role (admin, user) | Attributes (location, time, device) |
| ข้อดี | audit ง่าย | flexible |
| ข้อเสีย | role explosion | implement ซับซ้อน |

⭐ **Zero Trust:** "Never trust, always verify" — verify ทุก request

---

## 4. JWT (JSON Web Token)

```
Header.Payload.Signature
  │       │        └── verify ด้วย secret (HS256) หรือ public key (RS256)
  │       └── claims: { sub, email, role } — encoded ไม่ใช่ encrypted!
  └── { alg: "HS256", typ: "JWT" }
```

### Common Vulnerabilities ⭐

| Attack | วิธี |
|--------|-----|
| **"none" algorithm** | เปลี่ยน alg เป็น none → bypass signature |
| **Weak secret** | brute-force secret key |
| **Algorithm confusion** | บังคับ HMAC verify RSA public key |

### Best Practices ⭐

- ใช้ **RS256** (asymmetric) ดีกว่า HS256 ใน distributed system
- Access token **สั้น** (เช่น 1h)
- Refresh token สำหรับ session ยาว
- Revocation: deny list (Redis) หรือ short TTL

**Demo login** (`src/routes/auth.js`):

```javascript
const token = signToken({ sub: user.id, email: user.email, role: user.role });
// signToken uses: jwt.sign(payload, secret, { expiresIn: '1h' })
```

---

## 5. Validation vs Sanitization ⭐ MUST REMEMBER

| | Validation | Sanitization |
|---|-----------|--------------|
| เป้าหมาย | ข้อมูล **ถูกต้อง**ไหม? | ข้อมูล **ปลอดภัย**ไหม? |
| การทำ | **Reject** ถ้าไม่ผ่าน | **Clean/modify** ข้อมูล |
| ตัวอย่าง | email ต้องมี `@` | strip `<script>` tags |

**Strategies:**
- **Allow-list (whitelist)** ✅ แนะนำ — อนุญาตเฉพาะ pattern ที่รู้ว่าดี
- **Block-list (blacklist)** ❌ อ่อนแอ — attacker หลบได้เสมอ

**Demo** (`src/middleware/validate.js`):

```javascript
function validatePostInput(req, res, next) {
  const { title, body, tags } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 100) {
    return res.status(400).json({ error: 'Title must be 3-100 characters' });
  }
  // ... body, tags checks ...
  next();
}
```

### Golden Rules ⭐ MUST REMEMBER

1. **Validate at the server** — client validation = UX เท่านั้น
2. **Encode on output** — เวลา render HTML
3. **Defense in depth** — validation + sanitization + parameterized queries

---

## 6. Injection & Sensitive Data

**SQL Injection prevention:**

```javascript
// ❌ String concat — inject ได้
db.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ Parameterized query
db.query('SELECT * FROM users WHERE email = ?', [email]);
```

**Sensitive data ("Crown Jewels"):**
- PII, financial data, credentials, API keys

**Protection:**

| | In Transit | At Rest |
|---|-----------|---------|
| Solution | **HTTPS / TLS 1.2+**, HSTS | **AES-256** encryption |
| Password | — | **bcrypt** (ไม่ใช่ MD5/SHA1) |

---

## 7. Environment Variables ⭐

```bash
# .env (ห้าม commit!)
JWT_SECRET=your-secret-key
PORT=3000
```

```javascript
// dotenv loads into process.env
require('dotenv').config();
const secret = process.env.JWT_SECRET;
```

⭐ **MUST REMEMBER:**
- **NEVER commit `.env`** → ใส่ใน `.gitignore`
- สร้าง `.env.example` เป็น template (placeholder values)
- Keys ใน `.env` ต้องตรงกับ `process.env.KEY` ใน code

---

## 8. Testing Pyramid (จาก Lecture 08)

```
        / E2E \          ← น้อย, ช้า, ครอบคลุม flow
       / Integr \        ← กลาง, ทด component ร่วมกัน
      /   Unit    \      ← มาก, เร็ว, ทด function เดี่ยว
```

---

# Lecture 09 — Web Testing

## 1. Testing Goals

- ตรวจว่า meet requirements และทำงานถูก under all circumstances
- **ไม่ใช่** ลบ bug ให้หมด — แต่ลด bug ให้ user ใช้งานได้

## 2. Which Bugs to Fix?

| Factor | คำถาม |
|--------|-------|
| **Severity** | เจ็บปวดแค่ไหน? |
| **Frequency** | เกิดบ่อยแค่ไหน? |
| **Workaround** | มีทางอ้อนไหม? |
| **Difficulty** | แก้ยากแค่ไหน? |
| **Riskiness** | แก้แล้วพังอย่างอื่นไหม? |

---

## 3. Testing Levels ⭐ MUST REMEMBER

| Level | ทดอะไร | ตัวอย่างใน mock exam |
|-------|--------|---------------------|
| **Unit** | function/class เดี่ยว | `validatePostInput()` แยกเดี่ยว |
| **Integration** | component ทำงานร่วมกัน | `supertest` → POST `/api/posts` + JWT |
| **Regression** | แก้ code แล้วของเก่ายัง work | รัน test ทั้งชุดหลังแก้ |
| **System / E2E** | ทั้งระบบ end-to-end | login → create post → logout |
| **Acceptance** | ตรง requirements ลูกค้า | UAT sign-off |

**Flow ที่ดี:** Unit → Integration → Regression → System

---

## 4. Testing Techniques ⭐

| Technique | รู้ internal? | วิธี |
|-----------|--------------|------|
| **Black-box** | ❌ ไม่รู้ | ส่ง input → ดู output; boundary values, special chars |
| **White-box** | ✅ รู้ | ออกแบบ test ให้ crash path ที่รู้ — แต่**อย่า skip** case ที่คิดว่าผ่าน |
| **Gray-box** | บางส่วน | รู้ algorithm (เช่น quicksort) + black-box tests เพิ่ม |

**Black-box boundary example** (`title` 3–100 chars):

```
""        → invalid (empty)
"ab"      → invalid (2 chars, below min)
"abc"     → valid (minimum)
[100 chars] → valid (maximum)
[101 chars] → invalid (above max)
```

---

## 5. Release Testing

| Type | จุดประสงค์ |
|------|-----------|
| **Requirements-based** | ทุก requirement ต้อง testable |
| **Scenario testing** | story การใช้งานจริง → test cases |
| **Performance / Stress** | ระบบ degrade เมื่อ load สูง — หา breaking point |

**Defect testing** (dev team) vs **Validation testing** (release team / ลูกค้า)

---

## 6. Bug Report Format ⭐ MUST REMEMBER

| Field | รายละเอียด |
|-------|-----------|
| **Bug ID** | unique number |
| **Title** | สั้น ชัด |
| **Severity** | Blocker / Critical / Major / Minor / Trivial |
| **Priority** | P1 (fix ทันที) → P5 (เมื่อว่าง) |
| **Steps to Reproduce** | ต้อง reproduce ได้ — ไม่งั้นไม่มีใครแก้ |
| **Expected vs Actual** | ควรเป็น vs เป็น |
| **Environment** | OS, browser, version |

**Severity vs Priority:**
- **Severity** = impact ต่อ user
- **Priority** = เร่งแค่ไหน

---

## 7. How to Fix a Bug

1. คิดว่าจะ **prevent** bug คล้าย ๆ ในอนาคตยังไง
2. หา bug ที่ **ซ่อนอยู่** ใกล้ ๆ
3. ตรวจว่า fix **ไม่สร้าง bug ใหม่**

---

# Quick Exam Cheat Sheet

## Top 20 สิ่งที่ต้องจำ

| # | Topic | จำว่า |
|---|-------|------|
| 1 | Event Loop | Sync → microtasks (all) → macrotask (one) |
| 2 | Output ADCB | A, D, C, B สำหรับ classic question |
| 3 | Promise.all | ครบทุกตัว / 1 reject = ทั้งก้อน reject |
| 4 | Promise.race | ตัวแรกที่ settle |
| 5 | Promise.allSettled | status ทุกตัว, ไม่ reject ทั้งก้อน |
| 6 | Promise.all vs sequential | concurrent เร็วกว่า |
| 7 | Worker CANNOT | DOM, window, UI events |
| 8 | postMessage | copy data (Structured Clone) |
| 9 | SW lifecycle | register → install → wait → activate |
| 10 | event.waitUntil | ค้าง install จน cache เสร็จ |
| 11 | Cache First | static assets |
| 12 | Network First | dynamic API |
| 13 | AuthN vs AuthZ | ใคร vs ทำได้ไหม |
| 14 | 401 vs 403 | ไม่ login vs ไม่มีสิทธิ์ |
| 15 | Validate server-side | client = UX only |
| 16 | Allow-list > Block-list | whitelist ดีกว่า |
| 17 | JWT payload | encoded ไม่ encrypted |
| 18 | .env | ห้าม commit, ใช้ .gitignore |
| 19 | bcrypt | password hash — ไม่ใช่ MD5 |
| 20 | Testing pyramid | Unit มาก → E2E น้อย |

---

## Map: Lecture → Mock Exam Code

| Lecture Topic | ไฟล์ใน project |
|--------------|---------------|
| Promise.all | `src/utils/fetchDashboard.js` |
| Server validation | `src/middleware/validate.js` |
| JWT AuthN + AuthZ | `src/middleware/auth.js` |
| Broken Access Control | `src/routes/posts.js` |
| Login + bcrypt | `src/routes/auth.js` |
| Dedicated Worker | `public/worker.js` + `public/main.js` |
| Integration tests | `tests/api.test.js` |

---

## ลำ Try-Fix ก่อนสอบ (30 นาที)

```powershell
npm test                    # ต้อง pass 15/15
npm run dev                 # เปิด localhost:3000
# ทด login → GET posts → PUT ของคนอื่น (403) → DELETE เป็น user (403)
# กด "Load Stats in Worker" → UI ไม่ค้าง
# อธิบาย Event Loop output ได้
# จับคู่ OWASP + Promise combinator ได้
```

Good luck!
