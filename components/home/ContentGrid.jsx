"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ContentGrid() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);

  // Decode HTML entities
  const decodeHtmlEntities = (text) => {
    if (typeof text !== "string") return text;
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
  };

  // Time ago helper
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now - postDate;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInMins < 60) return `${diffInMins} MINS AGO`;
    if (diffInHours < 24) return `${diffInHours} HOURS AGO`;
    if (diffInDays < 30) return `${diffInDays} DAYS AGO`;
    if (diffInMonths < 12)
      return `${diffInMonths} MONTH${diffInMonths > 1 ? "S" : ""} AGO`;
    return `${diffInYears} YEAR${diffInYears > 1 ? "S" : ""} AGO`;
  };

  // Fetch WordPress posts with author information
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoadingArticles(true);

        // Fetch posts with embedded data
        const response = await fetch(
          "https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed=author,wp:featuredmedia,wp:term&per_page=3"
        );

        if (!response.ok) throw new Error("Failed to fetch posts");

        const posts = await response.json();

        // Create an array to store articles with author info
        const formattedArticles = [];

        // Process each post
        for (const post of posts) {
          // Get featured image
          const featuredImage =
            post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
            "/images/placeholder.jpg";

          // Get categories
          const categories = post._embedded?.["wp:term"]?.[0] || [];
          const category =
            categories.length > 0 ? categories[0].name.toUpperCase() : "NEWS";

          // Get author name - try different ways to fetch it
          let authorName = "49TH STREET"; // Default fallback
          
          // Method 1: Try from embedded author
          if (post._embedded?.author?.[0]?.name) {
            authorName = post._embedded.author[0].name;
          } 
          // Method 2: If author ID exists, fetch author separately
          else if (post.author) {
            try {
              const authorResponse = await fetch(
                `https://staging.the49thstreet.com/wp-json/wp/v2/users/${post.author}`
              );
              
              if (authorResponse.ok) {
                const authorData = await authorResponse.json();
                authorName = authorData.name || authorData.slug || "49TH STREET";
              }
            } catch (error) {
              console.warn("Could not fetch author:", error);
            }
          }
          
          // Method 3: Try from post data directly
          else if (post.author_data?.name) {
            authorName = post.author_data.name;
          }

          formattedArticles.push({
            id: post.id,
            image: featuredImage,
            title: decodeHtmlEntities(post.title.rendered),
            author: authorName,
            category,
            time: getTimeAgo(post.date),
            slug: post.slug,
            authorId: post.author, // Keep author ID for reference
          });
        }

        setArticles(formattedArticles);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setArticles([]);
      } finally {
        setIsLoadingArticles(false);
      }
    };

    fetchPosts();
  }, []);

  // Load more button handler
  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      router.push("/news");
    }, 1200);
  };

  // LOADING STATE
  if (isLoadingArticles) {
    return (
      <div className="bg-white md:bg-transparent">
        <section className="px-0 sm:px-6 md:px-8 lg:px-16 pt-[24px] md:pt-0 md:mt-20">
          <div className="mb-4 md:mb-8 px-4 md:px-0">
            <p className="text-[12px] uppercase mb-1 tracking-widest text-black md:text-white/50">
              /// LATEST
            </p>
            <p className="text-base md:text-[16px] uppercase font-extrabold text-black md:text-white">
              Fresh off the press
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-gray-700/80 shadow-sm animate-pulse"
              >
                <div className="w-full h-48 bg-gray-700"></div>

                <div className="p-4 md:p-6">
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-600 w-full"></div>
                    <div className="h-4 bg-gray-600 w-3/4"></div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="h-3 bg-gray-600 w-16"></div>
                    <div className="h-3 bg-gray-600 w-12"></div>
                    <div className="h-3 bg-gray-600 w-14"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // If no articles found
  if (articles.length === 0 && !isLoadingArticles) {
    return (
      <div className="bg-white md:bg-transparent">
        <section className="px-0 sm:px-6 md:px-8 lg:px-16 pt-[24px] md:pt-0 md:mt-20">
          <div className="mb-4 md:mb-8 px-4 md:px-0">
            <p className="text-[12px] uppercase mb-1 tracking-widest text-black md:text-white/50">
              /// LATEST
            </p>
            <p className="text-base md:text-[16px] uppercase font-extrabold text-black md:text-white">
              Fresh off the press
            </p>
          </div>
          <div className="text-center py-10 text-gray-500">
            No articles found.
          </div>
        </section>
      </div>
    );
  }

  // MAIN RENDER
  return (
    <div className="bg-white md:bg-transparent">
      <section className="px-0 sm:px-6 md:px-8 lg:px-16 pt-[24px] md:pt-0 md:mt-20">
        {/* Header */}
        <div className="mb-4 md:mb-8 px-4 md:px-0">
          <p className="text-[12px] uppercase mb-1 tracking-widest text-black md:text-white/50">
            /// WHAT'S NEW
          </p>
          <p className="text-[14px] md:text-[16px] uppercase font-extrabold text-black md:text-white">
            Fresh off the press
          </p>
        </div>

        {/* Articles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => router.push(`/${article.slug}`)}
            >
              <div className="w-full aspect-video overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => (e.target.src = "/images/placeholder.jpg")}
                />
              </div>

              <div className="p-4 md:p-6">
                <p className="text-sm md:text-[16px] font-bold text-black mb-2 truncate leading-tight line-clamp-2">
                  {article.title}
                </p>

                <div className="flex flex-row items-center gap-1 flex-wrap">
                  {/* Author */}
                  <span className="text-[12px] text-black/50">
                    {article.author?.toUpperCase()}
                  </span>
                  
                  {/* Separator - only show if category exists */}
                  {article.category && article.category !== "NEWS" && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-[12px] text-black/50">
                        {article.category}
                      </span>
                    </>
                  )}
                  
                  {/* Time */}
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-[12px] text-black/50">
                    {article.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* LOAD MORE */}
        <div className="bg-black py-4 flex justify-center md:mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="flex items-center justify-center gap-2 text-white text-[14px] font-semibold rounded-full disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      </section>
    </div>
  );
}