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
    <div className="w-full h-48 md:h-64 overflow-hidden bg-gray-600 animate-pulse">
      <div className="w-full h-full bg-gray-600"></div>
    </div>

    <div className="p-4 md:p-6">
      <div className="space-y-2">
        <div className="h-5 bg-gray-500 animate-pulse"></div>
        <div className="h-4 bg-gray-500 animate-pulse w-3/4"></div>
        <div className="h-4 bg-gray-500 animate-pulse w-1/2"></div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <div className="h-3 bg-gray-500 animate-pulse w-16"></div>
        <div className="h-3 bg-gray-500 animate-pulse w-12"></div>
        <div className="h-3 bg-gray-500 animate-pulse w-20"></div>
      </div>
    </div>
  </motion.div>
);

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRes = await fetch(
          "https://staging.the49thstreet.com/wp-json/wp/v2/categories"
        );

        if (!categoriesRes.ok)
          throw new Error(`Categories API error: ${categoriesRes.status}`);

        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch articles with pagination
  const fetchArticles = async (pageNumber) => {
    try {
      setLoading(true);
      setError(null);

      const postsRes = await fetch(
        `https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed&per_page=9&page=${pageNumber}`
      );

      if (!postsRes.ok) {
        if (postsRes.status === 400) {
          setHasMore(false);
          return [];
        }
        throw new Error(`Posts API error: ${postsRes.status}`);
      }

      // Check if there are more pages by looking at headers
      const totalPages = postsRes.headers.get('X-WP-TotalPages');
      if (totalPages && pageNumber >= parseInt(totalPages)) {
        setHasMore(false);
      }

      const postsData = await postsRes.json();
      return postsData;
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setError(err.message || "Failed to load news");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    const initialFetch = async () => {
      setApiLoading(true);
      const initialArticles = await fetchArticles(1);
      setArticles(initialArticles);
      setApiLoading(false);
      setInitialLoadDone(true);
    };

    initialFetch();
  }, []);

  // Load more articles
  const handleLoadMore = async () => {
    if (loading || !hasMore) return;

    const nextPage = page + 1;
    const newArticles = await fetchArticles(nextPage);
    
    if (newArticles.length > 0) {
      setArticles(prev => [...prev, ...newArticles]);
      setPage(nextPage);
    }
    
    // If we got fewer articles than requested, there are no more
    if (newArticles.length < 9) {
      setHasMore(false);
    }
  };

  // Helpers
  const getCategoryName = (ids) => {
    if (!ids || !categories.length) return "NEWS";
    const match = categories.find((c) => ids.includes(c.id));
    return match ? match.name.toUpperCase() : "NEWS";
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);

    if (diff < 1) return "JUST NOW";
    if (diff < 60) return `${diff} MINS AGO`;
    if (diff < 1440) return `${Math.floor(diff / 60)} HOURS AGO`;
    return `${Math.floor(diff / 1440)} DAYS AGO`;
  };

  const getAuthorName = (post) =>
    post._embedded?.author?.[0]?.name || "49TH STREET";

  const getFeaturedImage = (post) =>
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    "/images/placeholder.jpg";

  const stripHtml = (html) =>
    html ? html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, "").trim() : "";

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
    }),
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <Headline />

      {/* Section Title */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0.1}
        className="px-2 sm:px-6 md:px-8 lg:px-16 py-4"
      >
        <p className="uppercase text-[11px] tracking-widest text-white/60 mb-2">
          /// Latest
        </p>
        <p className="text-lg font-extrabold uppercase">News</p>
      </motion.div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-0 sm:px-6 md:px-8 lg:px-16 gap-0">
        {apiLoading ? (
          Array.from({ length: 9 }).map((_, index) => (
            <ArticleSkeleton key={index} index={index} />
          ))
        ) : error && !initialLoadDone ? (
          <div className="col-span-full text-center py-12">
            <p className="text-red-400 mb-2">Failed to load news</p>
            <p className="text-white/60 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : articles.length === 0 && !apiLoading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-white/60">No articles found</p>
          </div>
        ) : (
          articles.map((article, index) => (
            <motion.div
              key={`${article.id}-${index}`}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={index * 0.15}
              className="bg-white hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => router.push(`/article/${article.slug}`)}
            >
              <div className="w-full h-48 md:h-64 overflow-hidden">
                <img
                  src={getFeaturedImage(article)}
                  alt={stripHtml(article.title?.rendered)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = "/images/placeholder.jpg";
                  }}
                />
              </div>

              <div className="p-4 md:p-6">
                <p className="text-sm md:text-[16px] font-bold truncate text-black mb-3 leading-tight">
                  {stripHtml(article.title?.rendered)}
                </p>

                <div className="flex gap-1 sm:gap-0 flex-row items-center">
                  <span className="text-[12px] text-black/50 font-medium">
                    {getAuthorName(article)}
                  </span>
                  <span className="hidden sm:inline text-xs text-gray-400 mx-2">
                    •
                  </span>
                  <span className="text-[12px] text-black/50 font-medium">
                    {getCategoryName(article.categories)}
                  </span>
                  <span className="hidden sm:inline text-xs text-gray-400 mx-2">
                    •
                  </span>
                  <span className="text-[12px] text-black/50">
                    {getTimeAgo(article.date)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {articles.length > 0 && hasMore && !apiLoading && (
        <div className="bg-black py-2 md:py-6 flex justify-center mt-2">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 text-[14px] font-semibold  transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
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

      {/* No More Articles */}
      {!hasMore && !apiLoading && articles.length > 0 && (
        <div className="bg-black py-2 md:py-6 flex justify-center mt-2">
          <p className="text-white/60 text-sm">No more articles to load</p>
        </div>
      )}

      {/* Error Loading More */}
      {error && articles.length > 0 && (
        <div className="bg-black py-2 md:py-6 flex justify-center mt-2">
          <p className="text-red-400 text-sm">Error loading more articles: {error}</p>
          <button
            onClick={handleLoadMore}
            className="ml-4 px-4 py-1 text-sm bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="px-0 sm:px-6 md:px-8 lg:px-16">
        <Footer />
      </div>
    </div>
  );
}
