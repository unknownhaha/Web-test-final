/**
 * TODO (B6): Dedicated Worker — compute stats from posts array
 *
 * Expected output message shape:
 * { avgWordCount: number, longestTitle: string, postCount: number }
 */

onmessage = (e) => {
  const posts = e.data;

  // TODO:
  // 1. Calculate average word count across all post bodies
  // 2. Find longest title string
  // 3. postMessage result back to main thread

  postMessage({ error: 'Not implemented — complete worker.js' });
};
