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
  try {
    const [user, posts] = await Promise.all([
      mockFetchUser(),
      mockFetchPosts()
    ]);
    return { user, posts, fetchedAt: new Date().toISOString() };
  } catch (error) {
    return { error: error.message };
  }
}

module.exports = { fetchDashboard, mockFetchUser, mockFetchPosts };
