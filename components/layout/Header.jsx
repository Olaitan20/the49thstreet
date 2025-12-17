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

// Search Component
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
      const response = await fetch(
        `https://staging.the49thstreet.com/wp-json/wp/v2/posts?search=${encodeURIComponent(searchTerm)}&_embed&per_page=5`
      );
      
      if (response.ok) {
        const posts = await response.json();
        const formattedResults = posts.map((post) => ({
          id: post.id,
          title: post.title.rendered.replace(/<[^>]*>/g, ""),
          slug: post.slug,
          image: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/images/placeholder.jpg",
        }));
        setResults(formattedResults);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResultClick = (slug) => {
    router.push(`/article/${slug}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 md:pt-24">
      <div className="w-full max-w-2xl mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
            className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-[#F26509] transition"
          />
          <button
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Search Results */}
        {(results.length > 0 || (query && loading)) && (
          <div className="mt-4 bg-black/90 rounded-lg border border-white/10 overflow-hidden max-h-96 overflow-y-hidden">
            {loading ? (
              <div className="p-4 text-center text-white/50">Searching...</div>
            ) : results.length > 0 ? (
              results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result.slug)}
                  className="w-full p-4 hover:bg-white/10 transition flex gap-3 items-start text-left border-b border-white/5 last:border-b-0"
                >
                  <img
                    src={result.image}
                    alt={result.title}
                    className="w-12 h-12 object-cover rounded"
                    onError={(e) => (e.target.src = "/images/placeholder.jpg")}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[13px] font-medium line-clamp-2">
                      {result.title}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-white/50 text-sm">No articles found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <nav className="sticky z-40 top-16 md:top-10 md:z-40 w-full px-3 sm:px-6 md:px-8 lg:px-24 py-2 bg-black/60 backdrop-blur-md border-b border-white/5">
        <ul
          className="
            flex items-center
            gap-x-4 sm:gap-x-5 md:gap-x-14 
            overflow-x-auto md:overflow-x-visible
            whitespace-nowrap
            scrollbar-hide
            scroll-smooth
            py-2
            text-white
            md:justify-center
            -mx-3 sm:-mx-6 md:-mx-8 lg:-mx-16 px-3 sm:px-6 md:px-8 lg:px-16
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
                  className="flex items-center gap-1 sm:gap-1.5 md:gap-2 cursor-pointer transition-all hover:opacity-90"
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={22}
                    height={22}
                    className={`transition-opacity ${
                      isActive ? "opacity-100" : "opacity-60"
                    }`}
                  />
                  <span
                    className={`text-[12px] tracking-tight ${
                      isActive ? "text-white font-semibold" : "text-white/70"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}

          {/* Search as Nav Item */}
          <li className="flex-shrink-0">
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-1 sm:gap-1.5 md:gap-2 cursor-pointer transition-all hover:opacity-90"
              title="Search"
            >
              <svg className="w-[22px] h-[22px] opacity-60 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-[12px] tracking-tight text-white/70">Search</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Search Modal */}
      {showSearch && <SearchBar onClose={() => setShowSearch(false)} />}
    </>
  );
}





