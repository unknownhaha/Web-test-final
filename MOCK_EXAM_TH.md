# CSS234 Web Programming II — Mock Exam (ภาษาไทย)

**Topics:** Concurrency & Network · Web Workers · Security & Testing · Web Testing  
**ระยะเวลา:** ~2 ชั่วโมง (แนะนำ)  
**Stack:** Express.js + in-memory arrays (ไม่ใช้ database จริง)

---

## คำแนะนำ

1. อ่านแต่ละ Part ให้ครบก่อนเริ่มเขียน code
2. **Part A** เป็นข้อสอบทฤษฎี — ตอบในไฟล์ text หรือกระดาษ
3. **Part B** เป็นข้อสอบปฏิบัติ — ทำ TODO ใน project นี้ให้ครบ
4. รัน `npm install` แล้วตามด้วย `npm test` เพื่อตรวจคำตอบ
5. **ห้ามเปิด** `ANSWER_KEY_TH.md` จนกว่าจะทำเสร็จ

---

## Part A — ทฤษฎี (40 คะแนน)

### A1. Event Loop (5 คะแนน)

โค้ดด้านล่างจะ **แสดงผลลัพธ์ตามลำดับใด**? อธิบายว่าทำไม **microtasks** ถึงทำงานก่อน **macrotasks**

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
queueMicrotask(() => console.log('4'));
console.log('5');
```

---

### A2. Promise Combinators (5 คะแนน)


| Scenario                                                             | ใช้ combinator ใด? | ถ้า promise ตัวใดตัวหนึ่ง reject จะเกิดอะไร? |
| -------------------------------------------------------------------- | ------------------ | -------------------------------------------- |
| Fetch user + posts พร้อมกัน ต้องได้ **ทั้งคู่**                      | ?                  | ?                                            |
| Search autocomplete เอา response **ตัวแรก** ที่เสร็จ                 | ?                  | ?                                            |
| Batch upload 5 files ต้องรู้ **status ของทุกไฟล์** แม้บางไฟล์จะ fail | ?                  | ?                                            |


เติมตารางให้ครบ

---

### A3. AuthN vs AuthZ (4 คะแนน)

นักศึกษาคนหนึ่งบอกว่า: *"JWT login พิสูจน์แล้วว่า user เป็น admin ดังนั้นไม่ต้อง check role บน DELETE routes"*

อธิบายว่าทำไมข้อความนี้ **ผิด** และยก **attack scenario** หนึ่งกรณี โดยอ้างอิง mock API (`/api/users` vs `/api/admin/users`)

---

### A4. Validation vs Sanitization (4 คะแนน)

สำหรับ blog comment field ที่อนุญาตเฉพาะ plain text:

- ที่ **server** ควรใช้ **validation** หรือ **sanitization** ก่อน?
- ยกตัวอย่าง **allow-list validation rule** หนึ่งข้อ
- ทำไม **client-side validation** ถึง **ไม่เพียงพอ** ต่อ security?

---

### A5. Web Workers (4 คะแนน)

จากมุมมอง **main thread** ให้ระบุ:

- สิ่งที่ Dedicated Worker **ทำได้** 2 อย่าง
- สิ่งที่ Dedicated Worker **ทำไม่ได้** 2 อย่าง

เมื่อใดควรเลือก **Service Worker** แทน **Dedicated Worker**?

---

### A6. Service Worker Lifecycle (4 คะแนน)

เรียงลำดับ phase ให้ถูกต้อง: `waiting` → `installing` → `activating` → `registered`

ใน **install phase** ฟังก์ชัน `event.waitUntil()` มีหน้าที่อะไร?

---

### A7. Testing Pyramid (4 คะแนน)

จำแนกแต่ละข้อเป็น **Unit**, **Integration**, **System/E2E** หรือ **Acceptance**:

1. `supertest` เรียก `POST /api/posts` พร้อม fake JWT
2. ทดสอบ function `validatePostInput()` แยกเดี่ยว
3. QA team รัน flow login → create post → logout บน staging
4. Customer UAT sign-off ก่อน release

---

### A8. Black-Box Boundary Values (5 คะแนน)

`createPost(title, body)` กำหนดให้ `title` ยาว **3–100** characters

ให้ระบุ **boundary test inputs** 5 ค่า ที่ black-box tester ควรลอง (รวม invalid cases)

---

### A9. OWASP Quick Match (5 คะแนน)

จับคู่ vulnerability กับ prevention ให้ถูกต้อง:


| Vulnerability                                   | Prevention                                  |
| ----------------------------------------------- | ------------------------------------------- |
| 1. SQL/NoSQL Injection                          | A. Deny by default + RBAC                   |
| 2. Broken Access Control                        | B. Parameterized queries / no string concat |
| 3. Sensitive data ใน `.env` ถูก commit ขึ้น Git | C. HTTPS + bcrypt for passwords             |
| 4. Cryptographic failures (plaintext passwords) | D. `.gitignore` + `.env.example`            |


---

## Part B — ปฏิบัติ (60 คะแนน)

เริ่ม server: `npm run dev`  
Base URL: `http://localhost:3000`

Mock data ถูกโหลดไว้แล้วใน `src/db/data.js`

---

### B1. แก้ Async Concurrency — `src/utils/fetchDashboard.js` (10 คะแนน)

ตอนนี้ dashboard loader fetch user profile และ posts แบบ **sequential** (ช้า)  
ให้ refactor เป็น **concurrent fetching** ด้วย `Promise.all`  
เพิ่ม `try/catch` และ return `{ error: message }` เมื่อ error แทนการ crash

**Test:** `npm test -- --grep "fetchDashboard"`

---

### B2. Server-Side Validation — `src/middleware/validate.js` (10 คะแนน)

implement `validatePostInput(req, res, next)`:


| Field   | Rule                                                                   |
| ------- | ---------------------------------------------------------------------- |
| `title` | Required string, trim, length 3–100                                    |
| `body`  | Required string, trim, length 1–2000                                   |
| `tags`  | Optional array; max 5 items; แต่ละ tag เป็น alphanumeric, max 20 chars |


ถ้า input ไม่ valid ให้ return **400** พร้อม `{ error: "..." }`  
ใช้แนวคิด **allow-list** — ถ้าต้องการ bonus ให้ reject unknown fields ใน POST body

**Test:** `npm test -- --grep "validatePostInput"`

---

### B3. JWT Authentication — `src/middleware/auth.js` (15 คะแนน)

ทำให้ครบ:

1. `authenticate` — verify Bearer token จาก `Authorization` header ด้วย `process.env.JWT_SECRET`
2. `authorize(...roles)` — middleware สำหรับ **AuthZ**; return **403** ถ้า role ไม่ได้รับอนุญาต
3. ห้ามรับ `alg: "none"` — reject malformed tokens ด้วย **401**

ใช้ mock users:

- `alice@mock.test` / `password123` → role `user`
- `admin@mock.test` / `admin123` → role `admin`

**Test:** `npm test -- --grep "auth middleware"`

---

### B4. แก้ Broken Access Control — `src/routes/posts.js` (10 คะแนน)

ปัจจุบัน user ที่ login แล้วสามารถ edit/delete post ของคนอื่นได้ ให้แก้ดังนี้:

- **GET** `/api/posts` — public (ไม่ต้อง auth)
- **POST** `/api/posts` — เฉพาะ authenticated users
- **PUT** `/api/posts/:id` — เฉพาะ **owner** ของ post หรือ **admin**
- **DELETE** `/api/posts/:id` — เฉพาะ **admin**

return **403** เมื่อ forbidden, **404** เมื่อไม่พบ post

**Test:** `npm test -- --grep "posts access control"`

---

### B5. Secure Login Route — `src/routes/auth.js` (5 คะแนน)

ทำ `POST /api/auth/login` ให้ครบ:

- validate email format ที่ server-side
- compare password กับ bcrypt hash (hash อยู่ใน mock DB แล้ว)
- return JWT ที่มี `{ sub, email, role }`, expires ใน 1h
- **ห้าม leak** ว่า email มีอยู่จริงหรือไม่ (ใช้ "Invalid credentials" ทั้งสองกรณี)

**Test:** `npm test -- --grep "auth login"`

---

### B6. Web Worker Stats — `public/worker.js` + `public/main.js` (10 คะแนน)

เปิด `http://localhost:3000` ใน browser

1. ใน `worker.js`: คำนวณ average word count และ longest post title จาก posts array ที่ส่งผ่าน `postMessage`
2. ใน `main.js`: spawn worker, ส่ง posts ที่ fetch มา, แสดงผลใน `#stats` โดยไม่ block UI
3. `terminate()` worker หลังได้ผลลัพธ์

**Manual check:** กด "Load Stats in Worker" — UI ต้องยัง responsive อยู่

---

## Part C — โจทย์เสริม (ไม่บังคับ)

เขียน **bug report** (จาก Lecture 09) สำหรับ defect นี้:

> หลัง login เป็น `alice@mock.test` แล้วเรียก `DELETE /api/posts/1` ทำให้ post ของ Bob ถูกลบ

ต้องมี: Title, Severity, Priority, Steps to Reproduce, Expected vs Actual, Module

---

## เกณฑ์ให้คะแนนตนเอง (self-check)


| คะแนน  | ความหมาย                                       |
| ------ | ---------------------------------------------- |
| 80–100 | พร้อมสอบ — จับ concept หลักได้ดี               |
| 60–79  | ควรทบทวน JWT, validation, event loop           |
| < 60   | อ่าน Lecture 06, 08, 09 ใหม่ แล้วทำ Part B ซ้ำ |


---

## Quick Reference — Mock Accounts


| Email                                     | Password    | Role  |
| ----------------------------------------- | ----------- | ----- |
| [alice@mock.test](mailto:alice@mock.test) | password123 | user  |
| [bob@mock.test](mailto:bob@mock.test)     | password123 | user  |
| [admin@mock.test](mailto:admin@mock.test) | admin123    | admin |


## API Endpoints (เมื่อทำครบแล้ว)

```
POST   /api/auth/login
GET    /api/posts
POST   /api/posts          (auth)
PUT    /api/posts/:id      (owner or admin)
DELETE /api/posts/:id      (admin only)
GET    /api/users/me       (auth)
GET    /api/admin/users    (admin only)
```

โชคดีในการสอบ!