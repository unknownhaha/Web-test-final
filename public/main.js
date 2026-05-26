const statsEl = document.getElementById('stats');
const loadBtn = document.getElementById('loadStats');
const blockBtn = document.getElementById('blockMain');

loadBtn.addEventListener('click', async () => {
  statsEl.textContent = 'Loading...';

  try {
    const res = await fetch('/api/posts');
    if (!res.ok) throw new Error('Failed to fetch posts');

    const posts = await res.json();
    const worker = new Worker('worker.js');

    worker.onmessage = (e) => {
      const { avgWordCount, longestTitle, postCount } = e.data;
      statsEl.textContent = `Average word count: ${avgWordCount.toFixed(2)}, Longest title: ${longestTitle}, Post count: ${postCount}`;
      worker.terminate();
    };

    worker.onerror = () => {
      statsEl.textContent = 'Worker error';
      worker.terminate();
    };

    worker.postMessage(posts);
  } catch (error) {
    statsEl.textContent = error.message;
  }
});

blockBtn.addEventListener('click', () => {
  const start = Date.now();
  while (Date.now() - start < 2000) { /* block 2 seconds */ }
  statsEl.textContent = 'Main thread was frozen for 2s. UI jank! Use a Worker instead.';
});
