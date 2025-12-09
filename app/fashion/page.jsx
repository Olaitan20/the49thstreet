"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Headline from "@/components/layout/Headline";
import Footer from "@/components/layout/Footer";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fashionCategoryId, setFashionCategoryId] = useState(null);

  // Function to decode HTML entities
  const decodeHtmlEntities = (text) => {
    if (typeof text !== 'string') return text;
    
    const textarea = document.createElement('textarea');
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

    if (diffInMins < 60) {
      return `${diffInMins} MINS AGO`;
    } else if (diffInHours < 24) {
      return `${diffInHours} HOURS AGO`;
    } else {
      return `${diffInDays} DAYS AGO`;
    }
  };

  // Get fashion category ID
  useEffect(() => {
    const getFashionCategory = async () => {
      try {
        const categoriesResponse = await fetch(
          'http://staging.the49thstreet.com/wp-json/wp/v2/categories?slug=fashion'
        );
        
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const categories = await categoriesResponse.json();
        console.log("👗 Fashion categories found:", categories);
        
        if (categories.length > 0) {
          setFashionCategoryId(categories[0].id);
          console.log('Fashion category ID:', categories[0].id);
        }
      } catch (error) {
        console.error('Error fetching fashion category:', error);
      }
    };

    getFashionCategory();
  }, []);

  // Fetch articles function with pagination
  const fetchArticles = async (pageNum = 1) => {
    try {
      setLoading(true);
      
      console.log(`Fetching fashion posts page ${pageNum}...`);
      
      let posts = [];

      // Try fashion category if we have the ID
      if (fashionCategoryId) {
        const postsResponse = await fetch(
          `http://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed&categories=${fashionCategoryId}&per_page=9&page=${pageNum}&orderby=date&order=desc`
        );
        
        if (postsResponse.ok) {
          posts = await postsResponse.json();
          
          // Get pagination info from headers
          const totalPages = parseInt(postsResponse.headers.get('X-WP-TotalPages') || '1');
          const totalItems = parseInt(postsResponse.headers.get('X-WP-Total') || '0');
          console.log(`📊 Page ${pageNum} of ${totalPages}, Total items: ${totalItems}`);
          setHasMore(pageNum < totalPages);
          
          console.log('Fashion posts found:', posts.length);
        }
      }

      // If no fashion posts found, use latest posts
      if (posts.length === 0) {
        console.log("🔄 No fashion posts, fetching latest posts...");
        const latestResponse = await fetch(
          `http://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed&per_page=9&page=${pageNum}&orderby=date&order=desc`
        );
        
        if (latestResponse.ok) {
          posts = await latestResponse.json();
          
          // Get pagination info from headers
          const totalPages = parseInt(latestResponse.headers.get('X-WP-TotalPages') || '1');
          const totalItems = parseInt(latestResponse.headers.get('X-WP-Total') || '0');
          console.log(`📊 Page ${pageNum} of ${totalPages}, Total items: ${totalItems}`);
          setHasMore(pageNum < totalPages);
          
          console.log('📝 Latest posts found:', posts.length);
        }
      }

      // Transform WordPress data
      const formattedArticles = posts.map((post, index) => {
        // Get featured image or use fallback
        let featuredImage = '/images/placeholder.jpg';
        const featuredMedia = post._embedded?.['wp:featuredmedia'];
        
        if (featuredMedia && featuredMedia[0] && featuredMedia[0].source_url) {
          featuredImage = featuredMedia[0].source_url;
        } else {
          // Use fashion-themed fallback images
          const fashionImages = ['/images/minz.png', '/images/victony.png', '/images/wizkid.png'];
          featuredImage = fashionImages[index % fashionImages.length];
        }
        
        const author = post._embedded?.author?.[0]?.name || 'FASHION DESK';
        const postCategories = post._embedded?.['wp:term']?.[0] || [];
        const category = postCategories.length > 0 ? postCategories[0].name.toUpperCase() : 'FASHION';
        
        // Decode HTML entities in title
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
      
      // Add new articles to existing list or set initial articles
      if (pageNum === 1) {
        setArticles(formattedArticles);
      } else {
        setArticles(prev => [...prev, ...formattedArticles]);
      }
      
      setPage(pageNum);
      
    } catch (error) {
      console.error('Error fetching fashion posts:', error);
      // Use static data as fallback only on initial load
      if (pageNum === 1) {
        console.log('🔄 Using static fashion data');
        setArticles(staticArticles);
        setHasMore(false); // No more pages for static data
      }
    } finally {
      setLoading(false);
      if (pageNum === 1) {
        setIsLoadingArticles(false);
      }
    }
  };

  // Initial fetch
  useEffect(() => {
    // Give time to get fashion category ID
    const timer = setTimeout(() => {
      fetchArticles(1);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [fashionCategoryId]);

  // FIXED: Load more handler - actually loads more articles
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchArticles(page + 1);
    }
  };

  // Static fallback data
  const staticArticles = [
    {
      id: 1,
      image: "/images/minz.png",
      title: "Minz Stuns For Orange Fashion Campaign",
      author: "FASHION EDITOR",
      category: "FASHION",
      time: "5 MINS AGO",
      slug: "minz-orange-campaign"
    },
    {
      id: 2,
      image: "/images/victony.png",
      title: "Lagos Fashion Week Announces 2024 Lineup",
      author: "FASHION DESK",
      category: "FASHION",
      time: "20 MINS AGO",
      slug: "lagos-fashion-week"
    },
    {
      id: 3,
      image: "/images/wizkid.png",
      title: "African Designers Dominate Paris Runway",
      author: "STYLE CORRESPONDENT",
      category: "FASHION",
      time: "23 MINS AGO",
      slug: "african-designers-paris"
    },
  ];

  const displayArticles = articles.length > 0 ? articles : staticArticles;

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
  if (isLoadingArticles) {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <Headline />
        
        {/* Loading Skeleton */}
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

        {/* Loading Grid */}
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

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Headline */}
      <Headline />

      {/* Section Header */}
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

      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-0 sm:mx-6 md:mx-8 lg:mx-16 ">
        {displayArticles.map((article, index) => (
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
                  console.log('❌ Image failed to load:', article.image);
                  // Fallback to local image
                  const fashionImages = ['/images/minz.png', '/images/victony.png', '/images/wizkid.png'];
                  const randomFashion = fashionImages[Math.floor(Math.random() * fashionImages.length)];
                  e.target.src = randomFashion;
                  e.target.onerror = null; 
                }}
              />
            </div>

            <div className="p-4 md:p-6">
              <p className="text-sm md:text-[16px] font-bold text-black mb-3 leading-tight line-clamp-2">
                {article.title}
              </p>
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[12px] text-black/50 font-medium">
                  {article.author}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-[12px] text-black/50 font-medium">
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
      
      {/* Load More Button - Only show if there are more articles */}
      {displayArticles.length > 0 && hasMore && (
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
      {!hasMore && displayArticles.length > 0 && (
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
