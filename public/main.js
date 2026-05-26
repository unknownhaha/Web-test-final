/**
 * TODO (B6): Spawn worker, fetch posts, postMessage, display in #stats
 */

const statsEl = document.getElementById('stats');
const loadBtn = document.getElementById('loadStats');
const blockBtn = document.getElementById('blockMain');

loadBtn.addEventListener('click', async () => {
  statsEl.textContent = 'Loading...';

  // TODO:
  // 1. fetch('/api/posts')
  // 2. new Worker('worker.js')
  // 3. worker.postMessage(posts)
  // 4. worker.onmessage → display stats in #stats
  // 5. worker.terminate() after result

  statsEl.textContent = 'Not implemented — complete main.js (B6)';
});

// Demo: blocking main thread (why workers matter)
blockBtn.addEventListener('click', () => {
  const start = Date.now();
  while (Date.now() - start < 2000) { /* block 2 seconds */ }
  statsEl.textContent = 'Main thread was frozen for 2s. UI jank! Use a Worker instead.';
});
