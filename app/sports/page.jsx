"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Headline from "@/components/layout/Headline";
import Footer from "@/components/layout/Footer";

// Skeleton Loader Component
const ArticleSkeleton = ({ index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.6 }}
    className="bg-gray-700 cursor-pointer"
  >
    <div className="w-full h-48 md:h-64 overflow-hidden bg-gray-600 animate-pulse" />
    <div className="p-4 md:p-6 space-y-2">
      <div className="h-4 bg-gray-500 animate-pulse"></div>
      <div className="h-4 bg-gray-500 animate-pulse w-3/4"></div>
      <div className="h-4 bg-gray-500 animate-pulse w-1/2"></div>
      
    </div>
  </motion.div>
);

export default function Page() {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const SPORTS_CATEGORY_ID = 647;

  // Decode HTML entities
  const decodeHtmlEntities = (text) => {
    if (typeof text !== "string") return text;
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  };

  // Calculate time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now - postDate;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInMins < 60) return `${diffInMins} MINS AGO`;
    if (diffInHours < 24) return `${diffInHours} HOURS AGO`;
    return `${diffInDays} DAYS AGO`;
  };

  
  const handleArticles = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed&categories=${SPORTS_CATEGORY_ID}&per_page=9&page=${pageNum}&orderby=date&order=desc`
      );

      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

      const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1");
      setHasMore(pageNum < totalPages);

      const data = await res.json();

      const formatted = data.map((post, index) => {
        let image =
          post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
          ["/images/burna.png", "/images/wizkid.png", "/images/minz.png"][
            index % 3
          ];

        return {
          id: post.id,
          image,
          title: decodeHtmlEntities(post.title.rendered),
          author: post._embedded?.author?.[0]?.name || "SPORTS DESK",
          category: "49TH SPORTS",
          time: getTimeAgo(post.date),
          slug: post.slug,
        };
      });

      setArticles((prev) => (pageNum === 1 ? formatted : [...prev, ...formatted]));
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError(err.message || "Failed to fetch articles");
      if (pageNum !== 1) setHasMore(false);
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    handleArticles(1);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) handleArticles(page + 1);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
    }),
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <Headline />

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0.1}
        className="mx-2 sm:mx-6 md:mx-8 lg:mx-16 py-4"
      >
        <p className="uppercase text-[11px] tracking-widest text-white/60 mb-2">
          /// Latest
        </p>
        <p className="text-lg font-extrabold uppercase">Sport News</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-0 sm:mx-6 md:mx-8 lg:mx-16 ">
        {apiLoading
          ? Array.from({ length: 9 }).map((_, i) => <ArticleSkeleton key={i} index={i} />)
          : articles.map((article, i) => (
              <motion.div
                key={`${article.id}-${i}`}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                custom={i * 0.15}
                className="bg-white hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => router.push(`/article/${article.slug}`)}
              >
                <div className="w-full h-48 md:h-64 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const fallback = ["/images/burna.png", "/images/wizkid.png", "/images/minz.png"][Math.floor(Math.random() * 3)];
                      e.target.src = fallback;
                      e.target.onerror = null;
                    }}
                  />
                </div>
                <div className="p-4 md:p-6">
                  <p className="text-sm md:text-[16px] font-bold truncate text-black mb-3 leading-tight">{article.title}</p>
                  <div className="flex sm:flex-row sm:items-center gap-1 sm:gap-0">
                    <span className="text-[12px] text-black/50 ">{article.author?.toUpperCase()}</span>
                    <span className="inline text-xs text-gray-400 sm:mx-1">•</span>
                    <span className="text-[12px] text-black/50 ">{article.category}</span>
                    <span className="inline text-xs text-gray-400 sm:mx-1">•</span>
                    <span className="text-[12px] text-black/50">{article.time}</span>
                  </div>
                </div>
              </motion.div>
            ))}
      </div>

      {articles.length > 0 && hasMore && !apiLoading && (
        <div className="bg-black py-2 md:py-6 flex justify-center mt-2">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 text-[14px] font-semibold text-white   transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}

      {!hasMore && !apiLoading && (
        <div className="bg-black py-2 md:py-6 flex justify-center mt-2">
          <p className="text-white/60 text-sm">No more articles to load</p>
        </div>
      )}

      {error && articles.length > 0 && (
        <div className="bg-black py-2 md:py-6 flex justify-center mt-2">
          <p className="text-red-400 text-sm">Error loading more articles: {error}</p>
        </div>
      )}

      <div className="mx-0 sm:mx-6 md:mx-8 lg:mx-16">
        <Footer />
      </div>
    </div>
  );
}
