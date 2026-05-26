/**
 * TODO (B1): Refactor to concurrent fetching with Promise.all + try/catch
 *
 * Simulates slow API calls (like fetch to Express endpoints).
 * Currently SEQUENTIAL — fix it for the exam.
 */

function delay(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function mockFetchUser() {
  return delay(100, { id: 1, name: 'Alice Chen', email: 'alice@mock.test' });
}

async function mockFetchPosts() {
  return delay(100, [
    { id: 1, title: 'Event Loop', body: 'Microtasks before macrotasks.' },
    { id: 2, title: 'Workers', body: 'Background threads for heavy work.' }
  ]);
}

async function fetchDashboard() {
  // TODO: Replace sequential awaits with Promise.all
  const user = await mockFetchUser();
  const posts = await mockFetchPosts();

  return { user, posts, fetchedAt: new Date().toISOString() };
}

module.exports = { fetchDashboard, mockFetchUser, mockFetchPosts };
