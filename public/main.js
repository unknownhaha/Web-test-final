/**
 * TODO (B6): Spawn worker, fetch posts, postMessage, display in #stats
 */

const statsEl = document.getElementById('stats');
const loadBtn = document.getElementById('loadStats');
const blockBtn = document.getElementById('blockMain');

loadBtn.addEventListener('click', async () => {
  statsEl.textContent = 'Loading...';

  try {
    // 1. fetch('/api/posts')
    const response = await fetch('/api/posts');
    const posts = await response.json();

    // 2. new Worker('worker.js')
    const worker = new Worker('worker.js');

    // 3. worker.postMessage(posts)
    worker.postMessage(posts);

    // 4. worker.onmessage → display stats in #stats
    worker.onmessage = (e) => {
      const { avgWordCount, longestTitle, postCount } = e.data;
      
      statsEl.innerHTML = `
        <p><strong>Total Posts:</strong> ${postCount}</p>
        <p><strong>Average Words per Post:</strong> ${avgWordCount.toFixed(2)}</p>
        <p><strong>Longest Title:</strong> ${longestTitle}</p>
      `;

      // 5. worker.terminate() after result
      worker.terminate();
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      statsEl.textContent = 'Error calculating stats.';
      worker.terminate();
    };
  } catch (error) {
    console.error('Fetch error:', error);
    statsEl.textContent = 'Failed to load posts.';
  }
});

// Demo: blocking main thread (why workers matter)
blockBtn.addEventListener('click', () => {
  const start = Date.now();
  while (Date.now() - start < 2000) { /* block 2 seconds */ }
  statsEl.textContent = 'Main thread was frozen for 2s. UI jank! Use a Worker instead.';
});
