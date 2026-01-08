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
  const [editorialCategoryId, setEditorialCategoryId] = useState(null);

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

  // Helper to get featured image
  const getFeaturedImage = (post) => {
    return post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/images/placeholder.jpg";
  };

  // Helper to get author name
  const getAuthorName = (post) => {
    return post._embedded?.author?.[0]?.name || "EDITORIAL TEAM";
  };

  // Fetch editorial category ID by slug
  const fetchEditorialCategoryId = async () => {
    try {
      const res = await fetch(
        `https://staging.the49thstreet.com/wp-json/wp/v2/categories?slug=editorial`
      );
      
      if (!res.ok) throw new Error(`Failed to fetch category: ${res.status}`);
      
      const categories = await res.json();
      
      if (categories.length > 0) {
        return categories[0].id;
      } else {
        throw new Error("Category 'editorial' not found");
      }
    } catch (err) {
      console.error("Error fetching editorial category:", err);
      throw err;
    }
  };

  // Fetch articles function
  const fetchArticles = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      // If we don't have the category ID yet, fetch it first
      let categoryId = editorialCategoryId;
      if (!categoryId) {
        categoryId = await fetchEditorialCategoryId();
        setEditorialCategoryId(categoryId);
      }

      const res = await fetch(
        `https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed&categories=${categoryId}&per_page=9&page=${pageNum}&orderby=date&order=desc`
      );

      if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);

      const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1");
      setHasMore(pageNum < totalPages);

      const data = await res.json();

      const formatted = data.map((post, index) => {
        let image = getFeaturedImage(post);
        
        return {
          id: post.id,
          image,
          title: decodeHtmlEntities(post.title.rendered),
          author: getAuthorName(post),
          category: "Editorials",
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
    fetchArticles(1);
  }, []);

  // Load more handler
  const handleLoadMore = () => {
    if (!loading && hasMore) fetchArticles(page + 1);
  };

  // Animation variants
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

      {/* Section Header */}
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
        <p className="text-lg font-extrabold uppercase">editorials</p>
      </motion.div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-0 sm:mx-6 md:mx-8 lg:mx-16">
        {apiLoading
          ? Array.from({ length: 9 }).map((_, i) => (
              <ArticleSkeleton key={i} index={i} />
            ))
          : articles.map((article, i) => (
              <motion.div
                key={`${article.id}-${i}`}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                custom={i * 0.15}
                className="bg-white hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => router.push(`/${article.slug}`)}
              >
                <div className="w-full h-48 md:h-64 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "/images/placeholder.jpg";
                      e.target.onerror = null;
                    }}
                  />
                </div>
                <div className="p-4 md:p-6">
                  <p className="text-sm md:text-[16px] font-bold text-black mb-3 leading-tight">
                    {article.title}
                  </p>
                  <div className="flex sm:flex-row sm:items-center gap-1 sm:gap-0">
                    <span className="text-[12px] text-black/50 font-medium">
                      {article.author?.toUpperCase()}
                    </span>
                    <span className="hidden sm:inline text-xs text-gray-400 mx-2">
                      •
                    </span>
                    <span className="text-[12px] text-black/50 font-medium">
                      {article.category}
                    </span>
                    <span className="hidden sm:inline text-xs text-gray-400 mx-2">
                      •
                    </span>
                    <span className="text-[12px] text-black/50">
                      {article.time}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
      </div>

      {/* Load More Button */}
      {articles.length > 0 && hasMore && !apiLoading && (
        <div className="bg-black py-2 md:py-6 flex justify-center mt-2">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 text-[14px] font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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

      {/* No More Articles Message */}
      {!hasMore && !apiLoading && (
        <div className="flex justify-center mb-8 items-center">
            <div className="px-4 py-2  font-normal rounded-full bg-[#F26509]">
              <p>coming soon</p>
            </div>
          </div>
      )}

      {/* Error Message */}
      {error && articles.length > 0 && (
        <div className="bg-black py-2 md:py-6 flex justify-center mt-2">
          <p className="text-red-400 text-sm">Error loading more articles: {error}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mx-0 sm:mx-6 md:mx-8 lg:mx-16">
        <Footer />
      </div>
    </div>
  );
}