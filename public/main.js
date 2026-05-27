// ============================================================
// B6 — Main Thread: spawn Worker and display stats
// Topic: Lecture 07 — main thread handles UI, worker handles computation
// ============================================================

const statsEl = document.getElementById('stats');   // DOM element to show results
const loadBtn = document.getElementById('loadStats'); // button to trigger worker
const blockBtn = document.getElementById('blockMain'); // demo: freeze main thread

// --- Load Stats using Web Worker ---
loadBtn.addEventListener('click', async () => {
  statsEl.textContent = 'Loading...'; // update UI immediately (main thread)

  try {
    // Step 1: fetch posts from Express API
    const res = await fetch('/api/posts');
    if (!res.ok) throw new Error('Failed to fetch posts');

    const posts = await res.json(); // parse JSON response

    // Step 2: create a new Dedicated Worker (runs worker.js in background thread)
    const worker = new Worker('worker.js');

    // Step 4: listen for result from worker (runs when worker calls postMessage)
    worker.onmessage = (e) => {
      const { avgWordCount, longestTitle, postCount } = e.data;

      // Display stats in the page — this is DOM work, only main thread can do this
      statsEl.textContent = `Average word count: ${avgWordCount.toFixed(2)}, Longest title: ${longestTitle}, Post count: ${postCount}`;

      // Step 5: kill worker after getting result (free memory)
      worker.terminate();
    };

    // Handle worker errors (e.g. syntax error in worker.js)
    worker.onerror = () => {
      statsEl.textContent = 'Worker error';
      worker.terminate();
    };

    // Step 3: send posts data to worker (copied, not shared)
    worker.postMessage(posts);
  } catch (error) {
    statsEl.textContent = error.message;
  }
});

// --- Demo: what happens when you block the main thread ---
blockBtn.addEventListener('click', () => {
  const start = Date.now();
  // Busy loop for 2 seconds — UI freezes because main thread is blocked
  while (Date.now() - start < 2000) { /* freeze */ }
  statsEl.textContent = 'Main thread was frozen for 2s. UI jank! Use a Worker instead.';
});
