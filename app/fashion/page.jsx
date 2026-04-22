"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Headline from "@/components/layout/Headline";
import Footer from "@/components/layout/Footer";
import { wpFetch } from "@/lib/wordpress";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fashionCategoryId, setFashionCategoryId] = useState(null);
  const [contributorsMap, setContributorsMap] = useState({});

  // Function to decode HTML entities
  const decodeHtmlEntities = (text) => {
    if (typeof text !== "string") return text;

    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  };

  // Function to calculate time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now - postDate;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInMins < 60) {
      return `${diffInMins} MINS AGO`;
    } else if (diffInHours < 24) {
      return `${diffInHours} HOURS AGO`;
    } else if (diffInDays < 30) {
      return `${diffInDays} DAYS AGO`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} MONTH${diffInMonths > 1 ? "S" : ""} AGO`;
    } else {
      return `${diffInYears} YEAR${diffInYears > 1 ? "S" : ""} AGO`;
    }
  };

  // Fetch contributors first
  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const contributors = await wpFetch("/the49th/v1/contributors");
        const contribMap = {};
        contributors.forEach((contributor) => {
          contribMap[contributor.id] = contributor.name;
        });
        setContributorsMap(contribMap);
      } catch (error) {
        console.error("Error fetching contributors:", error);
      }
    };

    fetchContributors();
  }, []);

  // Get fashion category ID
  useEffect(() => {
    const getFashionCategory = async () => {
      try {
        const categories = await wpFetch("/wp/v2/categories?slug=fashion");
        if (categories.length > 0) {
          setFashionCategoryId(categories[0].id);
        }
      } catch (error) {
        console.error("Error fetching fashion category:", error);
      }
    };

    getFashionCategory();
  }, []);

  // Fetch articles function with pagination
  const fetchArticles = async (pageNum = 1) => {
    if (Object.keys(contributorsMap).length === 0) return;

    try {
      setLoading(true);

      let posts = [];
      let totalPages = 1;

      // Try fashion category if we have the ID
      if (fashionCategoryId) {
        const url = `https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed=author,wp:featuredmedia,wp:term&categories=${fashionCategoryId}&per_page=9&page=${pageNum}&orderby=date&order=desc`;
        const postsResponse = await fetch(url);

        if (postsResponse.ok) {
          posts = await postsResponse.json();
          totalPages = parseInt(
            postsResponse.headers.get("X-WP-TotalPages") || "1",
          );
        }
      }

      // If no fashion posts found, use latest posts
      if (posts.length === 0) {
        const url = `https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed=author,wp:featuredmedia,wp:term&per_page=9&page=${pageNum}&orderby=date&order=desc`;
        const latestResponse = await fetch(url);

        if (latestResponse.ok) {
          posts = await latestResponse.json();
          totalPages = parseInt(
            latestResponse.headers.get("X-WP-TotalPages") || "1",
          );
        }
      }

      setHasMore(pageNum < totalPages);

      // Transform WordPress data
      const formattedArticles = posts.map((post) => {
        const featuredImage =
          post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
          "/images/placeholder.jpg";

        const contributorId = post.author;
        let contributorName = "FASHION DESK";

        if (contributorId && contributorsMap[contributorId]) {
          contributorName = contributorsMap[contributorId];
        }

        const postCategories = post._embedded?.["wp:term"]?.[0] || [];
        const category =
          postCategories.length > 0
            ? postCategories[0].name.toUpperCase()
            : "FASHION";

        const cleanTitle = decodeHtmlEntities(post.title.rendered);

        return {
          id: post.id,
          image: featuredImage,
          title: cleanTitle,
          contributor: contributorName,
          category: category,
          time: getTimeAgo(post.date),
          slug: post.slug,
          contributorId: post.author,
        };
      });

      if (pageNum === 1) {
        setArticles(formattedArticles);
      } else {
        setArticles((prev) => [...prev, ...formattedArticles]);
      }

      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching fashion posts:", error);
      if (pageNum === 1) {
        setArticles([]);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      if (pageNum === 1) {
        setIsLoadingArticles(false);
      }
    }
  };

  // Initial fetch - wait for both contributors and fashion category
  useEffect(() => {
    if (Object.keys(contributorsMap).length === 0) return;

    const timer = setTimeout(() => {
      fetchArticles(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [fashionCategoryId, contributorsMap]);

  // Load more handler
  const handleLoadMore = () => {
    if (!loading && hasMore && Object.keys(contributorsMap).length > 0) {
      fetchArticles(page + 1);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  // Loading state
  if ((isLoadingArticles && Object.keys(contributorsMap).length === 0) || isLoadingArticles) {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <Headline />

        <motion.div
          variants={fadeUp}
          initial="visible"
          animate="visible"
          custom={0.1}
          className="mx-2 sm:mx-6 md:mx-8 lg:mx-16 py-4"
        >
          <p className="uppercase text-[11px] tracking-widest text-white/60 mb-2">
            /// Latest
          </p>
          <p className="text-lg font-extrabold uppercase">Fashion News</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-0 sm:mx-6 md:mx-8 lg:mx-16">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
            <div key={item} className="bg-gray-700 animate-pulse">
              <div className="w-full h-48 md:h-64 bg-gray-600"></div>
              <div className="p-4 md:p-6">
                <div className="h-4 bg-gray-600 mb-3"></div>
                <div className="h-3 bg-gray-600 w-3/4"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-0 sm:mx-6 md:mx-8 lg:mx-16">
          <Footer />
        </div>
      </div>
    );
  }

  // Empty state
  if (articles.length === 0) {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <Headline />
        <motion.div
          variants={fadeUp}
          initial="visible"
          animate="visible"
          custom={0.1}
          className="mx-2 sm:mx-6 md:mx-8 lg:mx-16 py-4"
        >
          <p className="uppercase text-[11px] tracking-widest text-white/60 mb-2">
            /// Latest
          </p>
          <p className="text-lg font-extrabold uppercase">Fashion News</p>
        </motion.div>
        <div className="mx-2 sm:mx-6 md:mx-8 lg:mx-16 py-10">
          <p className="text-[12px] uppercase tracking-widest text-white/40">
            No fashion stories yet.
          </p>
          <div className="mt-4 h-[1px] w-16 bg-[#F26509]"></div>
        </div>
        <div className="mx-0 sm:mx-6 md:mx-8 lg:mx-16">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      <Headline />

      <motion.div
        variants={fadeUp}
        initial="visible"
        animate="visible"
        custom={0.1}
        className="mx-2 sm:mx-6 md:mx-8 lg:mx-16 py-4"
      >
        <p className="uppercase text-[11px] tracking-widest text-white/60 mb-2">
          /// Latest
        </p>
        <p className="text-lg font-extrabold uppercase">Fashion News</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-0 sm:mx-6 md:mx-8 lg:mx-16 ">
        {articles.map((article, index) => (
          <motion.div
            key={`${article.id}-${index}`}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            custom={index * 0.15}
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
              <p className="text-sm md:text-[16px] font-bold text-black mb-3 truncate leading-tight line-clamp-2">
                {article.title}
              </p>
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[12px] text-black/50 ">
                  {article.contributor?.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-[12px] text-black/50 ">
                  {article.category}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-[12px] text-black/50">
                  {article.time}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More Button */}
      {articles.length > 0 && hasMore && (
        <div className="bg-black py-2 md:py-6 flex justify-center mt-2">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 text-[14px] font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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

      {/* No more articles message */}
      {!hasMore && articles.length > 0 && (
        <div className="bg-black py-2 md:py-6 flex justify-center mt-2">
          <p className="text-white/60 text-sm">No more articles to load</p>
        </div>
      )}

      <div className="mx-0 sm:mx-6 md:mx-8 lg:mx-16">
        <Footer />
      </div>
    </div>
  );
}
