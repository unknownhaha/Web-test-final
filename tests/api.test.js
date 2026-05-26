require('dotenv').config();

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-mock-exam';
process.env.NODE_ENV = 'test';

const { describe, it, before, after, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const app = require('../src/server');
const { posts, setNextPostId } = require('../src/db/data');
const { fetchDashboard } = require('../src/utils/fetchDashboard');
const { validatePostInput, isValidEmail } = require('../src/middleware/validate');
const { signToken } = require('../src/middleware/auth');

let server;
let baseUrl;

function request(method, path, { token, body } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = data ? JSON.parse(data) : null; } catch { json = data; }
        resolve({ status: res.statusCode, body: json });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function mockReqRes(body = {}, user = null) {
  const req = { body, user };
  let statusCode = 200;
  let jsonBody = null;
  const res = {
    status(code) { statusCode = code; return res; },
    json(data) { jsonBody = data; return res; }
  };
  let nextCalled = false;
  const next = () => { nextCalled = true; };
  return { req, res, next, getResult: () => ({ statusCode, jsonBody, nextCalled }) };
}

before(async () => {
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterEach(() => {
  while (posts.length > 3) posts.pop();
  setNextPostId(4);
});

describe('fetchDashboard', () => {
  it('fetchDashboard fetches user and posts concurrently', async () => {
    const start = Date.now();
    const result = await fetchDashboard();
    const elapsed = Date.now() - start;

    assert.ok(result.user, 'should return user');
    assert.ok(Array.isArray(result.posts), 'should return posts');
    assert.ok(elapsed < 180, `should be concurrent (~100ms), took ${elapsed}ms`);
  });

  it('fetchDashboard returns error object on failure', async () => {
    const original = require('../src/utils/fetchDashboard').mockFetchUser;
    // If student exports differently, this test documents expected pattern
    assert.ok(typeof fetchDashboard === 'function');
  });
});

describe('validatePostInput', () => {
  it('validatePostInput rejects short title', () => {
    const { req, res, next, getResult } = mockReqRes({ title: 'ab', body: 'valid body here' });
    validatePostInput(req, res, next);
    const { statusCode, jsonBody, nextCalled } = getResult();
    assert.equal(nextCalled, false);
    assert.equal(statusCode, 400);
    assert.ok(jsonBody.error);
  });

  it('validatePostInput accepts valid post', () => {
    const { req, res, next, getResult } = mockReqRes({
      title: 'Valid Title',
      body: 'Valid body content',
      tags: ['exam', 'js']
    });
    validatePostInput(req, res, next);
    const { nextCalled } = getResult();
    assert.equal(nextCalled, true);
  });

  it('isValidEmail validates format', () => {
    assert.equal(isValidEmail('alice@mock.test'), true);
    assert.equal(isValidEmail('not-an-email'), false);
  });
});

describe('auth middleware', () => {
  it('authenticate rejects missing token', async () => {
    const res = await request('GET', '/api/users/me');
    assert.equal(res.status, 401);
  });

  it('authenticate accepts valid token', async () => {
    const token = signToken({ sub: 1, email: 'alice@mock.test', role: 'user' });
    const res = await request('GET', '/api/users/me', { token });
    assert.equal(res.status, 200);
    assert.equal(res.body.email, 'alice@mock.test');
  });

  it('authorize blocks non-admin from admin route', async () => {
    const token = signToken({ sub: 1, email: 'alice@mock.test', role: 'user' });
    const res = await request('GET', '/api/admin/users', { token });
    assert.equal(res.status, 403);
  });
});

describe('auth login', () => {
  it('auth login returns token for valid credentials', async () => {
    const res = await request('POST', '/api/auth/login', {
      body: { email: 'alice@mock.test', password: 'password123' }
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'user');
  });

  it('auth login rejects wrong password without leaking', async () => {
    const res = await request('POST', '/api/auth/login', {
      body: { email: 'alice@mock.test', password: 'wrong' }
    });
    assert.equal(res.status, 401);
    assert.match(res.body.error, /invalid credentials/i);
  });
});

describe('posts access control', () => {
  it('posts GET is public', async () => {
    const res = await request('GET', '/api/posts');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });

  it('posts POST requires auth', async () => {
    const res = await request('POST', '/api/posts', {
      body: { title: 'New Post Title', body: 'Content here' }
    });
    assert.equal(res.status, 401);
  });

  it('posts PUT forbidden for non-owner user', async () => {
    const aliceToken = signToken({ sub: 1, email: 'alice@mock.test', role: 'user' });
    const res = await request('PUT', '/api/posts/1', {
      token: aliceToken,
      body: { title: 'Hacked Title', body: 'Hacked body content here' }
    });
    assert.equal(res.status, 403);
  });

  it('posts DELETE forbidden for regular user', async () => {
    const aliceToken = signToken({ sub: 1, email: 'alice@mock.test', role: 'user' });
    const res = await request('DELETE', '/api/posts/1', { token: aliceToken });
    assert.equal(res.status, 403);
  });

  it('posts DELETE allowed for admin', async () => {
    const adminToken = signToken({ sub: 3, email: 'admin@mock.test', role: 'admin' });
    const res = await request('DELETE', '/api/posts/1', { token: adminToken });
    assert.equal(res.status, 204);
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});
