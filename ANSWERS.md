# เฉลยข้อสอบทฤษฎี (Part A & Part C)
อ้างอิงจากแนวคำตอบในเฉลย

## Part A — ทฤษฎี (40 คะแนน)

### A1. Event Loop (5 คะแนน)
**ลำดับผลลัพธ์:** `1`, `5`, `3`, `4`, `2`
**เหตุผล:**
- `1` และ `5` เป็น synchronous code (macrotask) จะทำงานก่อน
- `3` และ `4` เป็น microtasks (จาก `Promise` และ `queueMicrotask`) จะถูกประมวลผลทันทีหลังจากจบ synchronous code
- `2` เป็น macrotask ถัดไป (จาก `setTimeout`) จะทำงานหลังจากที่ microtasks ทั้งหมดในรอบนั้นเสร็จสิ้น

### A2. Promise Combinators (5 คะแนน)
| Scenario | ใช้ combinator ใด? | ถ้า promise ตัวใดตัวหนึ่ง reject จะเกิดอะไร? |
| --- | --- | --- |
| Fetch user + posts พร้อมกัน ต้องได้ **ทั้งคู่** | `Promise.all` | ทั้งก้อนจะ reject ทันที |
| Search autocomplete เอา response **ตัวแรก** ที่เสร็จ | `Promise.race` | จะ reject ถ้า promise ตัวที่เสร็จก่อนเกิด reject |
| Batch upload 5 files ต้องรู้ **status ของทุกไฟล์** | `Promise.allSettled` | ไม่มีการ reject ทั้งก้อน (คืนค่าสถานะแยกรายตัว) |

### A3. AuthN vs AuthZ (4 คะแนน)
**เหตุผลที่ผิด:** การเช็ค JWT login พิสูจน์แค่ **Authentication (AuthN)** ว่าระบบรู้ว่า user นี้คือใคร (เช่น มีตัวตนอยู่จริง) แต่ไม่ได้ตรวจสอบ **Authorization (AuthZ)** ว่ามีสิทธิ์ทำ action นั้นหรือไม่
**Attack scenario:** หากไม่มีการเช็คสิทธิ์ (AuthZ) ใน route `DELETE /api/posts/1` User ธรรมดา (เช่น Alice) ก็สามารถสร้าง request พร้อมแนบ JWT เพื่อเข้าไปลบ Post ของคนอื่น (เช่น Bob) ได้

### A4. Validation vs Sanitization (4 คะแนน)
- **ที่ Server ควรทำอะไรก่อน:** Validation (ตรวจสอบว่าข้อมูลถูกรูปแบบไหมก่อนจะไปต่อ)
- **ตัวอย่าง Allow-list validation rule:** ให้ข้อมูลเข้ามาเฉพาะตัวอักษร, ตัวเลข และเครื่องหมายวรรคตอนที่กำหนดเท่านั้น (เช่น regex `/^[a-zA-Z0-9\s.,!?-]{3,100}$/`)
- **ทำไม Client-side validation ถึงไม่พอ:** เพราะ Attacker สามารถยิง API ตรงๆ เข้ามาที่ Server ได้โดยข้าม Client-side validation ไปเลยผ่านเครื่องมืออย่าง Postman หรือ curl

### A5. Web Workers (4 คะแนน)
- **สิ่งที่ทำได้ 2 อย่าง:** Fetch data (XMLHttpRequest/Fetch API), การใช้งาน setTimeout/setInterval
- **สิ่งที่ทำไม่ได้ 2 อย่าง:** การเข้าถึง DOM โดยตรง, การอ่านค่าจาก window หรือดักจับ event จาก UI (เช่น click)
- **เมื่อใดควรใช้ Service Worker:** เมื่อต้องการทำ Caching, Offline Support, หรือ Push Notifications

### A6. Service Worker Lifecycle (4 คะแนน)
**ลำดับ:** `registered` → `installing` → `waiting` → `activating`
**หน้าที่ของ event.waitUntil() ใน install phase:** ป้องกันไม่ให้ browser เลิกทำงาน Service Worker ไปก่อนที่งานสำคัญ (เช่น precaching ไฟล์ทั้งหมด) จะสำเร็จ

### A7. Testing Pyramid (4 คะแนน)
1. `supertest` เรียก `POST /api/posts` พร้อม fake JWT => **Integration Test**
2. ทดสอบ function `validatePostInput()` แยกเดี่ยว => **Unit Test**
3. QA team รัน flow login → create post → logout บน staging => **System/E2E Test**
4. Customer UAT sign-off ก่อน release => **Acceptance Test**

### A8. Black-Box Boundary Values (5 คะแนน)
1. `""` (Empty string) - ทดสอบค่าว่าง
2. `"ab"` (ยาว 2 ตัวอักษร) - ค่าขอบล่างที่ผิด (invalid)
3. `"abc"` (ยาว 3 ตัวอักษร) - ค่าขอบล่างที่ถูก (valid)
4. String ความยาว 100 ตัวอักษร - ค่าขอบบนที่ถูก (valid)
5. String ความยาว 101 ตัวอักษร - ค่าขอบบนที่ผิด (invalid)

### A9. OWASP Quick Match (5 คะแนน)
1. SQL/NoSQL Injection => **B. Parameterized queries / no string concat**
2. Broken Access Control => **A. Deny by default + RBAC**
3. Sensitive data ใน .env ถูก commit ขึ้น Git => **D. .gitignore + .env.example**
4. Cryptographic failures (plaintext passwords) => **C. HTTPS + bcrypt for passwords**

---

## Part C — โจทย์เสริม (ไม่บังคับ)

**Bug Report**
**Title:** Broken Access Control — Non-admin/Non-owner สามารถลบโพสต์ของคนอื่นได้ผ่าน `DELETE /api/posts/:id`
**Severity:** Critical
**Priority:** P1
**Module:** Posts API / Access Control
**Steps to Reproduce:**
1. Login ด้วยอีเมล `alice@mock.test`
2. นำ JWT ที่ได้ไปใช้เป็น Bearer Token สำหรับ Authorization
3. ส่ง HTTP `DELETE` Request ไปที่ `/api/posts/1` (โพสต์ของ Bob)
**Expected Result:** ระบบควรตอบกลับด้วย `403 Forbidden` เพราะผู้ร้องขอไม่ใช่เจ้าของโพสต์หรือ Admin
**Actual Result:** ระบบตอบกลับด้วย `204 No Content` และโพสต์ถูกลบออกจากฐานข้อมูลสำเร็จ
