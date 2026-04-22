# The 49th Street — Frontend Audit & Fix Handoff

**Date:** April 22, 2026
**For:** Claude Code working locally on `the49thstreet` repo
**Author:** Adnan (via chat-based debugging session with Claude)
**Urgency:** High — client (Mr. Folu) has complained, no message sent back yet because we want to land a proper fix, not a hack

---

## TL;DR — what you're fixing

The homepage of `the49thstreet.com` is silently displaying **hardcoded mock placeholder articles** instead of real content from WordPress. The client saw this, complained, and escalated. Several homepage components have a pattern like "if WordPress fetch fails or returns nothing, show these fake articles about Victony, Wizkid, and Minz" — which means when the WordPress category they're querying doesn't exist or is empty, the client sees fabricated news.

This is both a **bug** (fetches failing/returning empty) and a **design flaw** (silently showing mock data is client-deceiving behaviour — should be a graceful empty state instead).

Fix it properly in one pass. Don't just patch URLs; audit the whole pattern.

---

## Architecture you're working with

### The stack

- **Frontend:** Next.js (App Router, `app/` folder), React client components (`"use client"`), likely TailwindCSS
- **Backend:** WordPress REST API at `https://staging.the49thstreet.com/wp-json/`
- **CDN/DNS:** Cloudflare (proxied)
- **Hosting:** Hostinger VPS, PM2-managed Node process named `the49thstreet` on port 3000
- **Deploy workflow:** `cd /var/www/the49thstreet.com && git pull origin main && npm run build && pm2 restart the49thstreet`

### WordPress endpoints that are known working

- `GET /wp-json/wp/v2/posts` — returns real posts, 2,847 total, most recent from 2026-04-21 (e.g. "Tiwa Savage Music Foundation x Berklee College", "Standing Firm: Limoblaze on Faith, Sound, and Building Afro-...", "What Sound Defines Our Generation, If We Keep Sampling the P...")
- `GET /wp-json/wp/v2/magazine` — custom post type, returns 1 published item: "Ayo Maff: Prince of the Street" (2026-04-08). This one works end-to-end; the Orange Mag section on the homepage displays it correctly.
- `GET /wp-json/the49th/v1/contributors` — custom REST route registered in `hello-elementor/functions.php` on the WordPress origin. Works correctly.
- `GET /wp-json/wp/v2/posts?_embed=author,wp:featuredmedia,wp:term&per_page=5` — works after backend memory fix (see below), returns ~37KB of real post data with embedded author/media/terms.

### WordPress endpoints that are NOT working (this is your clue about the bug)

- `GET /wp-json/wp/v2/categories?slug=music` → returns `[]` (empty array)
- `GET /wp-json/wp/v2/categories?per_page=100` → also returned empty in one test, which is suspicious (WordPress always has at least "Uncategorized"). Either categories genuinely don't exist on this site, or something is filtering the REST response. **Investigate and flag this back to me if you find something weird.** Possibility: categories may be registered under a custom taxonomy instead of the default `category` taxonomy (site uses JetEngine which creates custom taxonomies).

### Known-good URL
The bare posts endpoint `https://staging.the49thstreet.com/wp-json/wp/v2/posts?per_page=5&orderby=date&order=desc` returns real content. Prefer this pattern over category-filtered fetches unless you can confirm the category actually exists and has posts.

---

## What's already been fixed (do NOT undo)

1. **wp-config.php memory limit bug (backend).** On the WordPress origin server, memory limit defines were placed *after* `require_once ABSPATH . 'wp-settings.php'` — making them no-ops. They were moved above that line and raised to 512M. This fixed intermittent 502s on `_embed` queries. Don't touch backend config.

2. **WP Maintenance Mode plugin (backend).** Was on, is now off. Leave it.

3. **Cloudflare Transform Rule named "CORS headers for staging API"** injects `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials` on responses from `staging.the49thstreet.com`. Do not remove and do not depend on frontend-side CORS workarounds.

4. **`public/images/placeholder.jpg`** — was created locally on the server last night to fix a frontend 404 on missing images. It's currently an untracked file in git. Commit it as part of your PR (it's small, it's needed, and it should live in the repo).

---

## The bug patterns to find and fix

### Pattern 1: Silent mock-data fallback

Components like `components/home/Latest.jsx` and `components/home/Editoral.jsx` have structure like this (paraphrased):

```jsx
const [articles, setArticles] = useState([]);

// fetch from WordPress category → if category empty or fetch fails, articles stays []
// then:

const staticArticles = [
  { id: 1, title: "Victony Scores New Certification With Efforts On Victony's 'Stubborn'", ... },
  { id: 2, title: "Wizkid Makes Surprise Nativeland Appearance", ... },
  { id: 3, title: "Minz Stuns For Orange", ... },
];

const displayArticles = articles.length > 0 ? articles : staticArticles;
```

**Find every instance of this pattern across the codebase.** Grep for:
- `Victony Scores`
- `Wizkid Makes Surprise`
- `Minz Stuns`
- `staticArticles`
- `staticHeadlines`
- `FAVE REACHES NUMBER 1`
- `BURNA BOY PULLS 20K`
- `REMA SET TO RELEASE DEBUT ALBUM`
- `DAVIDO ANNOUNCES WORLD TOUR`
- `AYRA STARR WINS BEST FEMALE ARTIST`
- `fallback`
- `mock`

The "What's Hot?" ticker component (headlines marquee at the top of the homepage) has its own mock fallback with the FAVE/BURNA BOY/REMA/DAVIDO/AYRA STARR items. Find it too.

### Pattern 2: URL typo causing 404

DevTools confirmed at least one request hitting `https://staging.the49thstreet.com/wp/v2/posts?...` (note: missing `-json` in the path). This is a typo in a fallback branch. Find every `/wp/v2/` in the codebase and fix to `/wp-json/wp/v2/`. This 404 is what currently causes one of the console errors on the live site (specifically: "Unexpected token '<', '<!doctype'... is not valid JSON" — because the 404 returned HTML and something tried `.json()` on it).

### Pattern 3: Fetching by category slug that doesn't exist

`Latest.jsx` currently does:
```
fetch("/wp-json/wp/v2/categories?slug=music")
→ if empty array, setArticles([]) → mock data shows
```

The `music` category returns empty. Either:
- (a) the slug is wrong (maybe it's `music-news` or similar — verify by listing what categories actually exist)
- (b) no posts are tagged with this category
- (c) "music" is a tag/custom taxonomy, not a category

Figure out what categories/taxonomies actually exist and either fix the frontend to use the correct ones, or fall back to a generic `posts?per_page=N&orderby=date` query when the category lookup returns empty. Do NOT fall back to mock data.

---

## What I want you to do

Work through this checklist in order. At the end, produce a single PR with a clear commit message.

### Step 1 — Audit

1. Run `grep -rn "Victony Scores" --include="*.jsx" --include="*.tsx" --include="*.js" --include="*.ts" .` and list every file that contains mock article data.
2. Run `grep -rn "FAVE REACHES" --include="*.jsx" --include="*.tsx" .` to find the headlines mock.
3. Run `grep -rn "/wp/v2/" --include="*.jsx" --include="*.tsx" --include="*.js" --include="*.ts" .` to find URL typos.
4. Run `grep -rn "fetch(" components/ app/ --include="*.jsx" --include="*.tsx"` to list every fetch in the UI layer.
5. For each fetch found, extract the exact URL template and document it in a markdown table with columns: `File | Line | URL Pattern | Fallback Behaviour | Status`.

### Step 2 — Verify WordPress endpoints

For each URL pattern in the audit, hit the endpoint with curl and document what comes back. Example:

```bash
curl -s -o /dev/null -w "HTTP %{http_code} | size=%{size_download}b | time=%{time_total}s\n" "URL"
curl -s "URL" | python3 -m json.tool | head -50
```

Document results as a table: `Endpoint | Status | Returns data? | Notes`.

Also test these taxonomy discovery endpoints and tell me what you find:
```bash
# List ALL taxonomies the site exposes
curl -s "https://staging.the49thstreet.com/wp-json/wp/v2/taxonomies" | python3 -m json.tool

# Sample post to see what categories/tags it actually uses
curl -s "https://staging.the49thstreet.com/wp-json/wp/v2/posts?per_page=1&_embed=wp:term" | python3 -m json.tool | head -100
```

### Step 3 — Decide the fix strategy

I want you to **recommend** one of these approaches in your PR description, not pick silently. The options:

**A. Change frontend category slugs to match what WordPress actually has.**
Pros: minimal code change. Cons: only works if the slugs are just wrong; doesn't help if categories don't exist at all.

**B. Leave category-specific fetches in place BUT fall back to generic recent-posts query when the category returns empty (instead of falling back to mock data).**
Pros: works today regardless of WordPress content structure. Cons: all homepage sections would show the same recent posts until categories are properly populated.

**C. Rewrite to a graceful empty state (skeleton or "No articles yet" message) when no data returns. No mock data ever.**
Pros: most correct long-term; never shows fake content. Cons: homepage sections look empty if WordPress isn't populated.

**My prior:** I lean toward **B + C combined** — try the category-specific fetch, fall back to generic recent posts if empty, and ONLY show an empty state if even the generic query returns nothing. And rip out all mock data hardcoded arrays.

Whichever you choose, **delete the hardcoded mock data arrays entirely.** They're a landmine. If the client ever saw them again it's a bigger problem.

### Step 4 — Implement

1. Fix every file identified in the audit.
2. Delete every hardcoded `staticArticles`, `staticHeadlines`, mock-data object array. Purge them.
3. Fix all `/wp/v2/` → `/wp-json/wp/v2/` typos.
4. Add proper empty-state UI where needed. Keep it on-brand (this site has a strong editorial design language, dark backgrounds, bold typography — don't add anything that looks placeholder-y or unfinished).
5. Add a small `lib/wp.js` or `lib/api.js` helper with a single `wpFetch(path)` function used by every component. Base URL should be an env var (`NEXT_PUBLIC_WP_API_BASE` or similar) — DON'T hardcode `https://staging.the49thstreet.com` in every component. This will pay off when the site moves off staging.
6. Commit `public/images/placeholder.jpg` (currently untracked in git).

### Step 5 — Verify locally before declaring done

1. Run `npm run dev` locally.
2. Open `http://localhost:3000` in the browser.
3. Open DevTools Network tab, filter `wp-json`.
4. Confirm: all fetches return 200 (no 404s, no 502s if backend is healthy).
5. Confirm: no Victony / Wizkid / Minz / Made Kuti / Tems / Ayra Starr placeholder content is visible anywhere on the homepage.
6. Confirm: real recent posts from WordPress appear (titles matching what `/wp-json/wp/v2/posts?per_page=5` returns).
7. Confirm: Orange Mag section still shows Ayo Maff magazine (this was already working — don't break it).
8. Confirm: no console errors except harmless ones (ad blockers, etc.).

### Step 6 — Handoff back

Produce a PR with:
- Clear commit message describing the fix
- PR description that lists every file changed and why
- Any endpoints I need to check on the WordPress side (if you discovered that categories don't exist, flag it — I'll create them in wp-admin)
- Any env vars that need to be set on the server

---

## Files confirmed to contain the bug

From our chat session's grep:

```
components/home/Latest.jsx       (has "Victony Scores" mock)
components/home/Editoral.jsx     (has "Victony Scores" mock — note: filename is misspelled as "Editoral", should probably be "Editorial" but DO NOT rename in this PR; that's a separate refactor)
app/trivia/page.jsx              (line 17, has "Victony Scores" mock — may be intentional for trivia page, inspect before removing)
app/music/page.jsx               (line 206, has "Victony Scores" mock — same caveat)
```

Also likely but unconfirmed (inspect):
- `components/home/Hero.jsx`
- `components/home/ContentGrid.jsx`
- `components/home/Sports.jsx`
- Whatever component renders the "What's Hot?" ticker (search for "What's Hot" or the headline strings)

---

## Component structure reference

```
app/
├── (article)/
├── about-us/
├── creative-hub/
├── editorials/
├── fashion/
├── globals.css
├── layout.js
├── lifestyle/
├── music/
├── news/
├── orange-mag/
├── page.js                  ← homepage
├── shop/
├── sports/
└── trivia/

components/
├── PageLoader.jsx
├── Store.jsx
├── TriviaDialog.jsx
├── home/
│   ├── ContentGrid.jsx
│   ├── Editoral.jsx          ← has bug
│   ├── Hero.jsx
│   ├── Latest.jsx            ← has bug
│   ├── Magazine.jsx          ← working, don't touch
│   └── Sports.jsx
├── layout/
└── ui/
```

---

## Deploy procedure (for when you're done)

You'll push to GitHub. I'll pull on the server:

```bash
cd /var/www/the49thstreet.com
git pull origin main
npm run build
pm2 restart the49thstreet
pm2 save
```

Then I'll purge Cloudflare cache (Caching → Configuration → Purge Everything) and hard-refresh in incognito.

Don't try to deploy yourself — only the server root has PM2 access.

---

## Design system notes (so your empty states don't look off-brand)

- **Dark backgrounds** (black / very dark grey) are the primary aesthetic
- **Orange accent** (`#F26509`) is the brand colour, used sparingly for CTAs and highlights
- **Bold uppercase typography** for headers
- **Editorial layout** — clean grids, generous whitespace, magazine-like
- **Lucide icons** (if you need icons for empty states)

If you build an empty state component, make it look intentional, not like a missing-data error. Something like:

```
/// LATEST STORIES

No new stories yet. Check back soon.

[horizontal rule in orange]
```

Understated. Not emoji-heavy. Not cartoonish. It should feel like a design choice.

---

## Non-goals for this PR

- Don't rewrite the whole app architecture.
- Don't migrate from App Router to Pages Router or vice versa.
- Don't swap state management libraries.
- Don't touch `components/home/Magazine.jsx` (it works).
- Don't rename `Editoral.jsx` to `Editorial.jsx` even though it's misspelled — do that in a separate PR to keep this one reviewable.
- Don't touch the WordPress backend or Cloudflare config.

Keep the diff focused on killing mock data, fixing URL typos, and adding graceful empty states.

---

## Questions you might have, pre-answered

**Q: Why not just create the missing categories in WordPress?**
A: I might do that separately. But that's a band-aid — the real bug is "silent mock fallback deceives the client." Even if I create the categories, next time a category is empty (e.g. new content type launched before posts are assigned), client sees fake news again. Fix the root pattern.

**Q: What if `/wp-json/wp/v2/categories` really is empty?**
A: Then all posts on the site are uncategorised, or categories are registered under a custom taxonomy (JetEngine can do this). Your audit in Step 2 will surface this. If that's the case, flag it in your PR description so I can fix the WordPress side separately.

**Q: Can I use React Query / SWR?**
A: Prefer not in this PR unless the existing code already uses it. Keep changes minimal. Raw `fetch` + `useEffect` is fine.

**Q: Should I add error boundaries?**
A: Nice-to-have, not required. Focus on the mock-data removal.

**Q: What about testing?**
A: If the repo has a test setup, add tests for the empty-state rendering. If not, don't introduce a testing framework in this PR — just verify manually per Step 5.

---

## Emergency contact info

If you find something truly broken or ambiguous that this doc doesn't cover, stop and ask the user (Adnan) for clarification rather than guessing. The site is live in production; the client is watching.

---

Good luck. You've got this.
