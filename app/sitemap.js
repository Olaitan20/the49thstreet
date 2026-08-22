const SITE_URL = "https://the49thstreet.com";

const WP_BASE =
  process.env.NEXT_PUBLIC_WP_API_BASE ||
  "https://staging.the49thstreet.com/wp-json";

// Hard ceiling on pagination. 40 pages x 100 posts = 4,000, ample for the
// ~2,847 published posts. Guards against a malformed X-WP-TotalPages header
// causing an unbounded loop at build time.
const MAX_PAGES = 40;
const PER_PAGE = 100;
const REQUEST_TIMEOUT_MS = 15000;
const DELAY_BETWEEN_REQUESTS_MS = 100;

const CATEGORY_PATHS = [
  "/music",
  "/fashion",
  "/editorials",
  "/sports",
  "/lifestyle",
  "/news",
  "/creative-hub",
  "/orange-mag",
];

// Regenerate once a day rather than on every request.
export const revalidate = 86400;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Homepage + category pages. Used both as the always-present head of the
// sitemap and as the fallback when Server A is unreachable.
function staticEntries() {
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "hourly", priority: 1 },
    ...CATEGORY_PATHS.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    })),
  ];
}

/**
 * Fetch one page of posts. Never throws — returns null on any failure so the
 * caller can stop cleanly and keep whatever it has already collected.
 */
async function fetchPostPage(page) {
  const url =
    `${WP_BASE}/wp/v2/posts` +
    `?per_page=${PER_PAGE}&page=${page}&_fields=slug,modified&orderby=date&order=desc`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;

    const posts = await res.json();
    if (!Array.isArray(posts)) return null;

    const totalPages = Number.parseInt(
      res.headers.get("X-WP-TotalPages") || "",
      10,
    );

    return {
      posts,
      totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : null,
    };
  } catch {
    // Timeout, network failure, 502 from Server A, malformed JSON.
    return null;
  }
}

export default async function sitemap() {
  const entries = staticEntries();
  const seen = new Set();

  let page = 1;
  let totalPages = MAX_PAGES;

  while (page <= Math.min(totalPages, MAX_PAGES)) {
    if (page > 1) await sleep(DELAY_BETWEEN_REQUESTS_MS);

    const result = await fetchPostPage(page);

    // Any failure: stop and return what we have. A partial sitemap is
    // acceptable; a build failure is not.
    if (!result) break;

    if (page === 1 && result.totalPages) {
      totalPages = result.totalPages;
    }

    if (result.posts.length === 0) break;

    for (const post of result.posts) {
      if (!post || typeof post.slug !== "string" || post.slug === "") continue;
      if (seen.has(post.slug)) continue;
      seen.add(post.slug);

      const modified = post.modified ? new Date(post.modified) : null;

      entries.push({
        // No trailing slash — matches what the frontend serves.
        url: `${SITE_URL}/${post.slug}`,
        lastModified:
          modified && !Number.isNaN(modified.getTime()) ? modified : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    page += 1;
  }

  return entries;
}
