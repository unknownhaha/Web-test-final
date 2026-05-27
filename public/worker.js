// ============================================================
// B6 — Dedicated Web Worker (background thread)
// Topic: Lecture 07 — offload heavy work so main thread stays responsive
// Worker runs in separate thread: CAN fetch/IndexedDB, CANNOT touch DOM
// Communication: postMessage (data is COPIED, not shared)
// ============================================================

// Listen for messages sent from main thread via worker.postMessage()
onmessage = (e) => {
  const posts = e.data; // received posts array (copied via Structured Clone)

  // Edge case: empty or invalid input
  if (!Array.isArray(posts) || posts.length === 0) {
    postMessage({ avgWordCount: 0, longestTitle: '', postCount: 0 });
    return;
  }

  let totalWords = 0;
  let longestTitle = posts[0].title; // start with first title as baseline

  // Loop through each post to calculate stats
  for (const post of posts) {
    // Split body by whitespace, filter empty strings → word count
    const words = post.body.trim().split(/\s+/).filter(Boolean);
    totalWords += words.length;

    // Track the longest title string by character length
    if (post.title.length > longestTitle.length) {
      longestTitle = post.title;
    }
  }

  // Send result back to main thread
  postMessage({
    avgWordCount: totalWords / posts.length, // average words per post
    longestTitle,                             // longest title found
    postCount: posts.length                   // total number of posts
  });
  // Note: terminate() is called from main thread, NOT here
};
