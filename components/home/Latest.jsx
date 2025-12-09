"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Latest() {
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

  // Fetch music posts
  useEffect(() => {
    const fetchMusicPosts = async () => {
      try {
        setIsLoadingArticles(true);

        // Get Music category ID
        const categoriesResponse = await fetch(
          "https://staging.the49thstreet.com/wp-json/wp/v2/categories?slug=music"
        );
        const categories = await categoriesResponse.json();
        if (!categories.length) {
          setArticles([]);
          return;
        }
        const musicCategoryId = categories[0].id;

        // Fetch posts from Music category
        const postsResponse = await fetch(
          `https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed&categories=${musicCategoryId}&per_page=3&orderby=date&order=desc`
        );
        const posts = await postsResponse.json();

        const formattedArticles = posts.map((post) => {
          const featuredImage =
            post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
            "/images/placeholder.jpg";
          const author =
            post._embedded?.author?.[0]?.name || "49TH STREET";
          const categories = post._embedded?.["wp:term"]?.[0] || [];
          const category =
            categories.length > 0 ? categories[0].name.toUpperCase() : "MUSIC";

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

        setArticles(formattedArticles);
      } catch (error) {
        console.error("Error fetching music posts:", error);
        setArticles([]);
      } finally {
        setIsLoadingArticles(false);
      }
    };

    fetchMusicPosts();
  }, []);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => router.push("/music"), 1200);
  };

  // Static fallback
  const staticArticles = [
    {
      id: 1,
      image: "/images/burna.png",
      title: "Victony Scores New Certification With Efforts On Victony's 'Stubborn'",
      author: "IAM NOONE",
      category: "MUSIC",
      time: "5 MINS AGO",
      slug: "victony-certification",
    },
    {
      id: 2,
      image: "/images/olamide.png",
      title: "Wizkid Makes Surprise Nativeland Appearance",
      author: "49TH STREET",
      category: "MUSIC",
      time: "20 MINS AGO",
      slug: "wizkid-nativeland",
    },
    {
      id: 3,
      image: "/images/chowdeck.png",
      title: "New Music Collaboration Breaks Records",
      author: "TEMPLE EGEMESI",
      category: "MUSIC",
      time: "23 MINS AGO",
      slug: "music-collaboration",
    },
  ];

  const displayArticles = articles.length > 0 ? articles : staticArticles;

  if (isLoadingArticles) {
    return (
      <div className="bg-white md:bg-transparent">
        <section className="px-0 sm:px-6 md:px-8 lg:px-16 pt-[24px] md:pt-0 md:mt-20">
          <div className="mb-4 md:mb-8 px-4 md:px-0">
            <p className="text-[12px] uppercase mb-1 tracking-widest text-black md:text-white/50">
              /// MUSIC
            </p>
            <p className="text-base md:text-[16px] uppercase font-extrabold text-black md:text-white">
              Latest in the world of music
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-gray-700/80  shadow-sm animate-pulse"
              >
                <div className="w-full h-48 bg-gray-700 "></div>
                <div className="p-4 md:p-6">
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-700  w-full"></div>
                    <div className="h-4 bg-gray-700  w-3/4"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 bg-gray-600  w-16"></div>
                    <div className="h-3 bg-gray-600  w-12"></div>
                    <div className="h-3 bg-gray-600  w-14"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-white pb-0 md:bg-transparent">
      <section className="px-0 sm:px-6 md:px-8 lg:px-16 pt-[24px] md:pt-0 md:mt-20">
        {/* Header */}
        <div className="mb-4 md:mb-8 px-4 md:px-0">
          <p className="text-[10px] md:text-[12px] uppercase mb-1 tracking-widest text-black md:text-white/50">
            /// MUSIC
          </p>
          <p className="text-[14px] md:text-[16px] uppercase font-extrabold text-black md:text-white">
            Latest in the world of music
          </p>
        </div>

        {/* Articles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ">
          {displayArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => router.push(`/article/${article.slug}`)}
            >
              <div className="w-full h-48 overflow-hidden">
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
                <div className="flex items-center space-x-2">
                  <span className="text-[12px] text-black/50 font-medium">
                    {article.author}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-[12px] text-black/50 font-medium">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-[12px] text-black/50">{article.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="bg-black py-4 flex justify-center mt-8 md:mb-12">
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
              "load More"
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
