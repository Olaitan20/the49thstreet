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
    <div className="w-full h-48 md:h-64 overflow-hidden bg-gray-300 animate-pulse">
      <div className="w-full h-full bg-gray-600"></div>
    </div>
    
    <div className="p-4 md:p-6">
      <div className="space-y-2">
        <div className="h-4 bg-gray-600 animate-pulse"></div>
        <div className="h-4 bg-gray-600 animate-pulse w-3/4"></div>
        <div className="h-4 bg-gray-600 animate-pulse w-1/2"></div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <div className="h-3 bg-gray-600 animate-pulse w-16"></div>
        <div className="h-3 bg-gray-600 animate-pulse w-12"></div>
        <div className="h-3 bg-gray-600 animate-pulse w-20"></div>
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [creativeHubCategoryId, setCreativeHubCategoryId] = useState(null);

  // Fetch categories and Creative Hub articles from WordPress API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setApiLoading(true);
        setError(null);

        console.log("🔄 Fetching Creative Hub category...");

        // Fetch the specific Creative Hub category
        const categoriesResponse = await fetch(
          "https://staging.the49thstreet.com/wp-json/wp/v2/categories?slug=creative-hub"
        );
        
        if (!categoriesResponse.ok) {
          throw new Error(`Categories API error: ${categoriesResponse.status}`);
        }
        
        const categoriesData = await categoriesResponse.json();
        console.log("🎨 Creative Hub category found:", categoriesData);
        
        let categoryId = null;
        let posts = [];

        if (categoriesData.length > 0) {
          categoryId = categoriesData[0].id;
          setCreativeHubCategoryId(categoryId);
          console.log('✅ Creative Hub category ID:', categoryId);
          console.log('✅ Creative Hub category Name:', categoriesData[0].name);
        }

        // Fetch initial posts (page 1)
        await fetchArticles(1, categoryId);
        
      } catch (err) {
        console.error("❌ Failed to fetch data:", err);
        setError(err.message || "Failed to load Creative Hub articles");
      } finally {
        setApiLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to fetch articles with pagination
  const fetchArticles = async (pageNum, categoryId = creativeHubCategoryId) => {
    try {
      setLoading(true);
      setError(null);

      let postsUrl = '';
      
      if (categoryId) {
        // Fetch posts from Creative Hub category
        postsUrl = `https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed&categories=${categoryId}&per_page=9&page=${pageNum}&orderby=date&order=desc`;
      } else {
        // Fetch latest posts if no category found
        postsUrl = `https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed&per_page=9&page=${pageNum}&orderby=date&order=desc`;
      }
      
      console.log(`📡 Fetching page ${pageNum}:`, postsUrl);
      
      const response = await fetch(postsUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      // Get pagination info from headers
      const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
      const totalItems = parseInt(response.headers.get('X-WP-Total') || '0');
      
      console.log(`📊 Page ${pageNum} of ${totalPages}, Total items: ${totalItems}`);
      setHasMore(pageNum < totalPages);
      
      const posts = await response.json();
      console.log(`✅ Got ${posts.length} posts for page ${pageNum}`);
      
      // Transform WordPress data
      const newArticles = posts.map((post, index) => {
        // Get featured image or use fallback
        let featuredImage = '/images/placeholder.jpg';
        const featuredMedia = post._embedded?.['wp:featuredmedia'];
        
        if (featuredMedia && featuredMedia[0] && featuredMedia[0].source_url) {
          featuredImage = featuredMedia[0].source_url;
        } else {
          // Use creative-themed fallback images
          const creativeImages = ['/images/victony.png', '/images/wizkid.png', '/images/minz.png'];
          featuredImage = creativeImages[index % creativeImages.length];
        }
        
        const author = post._embedded?.author?.[0]?.name || 'CREATIVE DESK';
        const postCategories = post._embedded?.['wp:term']?.[0] || [];
        
        // Use Creative Hub category name if available, otherwise use first category or default to CREATIVE HUB
        let category = 'CREATIVE HUB';
        if (postCategories.length > 0) {
          category = postCategories[0].name.toUpperCase();
        }
        
        // Decode HTML entities in title
        const decodeHtmlEntities = (text) => {
          if (typeof text !== 'string') return text;
          const textarea = document.createElement('textarea');
          textarea.innerHTML = text;
          return textarea.value;
        };
        
        const cleanTitle = decodeHtmlEntities(post.title.rendered);
        
        return {
          id: post.id,
          image: featuredImage,
          title: cleanTitle,
          author: author,
          category: category,
          time: getTimeAgo(post.date),
          slug: post.slug
        };
      });
      
      // Add new articles to existing list
      if (pageNum === 1) {
        setArticles(newArticles);
      } else {
        setArticles(prev => [...prev, ...newArticles]);
      }
      
      setPage(pageNum);
      
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError(err.message || "Failed to load more articles");
    } finally {
      setLoading(false);
    }
  };

  // Load more handler - FIXED
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchArticles(page + 1, creativeHubCategoryId);
    }
  };

  // Helper function to format date relative to now
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "JUST NOW";
    if (diffInMinutes < 60) return `${diffInMinutes} MINS AGO`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} HOURS AGO`;
    return `${Math.floor(diffInMinutes / 1440)} DAYS AGO`;
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

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Headline */}
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
        <p className="text-lg font-extrabold uppercase">creative hub</p>
      </motion.div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-0 sm:mx-6 md:mx-8 lg:mx-16">
        {apiLoading ? (
          // Show skeleton loaders while loading
          Array.from({ length: 9 }).map((_, index) => (
            <ArticleSkeleton key={index} index={index} />
          ))
        ) : error ? (
          // Error state
          <div className="col-span-full text-center py-12">
            <p className="text-red-400 mb-2">Failed to load Creative Hub articles</p>
            <p className="text-white/60 text-sm mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        ) : articles.length === 0 ? (
          // Empty state
          <div className="col-span-full text-center py-12">
            <p className="text-white/60">No Creative Hub articles found</p>
            <p className="text-white/40 text-sm mt-2">Check back later for new creative content</p>
          </div>
        ) : (
          // Actual articles
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
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = "/images/placeholder.jpg";
                  }}
                />
              </div>

              <div className="p-4 md:p-6">
                <p className="text-sm md:text-[16px] truncate font-bold text-black mb-3 leading-tight">
                  {article.title}
                </p>
                
                <div className="flex truncate sm:flex-row sm:items-center gap-1 sm:gap-0">
                  <span className="text-[12px] text-black/50 ">
                    {article.author}
                  </span>
                  <span className="inline text-xs text-gray-400 sm:mx-1 ">
                    •
                  </span>
                  <span className="text-[12px] text-black/50 ">
                    {article.category}
                  </span>
                  <span className="inline text-xs text-gray-400 sm:mx-1">
                    •
                  </span>
                  <span className="text-[12px] text-black/50">
                    {article.time}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {!apiLoading && !error && articles.length > 0 && hasMore && (
        <div className="bg-black py-2 md:py-6 flex justify-center mt-2">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 text-[14px] font-semibold  disabled:opacity-60 disabled:cursor-not-allowed"
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
      {!apiLoading && !error && articles.length > 0 && !hasMore && (
        <div className="bg-black py-2 md:py-6 flex justify-center mt-2">
          <p className="text-white/60 text-sm">No more articles to load</p>
        </div>
      )}

      <div className="mx-0 sm:mx-6 md:mx-8 lg:mx-16">
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
