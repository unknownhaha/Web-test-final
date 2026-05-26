# ห้ามเปิดไฟล์นี้จนกว่าจะทำ Mock Exam เสร็จ

---

## Part A — เฉลยทฤษฎี

### A1. Event Loop

**ลำดับ output:** `1`, `5`, `3`, `4`, `2`

**คำอธิบาย:** โค้ดแบบ synchronous ทำงานก่อน (1, 5) จากนั้น **Event Loop** จะ drain **microtask queue** ให้หมดก่อน (Promise `.then` → 3, `queueMicrotask` → 4) แล้วจึงหยิบ **macrotask** จาก task queue มาทำทีละงาน (`setTimeout` → 2)

**กฎสำคัญ:** Microtasks ต้องเสร็จหมดก่อน macrotask ถัดไป

---

### A2. Promise Combinators

| Scenario | Combinator | เมื่อ promise ตัวหนึ่ง reject |
| -------- | ---------- | ----------------------------- |
| ต้องได้ user + posts ครบทั้งคู่ | `Promise.all` | ทั้งชุด reject ทันที |
| เอา response ตัวแรกที่ settle | `Promise.race` | reject ถ้า promise ที่ settle ก่อน reject |
| ต้องการ status ของทุกงาน แม้บางงาน fail | `Promise.allSettled` | ไม่ reject ทั้งก้อน; แต่ละตัวมี `status` แยก |

---

### A3. AuthN vs AuthZ

**AuthN (Authentication)** = ยืนยันตัวตนว่า "คุณคือใคร"  
**AuthZ (Authorization)** = ตรวจสิทธิ์ว่า "คุณทำ action นี้ได้ไหม"

JWT หลัง login พิสูจน์แค่ **identity** (AuthN) แต่ `role` ใน token ต้องถูก **verify ที่ server-side ทุก protected route** (AuthZ) ไม่ใช่เชื่อจาก client อย่างเดียว

**Attack scenario:** Alice (role `user`) ส่ง `DELETE /api/posts/1` — ถ้า route มีแค่ `authenticate` แต่ไม่มี `authorize('admin')` หรือ owner check เธอจะลบ post ของ Bob ได้

---

### A4. Validation vs Sanitization

- ที่ **server** ควรทำ **validation ก่อน** (reject input ที่ไม่ถูกต้อง)
- ตัวอย่าง allow-list: `title` ต้องเป็น string ยาว 3–100 หรือ match pattern เช่น `/^[a-zA-Z0-9\s.,!?-]{3,100}$/`
- **Client-side validation** ใช้เพื่อ UX เท่านั้น — attacker bypass ได้ด้วย curl/Postman

| แนวคิด | Validation | Sanitization |
| ------ | ---------- | ------------ |
| เป้าหมาย | ข้อมูลถูกต้องไหม? | ข้อมูลปลอดภัยไหม? |
| การทำ | reject ถ้าไม่ผ่าน | clean/modify ข้อมูล |

---

### A5. Web Workers

**Dedicated Worker ทำได้:**
- Network requests (`fetch`, `XMLHttpRequest`)
- `IndexedDB`, `setTimeout` / `setInterval`

**Dedicated Worker ทำไม่ได้:**
- จัดการ DOM โดยตรง (`document`)
- เข้าถึง `window` และ UI events (click, scroll)

**เลือก Service Worker เมื่อ:** ต้องการ offline caching, network proxy, push notifications  
**เลือก Dedicated Worker เมื่อ:** ต้องการ offload heavy computation ครั้งเดียว (เช่น parse CSV, image filter)

---

### A6. Service Worker Lifecycle

**ลำดับที่ถูกต้อง:** `registered` → `installing` → `waiting` → `activating`

**`event.waitUntil(promise)`:** บอก browser ให้คง **install phase** ไว้จนกว่า promise (เช่น pre-caching assets) จะ resolve — ป้องกัน SW ถูก terminate กลางคัน

**phase อื่น ๆ ที่ควรรู้:**
- **waiting** — SW ใหม่ install สำเร็จแล้ว แต่ SW เก่ายัง control หน้าอยู่
- **activating** — เหมาะสำหรับลบ cache เก่า; `clients.claim()` บังคับ control tab ทันที

---

### A7. Testing Levels

1. **Integration** — ทดสอบ API route กับ middleware/auth ร่วมกัน  
2. **Unit** — ทดสอบ function เดี่ยว  
3. **System / E2E** — ทด flow ทั้งระบบบน staging  
4. **Acceptance** — UAT โดย customer ก่อน release  

**Testing Pyramid:** Unit มากสุด → Integration → E2E น้อยสุด

---

### A8. Boundary Values (ตัวอย่าง)

| Input | เหตุผล |
| ----- | ------ |
| `""` | empty — invalid |
| `"ab"` | 2 chars — ต่ำกว่า min (3) |
| `"abc"` | 3 chars — valid minimum |
| string ยาว 100 chars | valid maximum |
| string ยาว 101 chars | invalid — เกิน max |

**แนว black-box testing:** ทด boundary, special values (0, empty), special characters

---

### A9. OWASP Match

| ข้อ | คำตอบ |
| --- | ----- |
| 1. SQL/NoSQL Injection | **B** — Parameterized queries / no string concat |
| 2. Broken Access Control | **A** — Deny by default + RBAC |
| 3. Sensitive data ใน `.env` commit ขึ้น Git | **D** — `.gitignore` + `.env.example` |
| 4. Cryptographic failures | **C** — HTTPS + bcrypt for passwords |

---

## Part B — แนวทาง Coding

pattern หลักที่ควรได้หลังทำครบ:

```javascript
// B1 — Concurrent fetch
const [user, posts] = await Promise.all([
  mockFetchUser(),
  mockFetchPosts()
]);

// B3/B5 — JWT verify
jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

// B5 — Password compare
await bcrypt.compare(password, user.passwordHash);

// B4 — Owner or admin check
if (post.userId !== req.user.sub && req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Forbidden' });
}
```

**HTTP status codes ที่ใช้บ่อย:**
- **401** — ไม่ได้ authenticate / token ไม่ valid
- **403** — authenticate แล้ว แต่ไม่มีสิทธิ์ (AuthZ fail)
- **404** — ไม่พบ resource
- **400** — validation fail

---

## Part C — ตัวอย่าง Bug Report

**Title:** Non-admin user ลบ post ของ user อื่นได้ผ่าน DELETE /api/posts/:id

**Severity:** Critical  
**Priority:** P1  
**Module:** Posts API / Access Control  

**Steps to Reproduce:**
1. Login เป็น alice@mock.test และได้ JWT
2. ส่ง `DELETE /api/posts/1` พร้อม Authorization header
3. Post id 1 (ของ Bob) ถูกลบ

**Expected Result:** 403 Forbidden — เฉพาะ admin ลบได้  
**Actual Result:** 204 No Content — post ถูกลบ  

**Platform/Environment:** localhost:3000, Node 20  

**Analysis:** Route มีแค่ AuthN ไม่มี AuthZ check — เป็น Broken Access Control ตาม OWASP Top 10

---

## สรุป Topics ที่ควรจำก่อนสอบ

| Lecture | Topics สำคัญ |
| ------- | ------------ |
| 06 | Event Loop, microtask/macrotask, Promise combinators, Fetch API, AbortController |
| 07 | Dedicated/Shared/Service Workers, postMessage, worker limitations, SW lifecycle |
| 08 | AuthN vs AuthZ, JWT, validation vs sanitization, OWASP, .env security |
| 09 | Testing pyramid, unit/integration/E2E, black-box boundaries, bug report |
