onmessage = (e) => {
  const posts = e.data;

  if (!Array.isArray(posts) || posts.length === 0) {
    postMessage({ avgWordCount: 0, longestTitle: '', postCount: 0 });
    return;
  }

  let totalWords = 0;
  let longestTitle = posts[0].title;

  for (const post of posts) {
    const words = post.body.trim().split(/\s+/).filter(Boolean);
    totalWords += words.length;

    if (post.title.length > longestTitle.length) {
      longestTitle = post.title;
    }
  }

  postMessage({
    avgWordCount: totalWords / posts.length,
    longestTitle,
    postCount: posts.length
  });
};
