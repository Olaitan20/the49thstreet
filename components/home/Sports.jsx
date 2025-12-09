"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Sports() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);

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

  // Fetch sports category posts
  useEffect(() => {
    const fetchSportsPosts = async () => {
      try {
        setIsLoadingArticles(true);

        const allCategoriesResponse = await fetch(
          "http://staging.the49thstreet.com/wp-json/wp/v2/categories"
        );

        if (!allCategoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }

        const allCategories = await allCategoriesResponse.json();

        let sportsCategory = allCategories.find(
          (cat) =>
            cat.slug.toLowerCase().includes("sport") ||
            cat.name.toLowerCase().includes("sport")
        );

        let posts = [];

        if (sportsCategory) {
          const postsResponse = await fetch(
            `http://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed&categories=${sportsCategory.id}&per_page=3&orderby=date&order=desc`
          );

          if (postsResponse.ok) {
            posts = await postsResponse.json();
          }
        }

        if (posts.length === 0) {
          const latestResponse = await fetch(
            "http://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed&per_page=3&orderby=date&order=desc"
          );

          if (latestResponse.ok) {
            posts = await latestResponse.json();
          }
        }

        const formattedArticles = posts.map((post, index) => {
          const featuredMedia = post._embedded?.["wp:featuredmedia"];
          let featuredImage = "/images/placeholder.jpg";

          if (featuredMedia && featuredMedia[0]?.source_url) {
            featuredImage = featuredMedia[0].source_url;
          } else {
            const sportsImages = [
              "/images/burna.png",
              "/images/wizkid.png",
              "/images/minz.png",
            ];
            featuredImage = sportsImages[index % sportsImages.length];
          }

          const author = post._embedded?.author?.[0]?.name || "SPORTS DESK";
          const postCategories = post._embedded?.["wp:term"]?.[0] || [];

          let category = "SPORTS";
          if (sportsCategory) {
            category = sportsCategory.name.toUpperCase();
          } else if (postCategories.length > 0) {
            category = postCategories[0].name.toUpperCase();
          }

          return {
            id: post.id,
            image: featuredImage,
            title: post.title.rendered,
            author,
            category,
            time: getTimeAgo(post.date),
            slug: post.slug,
          };
        });

        setArticles(formattedArticles);
      } catch (error) {
        console.error("Error fetching sports posts:", error);
        setArticles(staticArticles);
      } finally {
        setIsLoadingArticles(false);
      }
    };

    fetchSportsPosts();
  }, []);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      router.push("/sports");
    }, 1500);
  };

  const staticArticles = [
    {
      id: 1,
      image: "/images/burna.png",
      title: "Super Eagles Qualify for World Cup 2026",
      author: "SPORTS DESK",
      category: "SPORTS",
      time: "2 HOURS AGO",
      slug: "super-eagles-world-cup",
    },
    {
      id: 2,
      image: "/images/wizkid.png",
      title: "NBA Africa Games Coming to Lagos",
      author: "SPORTS CORRESPONDENT",
      category: "SPORTS",
      time: "1 DAY AGO",
      slug: "nba-africa-games-lagos",
    },
    {
      id: 3,
      image: "/images/minz.png",
      title: "Athletics Federation Announces New Talent Program",
      author: "SPORTS ANALYST",
      category: "SPORTS",
      time: "3 DAYS AGO",
      slug: "athletics-talent-program",
    },
  ];

  const displayArticles = articles.length > 0 ? articles : staticArticles;

  if (isLoadingArticles) {
    return (
      <div className="bg-white md:bg-transparent">
        <section className="mx-0 sm:mx-6 md:mx-8 lg:mx-16 pt-[24px] md:pt-0 md:mt-20">
          <div className="mb-4 md:mb-8 px-4 md:px-0">
            <p className="text-[12px] uppercase mb-1 tracking-widest text-black md:text-white/50">
              /// SPORTS
            </p>
            <p className="text-base md:text-[16px] uppercase font-extrabold text-black md:text-white">
              Latest in the world of sports
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-gray-700 animate-pulse">
                <div className="w-full h-48 md:h-48 lg:h-50 bg-gray-600"></div>
                <div className="p-4 md:p-6">
                  <div className="h-4 bg-gray-600 mb-3"></div>
                  <div className="h-3 bg-gray-600 w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-white md:bg-transparent">
      <section className="mx-0 sm:mx-6 md:mx-8 lg:mx-16 pt-[24px] md:pt-0 md:mt-20">
        <div className="mb-4 md:mb-8 px-4 md:px-0">
          <p className="text-[10px] md:text-[12px] uppercase mb-1 tracking-widest text-black md:text-white/50">
            /// SPORTS
          </p>
          <p className="text-[14px] md:text-[16px] uppercase font-extrabold text-black md:text-white">
            Latest in the world of sports
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {displayArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => router.push(`/article/${article.slug}`)} 
            >
              <div className="w-full h-48 md:h-48 lg:h-50 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const localImages = [
                      "/images/burna.png",
                      "/images/wizkid.png",
                      "/images/minz.png",
                    ];
                    const randomLocal =
                      localImages[Math.floor(Math.random() * localImages.length)];
                    e.target.src = randomLocal;
                    e.target.onerror = null;
                  }}
                />
              </div>

              <div className="p-4 md:p-6">
                <p className="text-sm md:text-[16px] font-bold text-black mb-2 leading-tight truncate line-clamp-2">
                  {article.title}
                </p>
                <div className="flex sm:flex-row sm:items-center gap-1 sm:gap-0">
                  <span className="text-[12px] text-black/50 font-medium">
                    {article.author}
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
                  <span className="text-[12px] text-black/50">{article.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-black py-4 md:py-0 flex justify-center mt-8 md:mb-12">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="flex items-center justify-center gap-2 text-white text-[14px] font-semibold cursor-pointer rounded-full transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent text-[14px] rounded-full animate-spin"></span>
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
