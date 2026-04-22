const WP_BASE =
  process.env.NEXT_PUBLIC_WP_API_BASE ||
  "https://staging.the49thstreet.com/wp-json";

/**
 * Fetch from the WordPress REST API.
 * @param {string} path — e.g. "/wp/v2/posts?per_page=5"
 * @param {RequestInit} [opts] — optional fetch options
 * @returns {Promise<any>} parsed JSON
 */
export async function wpFetch(path, opts = {}) {
  const url = `${WP_BASE}${path}`;
  const res = await fetch(url, opts);
  if (!res.ok) {
    throw new Error(`WP API ${res.status}: ${url}`);
  }
  return res.json();
}
