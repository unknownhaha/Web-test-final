// ============================================================
// SQL Injection Demo — Vulnerable vs Safe Patterns
// Topic: Lecture 08 — Injection prevention
//
// Run:  node src/examples/sqlInjection.demo.js
//
// This file simulates a tiny SQL database using functions.
// It shows WHY string concat is dangerous and HOW placeholders fix it.
// ============================================================

// --- Mock database (pretend SQL table) ---
const users = [
  { id: 1, email: 'alice@mock.test', passwordHash: 'hashed_alice', role: 'user' },
  { id: 2, email: 'admin@mock.test', passwordHash: 'hashed_admin', role: 'admin' }
];

// ============================================================
// ❌ VULNERABLE: builds SQL string with user input directly
// This simulates what happens when you concatenate strings
// ============================================================
function vulnerableQuery(email, password) {
  // Attacker-controlled values go straight into the "SQL" string
  const sql = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
  console.log('  SQL sent:', sql);

  // Simulate: if query contains "OR '1'='1" the attacker bypasses login
  if (sql.includes("'1'='1") || sql.includes("'1' = '1'")) {
    console.log('  ⚠️  INJECTION DETECTED — returning ALL users (login bypass!)');
    return users; // attacker gets everyone
  }

  // Normal lookup
  return users.filter(
    (u) => u.email === email && u.passwordHash === password
  );
}

// ============================================================
// ✅ SAFE: parameterized query — input is DATA, not SQL code
// The query structure is fixed; values are bound separately
// ============================================================
function safeQuery(email, password) {
  // Step 1: query structure is FIXED — no user input in the string
  const sql = 'SELECT * FROM users WHERE email = ? AND passwordHash = ?';
  console.log('  SQL template:', sql);
  console.log('  Bound values:  ', [email, password]);

  // Step 2: driver binds values as plain data (simulated here)
  // Even if email = "' OR '1'='1' --", it searches for that EXACT string as email
  return users.filter(
    (u) => u.email === email && u.passwordHash === password
  );
}

// ============================================================
// Run demos
// ============================================================
console.log('='.repeat(60));
console.log('DEMO 1: Normal login (both methods work the same)');
console.log('='.repeat(60));

console.log('\n❌ Vulnerable:');
console.log('  Result:', vulnerableQuery('alice@mock.test', 'hashed_alice'));

console.log('\n✅ Safe:');
console.log('  Result:', safeQuery('alice@mock.test', 'hashed_alice'));

console.log('\n' + '='.repeat(60));
console.log('DEMO 2: SQL Injection attack');
console.log('='.repeat(60));
console.log('Attacker input: email = "\' OR \'1\'=\'1\' --"');

const attackEmail = "' OR '1'='1' --";
const attackPassword = 'anything';

console.log('\n❌ Vulnerable:');
const vulnResult = vulnerableQuery(attackEmail, attackPassword);
console.log('  Users returned:', vulnResult.length, '→ LOGIN BYPASS!');

console.log('\n✅ Safe:');
const safeResult = safeQuery(attackEmail, attackPassword);
console.log('  Users returned:', safeResult.length, '→ attack failed ✅');

console.log('\n' + '='.repeat(60));
console.log('DEMO 3: Real Node.js safe pattern (mysql2 style)');
console.log('='.repeat(60));
console.log(`
  // ✅ Copy this pattern in real projects:
  const sql = 'SELECT * FROM users WHERE email = ?';
  const [rows] = await db.execute(sql, [email.trim()]);

  // ✅ PostgreSQL (pg):
  const sql = 'SELECT * FROM users WHERE email = $1';
  const result = await db.query(sql, [email.trim()]);
`);

console.log('='.repeat(60));
console.log('DEMO 4: How mock exam login avoids this (array DB + validation)');
console.log('='.repeat(60));
console.log(`
  // src/routes/auth.js — no SQL, but same security mindset:
  //
  // 1. validate email format (validate.js)
  // 2. findUserByEmail(email) — array lookup, not string concat
  // 3. bcrypt.compare(password, hash) — never compare plain text
  // 4. same error message for wrong email OR wrong password
`);

console.log('Key takeaway: NEVER put user input inside SQL strings.');
console.log('Always use ? placeholders and pass values separately.\n');
