"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useCallback } from "react";

const navItems = [
  { id: "feed", label: "Feed", icon: "/icons/feed.svg", href: "/" },
  { id: "orange-mag", label: "Orange Mag", icon: "/icons/orange-mag.svg", href: "/orange-mag" },
  { id: "editorials", label: "Editorials", icon: "/icons/editorials.svg", href: "/editorials" },
  { id: "music", label: "Music", icon: "/icons/music.svg", href: "/music" },
  { id: "fashion", label: "Fashion", icon: "/icons/fashion.svg", href: "/fashion" },
  { id: "sports", label: "Sports", icon: "/icons/sport.svg", href: "/sports" },
  { id: "news", label: "News", icon: "/icons/news.svg", href: "/news" },
  { id: "lifestyle", label: "Lifestyle", icon: "/icons/lifestyle.svg", href: "/lifestyle" },
  { id: "trivia", label: "Trivia", icon: "/icons/trivia.svg", href: "/trivia" },
  { id: "creative-hub", label: "Creative Hub", icon: "/icons/creative.svg", href: "/creative-hub" },
  { id: "shop", label: "Shop", icon: "/icons/shop.svg", href: "/shop" },
];

// ---------------- SEARCH ----------------
function SearchBar({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(async (searchTerm) => {
    setQuery(searchTerm);

    if (searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://staging.the49thstreet.com/wp-json/wp/v2/posts?search=${encodeURIComponent(
          searchTerm
        )}&_embed&per_page=5`
      );

      if (res.ok) {
        const posts = await res.json();
        setResults(
          posts.map((post) => ({
            id: post.id,
            title: post.title.rendered.replace(/<[^>]*>/g, ""),
            slug: post.slug,
            image:
              post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
              "/images/placeholder.jpg",
          }))
        );
      }
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20">
      <div className="w-full max-w-2xl mx-4">
        <div className="relative">
          <input
            autoFocus
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-[#F26509]"
          />
          <button
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-xl"
          >
            ✕
          </button>
        </div>

        {(loading || results.length > 0) && (
          <div className="mt-4 bg-black/90 rounded-lg border border-white/10 overflow-hidden">
            {loading ? (
              <div className="p-4 text-white/50 text-center">Searching...</div>
            ) : (
              results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    router.push(`/article/${r.slug}`);
                    onClose();
                  }}
                  className="w-full p-4 flex gap-3 hover:bg-white/10 text-left"
                >
                  <img src={r.image} className="w-12 h-12 rounded object-cover" />
                  <p className="text-white text-[13px] line-clamp-2">
                    {r.title}
                  </p>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- HEADER ----------------
export default function Header() {
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <nav className="sticky top-12 z-40 w-full bg-black/60 backdrop-blur-md border-b border-white/5 pr-4 md:px-16 py-2">
        <div className="flex items-center gap-3">
          
          {/* FIXED SEARCH BUTTON */}
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 flex-shrink-0 px-2 md:px-4 py-1"
          >
            <svg
              className="w-[22px] h-[22px] opacity-70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* SCROLLABLE NAV ITEMS */}
          <ul
            className="
              flex items-center gap-x-6 md:gap-x-14
              overflow-x-auto scrollbar-hide scroll-smooth
              whitespace-nowrap
            "
          >
            {navItems.map((item) => {
              const isActive =
                (item.id === "feed" && pathname === "/") ||
                pathname === item.href;

              return (
                <li key={item.id} className="flex-shrink-0">
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 hover:opacity-90"
                  >
                    <Image
                      src={item.icon}
                      alt={item.label}
                      width={22}
                      height={22}
                      className={isActive ? "opacity-100" : "opacity-60"}
                    />
                    <span
                      className={`text-[12px] ${
                        isActive
                          ? "text-white font-semibold"
                          : "text-white/70"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {showSearch && <SearchBar onClose={() => setShowSearch(false)} />}
    </>
  );
}
