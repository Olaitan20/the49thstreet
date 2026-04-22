"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { wpFetch } from "@/lib/wordpress";

export default function Sports() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [contributorsMap, setContributorsMap] = useState({});

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

  // Fetch sports category posts after contributors are loaded
  useEffect(() => {
    const fetchSportsPosts = async () => {
      if (Object.keys(contributorsMap).length === 0) return;

      try {
        setIsLoadingArticles(true);

        let posts = [];
        let sportsCategory = null;

        // Try to find sports category
        try {
          const allCategories = await wpFetch("/wp/v2/categories");
          sportsCategory = allCategories.find(
            (cat) =>
              cat.slug.toLowerCase().includes("sport") ||
              cat.name.toLowerCase().includes("sport"),
          );

          if (sportsCategory) {
            posts = await wpFetch(
              `/wp/v2/posts?_embed=author,wp:featuredmedia,wp:term&categories=${sportsCategory.id}&per_page=3&orderby=date&order=desc`,
            );
          }
        } catch (e) {
          console.error("Error fetching sports category:", e);
        }

        // Fallback to generic recent posts
        if (posts.length === 0) {
          try {
            posts = await wpFetch(
              "/wp/v2/posts?_embed=author,wp:featuredmedia,wp:term&per_page=3&orderby=date&order=desc",
            );
          } catch (e) {
            console.error("Error fetching fallback posts:", e);
          }
        }

        const formattedArticles = posts.map((post) => {
          const featuredImage =
            post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
            "/images/placeholder.jpg";

          const contributorId = post.author;
          let contributorName = "SPORTS DESK";

          if (contributorId && contributorsMap[contributorId]) {
            contributorName = contributorsMap[contributorId];
          }

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
            contributor: contributorName,
            category,
            time: getTimeAgo(post.date),
            slug: post.slug,
            contributorId: post.author,
          };
        });

        setArticles(formattedArticles);
      } catch (error) {
        console.error("Error fetching sports posts:", error);
        setArticles([]);
      } finally {
        setIsLoadingArticles(false);
      }
    };

    fetchSportsPosts();
  }, [contributorsMap]);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      router.push("/sports");
    }, 1500);
  };

  // Show loading state while waiting for contributors or articles
  if (isLoadingArticles || Object.keys(contributorsMap).length === 0) {
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

  // Empty state
  if (articles.length === 0) {
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
          <div className="px-4 md:px-0 py-10">
            <p className="text-[12px] uppercase tracking-widest text-black/40 md:text-white/40">
              No sports updates yet.
            </p>
            <div className="mt-4 h-[1px] w-16 bg-[#F26509]"></div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-white md:bg-transparent">
      <section className="mx-0 sm:mx-6 md:mx-8 lg:mx-16 pt-[24px] md:pt-0 md:mt-20">
        <div className="mb-4 md:mb-8 px-4 md:px-0">
          <p className="text-[12px] md:text-[12px] uppercase mb-1 tracking-widest text-black md:text-white/50">
            /// SPORTS
          </p>
          <p className="text-[14px] md:text-[16px] uppercase font-extrabold text-black md:text-white">
            Latest in the world of sports
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => router.push(`/${article.slug}`)}
            >
              <div className="w-full aspect-video overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = "/images/placeholder.jpg";
                    e.target.onerror = null;
                  }}
                />
              </div>

              <div className="p-4 md:p-6">
                <p className="text-sm md:text-[16px] font-bold text-black mb-2 truncate leading-tight line-clamp-2">
                  {article.title}
                </p>

                <div className="flex flex-row items-center gap-1">
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
            </div>
          ))}
        </div>

        <div className="bg-black py-4 md:py-0 flex justify-center md:mt-8 ">
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
