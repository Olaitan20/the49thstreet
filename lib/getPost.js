import { cache } from "react";

const WP_BASE =
  process.env.NEXT_PUBLIC_WP_API_BASE ||
  "https://staging.the49thstreet.com/wp-json";

const REQUEST_TIMEOUT_MS = 15000;

// Same _embed parameters ArticleClient has always used, so the shape of the
// data returned here is identical to what the client-side fetch produced.
const EMBED = "_embed=author,wp:featuredmedia,wp:term&per_page=1";

/**
 * Fetch one WordPress post by slug.
 *
 * Wrapped in React's cache() so generateMetadata and the page component share
 * a single network call within one request. The fetch also sets revalidate,
 * which caches the response across requests. Both are needed: cache() dedupes
 * within a request, revalidate dedupes between them.
 *
 * Never throws. Returns null on any failure so a server render cannot be
 * taken down by Server A being slow, returning 502, or returning junk.
 *
 * @param {string} slug
 * @returns {Promise<object|null>} the post, or null
 */
export const getPost = cache(async (slug) => {
  if (!slug || typeof slug !== "string") return null;

  // Try direct slug match first, then fall back to search — the same two-step
  // the client fetch has always done.
  const urls = [
    `${WP_BASE}/wp/v2/posts?slug=${slug}&${EMBED}`,
    `${WP_BASE}/wp/v2/posts?search=${encodeURIComponent(slug)}&${EMBED}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        next: { revalidate: 60 },
      });

      if (!res.ok) continue;

      const posts = await res.json();
      if (Array.isArray(posts) && posts.length > 0 && posts[0]) {
        return posts[0];
      }
    } catch {
      // Timeout, network failure, malformed JSON. Try the next strategy.
      continue;
    }
  }

  return null;
});
