require('dotenv').config();
const bcrypt = require('bcryptjs');

const users = [
  {
    id: 1,
    email: 'alice@mock.test',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'user',
    name: 'Alice Chen'
  },
  {
    id: 2,
    email: 'bob@mock.test',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'user',
    name: 'Bob Smith'
  },
  {
    id: 3,
    email: 'admin@mock.test',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    name: 'Admin User'
  }
];

const posts = [
  {
    id: 1,
    userId: 2,
    title: 'Introduction to Event Loop',
    body: 'Microtasks run before the next macrotask. Remember: A, D, C, B for the classic example.',
    tags: ['javascript', 'concurrency'],
    createdAt: '2026-05-20T10:00:00.000Z'
  },
  {
    id: 2,
    userId: 1,
    title: 'Web Workers Save the UI',
    body: 'Offload heavy CSV parsing to a dedicated worker so the main thread stays responsive.',
    tags: ['workers', 'performance'],
    createdAt: '2026-05-21T14:30:00.000Z'
  },
  {
    id: 3,
    userId: 1,
    title: 'JWT AuthN is Not AuthZ',
    body: 'Logging in proves identity. Role checks on each route prove permission.',
    tags: ['security', 'jwt'],
    createdAt: '2026-05-22T09:15:00.000Z'
  }
];

let nextPostId = 4;

function findUserByEmail(email) {
  return users.find((u) => u.email === email);
}

function findUserById(id) {
  return users.find((u) => u.id === id);
}

function findPostById(id) {
  return posts.find((p) => p.id === Number(id));
}

module.exports = {
  users,
  posts,
  nextPostId,
  setNextPostId: (id) => { nextPostId = id; },
  getNextPostId: () => nextPostId,
  incrementPostId: () => nextPostId++,
  findUserByEmail,
  findUserById,
  findPostById
};
