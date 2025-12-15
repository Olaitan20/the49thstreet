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
  const [musicCategoryId, setMusicCategoryId] = useState(null);

  // Decode HTML entities
  const decodeHtmlEntities = (text) => {
    if (typeof text !== "string") return text;
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  };

  // Calculate "time ago"
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

  // Get music category ID
  useEffect(() => {
    const getMusicCategory = async () => {
      try {
        const categoriesResponse = await fetch(
          "https://staging.the49thstreet.com/wp-json/wp/v2/categories?slug=music"
        );
        const categories = await categoriesResponse.json();
        
        if (categories.length) {
          setMusicCategoryId(categories[0].id);
          console.log('Music category ID:', categories[0].id);
        }
      } catch (error) {
        console.error("Error fetching music category:", error);
      }
    };

    getMusicCategory();
  }, []);

  // Fetch articles (music category first, fallback to latest)
  const fetchArticles = async (pageNum = 1) => {
    try {
      setLoading(true);
      let posts = [];

      // Try music category if we have the ID
      if (musicCategoryId) {
        const postsResponse = await fetch(
          `https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed&categories=${musicCategoryId}&per_page=9&page=${pageNum}&orderby=date&order=desc`
        );
        
        if (postsResponse.ok) {
          posts = await postsResponse.json();
          
          // Get pagination info from headers
          const totalPages = parseInt(postsResponse.headers.get('X-WP-TotalPages') || '1');
          setHasMore(pageNum < totalPages);
        }
      }

      // Fallback to latest if no music posts
      if (posts.length === 0) {
        const latestResponse = await fetch(
          `https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed&per_page=9&page=${pageNum}&orderby=date&order=desc`
        );
        
        if (latestResponse.ok) {
          posts = await latestResponse.json();
          
          // Get pagination info from headers
          const totalPages = parseInt(latestResponse.headers.get('X-WP-TotalPages') || '1');
          setHasMore(pageNum < totalPages);
        }
      }

      const formattedArticles = posts.map((post, index) => {
        let featuredImage = "/images/placeholder.jpg";
        const featuredMedia = post._embedded?.["wp:featuredmedia"];
        if (featuredMedia && featuredMedia[0]?.source_url) {
          featuredImage = featuredMedia[0].source_url;
        } else {
          const localImages = [
            "/images/victony.png",
            "/images/wizkid.png",
            "/images/minz.png",
          ];
          featuredImage = localImages[index % localImages.length];
        }

        const author = post._embedded?.author?.[0]?.name || "49TH STREET";
        const postCategories = post._embedded?.["wp:term"]?.[0] || [];
        const category =
          postCategories.length > 0
            ? postCategories[0].name.toUpperCase()
            : "MUSIC";

        return {
          id: post.id,
          image: featuredImage,
          title: decodeHtmlEntities(post.title.rendered),
          author,
          category,
          time: getTimeAgo(post.date),
          slug: post.slug,
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
      console.error("Error fetching articles:", error);
      // Use static articles as fallback only on initial load
      if (pageNum === 1) {
        setArticles(staticArticles);
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
    // Give time to get music category ID
    const timer = setTimeout(() => {
      fetchArticles(1);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [musicCategoryId]);

  // Static fallback data
  const staticArticles = [
    {
      id: 1,
      image: "/images/victony.png",
      title: "Victony Scores New Certification With Efforts On Victony's 'Stubborn'",
      author: "IAM NOONE",
      category: "MUSIC",
      time: "5 MINS AGO",
      slug: "victony-certification",
    },
    {
      id: 2,
      image: "/images/wizkid.png",
      title: "Wizkid Makes Surprise Nativeland Appearance",
      author: "49TH STREET",
      category: "MUSIC",
      time: "20 MINS AGO",
      slug: "wizkid-nativeland",
    },
    {
      id: 3,
      image: "/images/minz.png",
      title: "New Music Collaboration Breaks Records",
      author: "TEMPLE EGEMESI",
      category: "MUSIC",
      time: "23 MINS AGO",
      slug: "music-collaboration",
    },
  ];

  // FIXED: Load more handler - actually loads more articles
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchArticles(page + 1);
    }
  };

  const displayArticles = articles.length > 0 ? articles : staticArticles;

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
    }),
  };

  if (isLoadingArticles) {
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
          <p className="text-lg font-extrabold uppercase">music updates</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-0 sm:mx-6 md:mx-8 lg:mx-16 ">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-gray-700 animate-pulse">
              <div className="w-full h-48 md:h-64 bg-gray-600"></div>
              <div className="p-4 md:p-6">
                <div className="h-4 bg-gray-600 rounded mb-3"></div>
                <div className="h-3 bg-gray-600 rounded w-3/4"></div>
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
        <p className="text-lg font-extrabold uppercase">music updates</p>
      </motion.div>
      
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
                  const localImages = [
                    "/images/victony.png",
                    "/images/wizkid.png",
                    "/images/minz.png",
                  ];
                  e.target.src = localImages[Math.floor(Math.random() * localImages.length)];
                  e.target.onerror = null;
                }}
              />
            </div>
            <div className="p-4 md:p-6">
              <p className="text-sm md:text-[16px] truncate font-bold text-black mb-3 leading-tight line-clamp-2">
                {article.title}
              </p>
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[12px] text-black/50 ">{article.author}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-[12px] text-black/50 ">{article.category}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-[12px] text-black/50">{article.time}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More Button - Only show if there are more articles */}
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
