// ============================================================
// B1 — Async Concurrency (Promise.all)
// Topic: Lecture 06 — fetch user + posts at the same time
// ============================================================

// Helper: wait `ms` milliseconds, then resolve with `value`
// Simulates a slow network/API call
function delay(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Mock API: pretend to fetch user profile (takes ~100ms)
async function mockFetchUser() {
  return delay(100, { id: 1, name: 'Alice Chen', email: 'alice@mock.test' });
}

// Mock API: pretend to fetch posts list (takes ~100ms)
async function mockFetchPosts() {
  return delay(100, [
    { id: 1, title: 'Event Loop', body: 'Microtasks before macrotasks.' },
    { id: 2, title: 'Workers', body: 'Background threads for heavy work.' }
  ]);
}

// Main function: load dashboard data
async function fetchDashboard() {
  try {
    // Promise.all runs BOTH requests at the same time (concurrent)
    // Sequential would take ~200ms (100+100), concurrent takes ~100ms
    const [user, posts] = await Promise.all([
      mockFetchUser(),
      mockFetchPosts()
    ]);

    // Return combined result with a timestamp
    return { user, posts, fetchedAt: new Date().toISOString() };
  } catch (error) {
    // If either promise rejects, return error object instead of crashing
    return { error: error.message };
  }
}

module.exports = { fetchDashboard, mockFetchUser, mockFetchPosts };
