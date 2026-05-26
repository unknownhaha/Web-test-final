/**
 * TODO (B6): Dedicated Worker — compute stats from posts array
 *
 * Expected output message shape:
 * { avgWordCount: number, longestTitle: string, postCount: number }
 */

onmessage = (e) => {
  const posts = e.data;

  let totalWordCount = 0;
  let longestTitle = '';
  let postCount = posts.length;

  for (const post of posts) {
    // 1. Calculate average word count across all post bodies
    if (post.body) {
      const words = post.body.trim().split(/\s+/);
      if (words[0] !== '') {
        totalWordCount += words.length;
      }
    }

    // 2. Find longest title string
    if (post.title && post.title.length > longestTitle.length) {
      longestTitle = post.title;
    }
  }

  let avgWordCount = postCount > 0 ? totalWordCount / postCount : 0;

  // 3. postMessage result back to main thread
  postMessage({ avgWordCount, longestTitle, postCount });
};
