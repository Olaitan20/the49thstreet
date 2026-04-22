"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { wpFetch } from "@/lib/wordpress";

export default function Editorial() {
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

  // Decode HTML entities
  const decodeHtmlEntities = (text) => {
    if (typeof text !== "string") return text;
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
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

  // Fetch 49th-exclusive category posts after contributors are loaded
  useEffect(() => {
    const fetchExclusivePosts = async () => {
      if (Object.keys(contributorsMap).length === 0) return;

      try {
        setIsLoadingArticles(true);

        let posts = [];

        // Try 49th-exclusive category first
        try {
          const categories = await wpFetch(
            "/wp/v2/categories?slug=49th-exclusive",
          );
          if (categories.length > 0) {
            const categoryId = categories[0].id;
            posts = await wpFetch(
              `/wp/v2/posts?_embed=author,wp:featuredmedia,wp:term&categories=${categoryId}&per_page=3&orderby=date&order=desc`,
            );
          }
        } catch (e) {
          console.error("Error fetching exclusive category:", e);
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

        const formatted = posts.map((post) => {
          const featuredImage =
            post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
            "/images/placeholder.jpg";

          const contributorId = post.author;
          let contributorName = "49TH STREET";

          if (contributorId && contributorsMap[contributorId]) {
            contributorName = contributorsMap[contributorId];
          }

          const categories = post._embedded?.["wp:term"]?.[0] || [];
          const category =
            categories.length > 0
              ? categories[0].name.toUpperCase()
              : "EXCLUSIVE";

          return {
            id: post.id,
            image: featuredImage,
            title: decodeHtmlEntities(post.title.rendered),
            contributor: contributorName,
            category,
            time: getTimeAgo(post.date),
            slug: post.slug,
            contributorId: post.author,
          };
        });

        setArticles(formatted);
      } catch (error) {
        console.error(error);
        setArticles([]);
      } finally {
        setIsLoadingArticles(false);
      }
    };

    fetchExclusivePosts();
  }, [contributorsMap]);

  // See all handler
  const handleSeeAll = () => {
    setLoading(true);
    setTimeout(() => router.push("/news"), 1500);
  };

  // Loading State UI
  if (isLoadingArticles || Object.keys(contributorsMap).length === 0) {
    return (
      <div className="bg-white md:bg-transparent">
        <section className="mx-0 sm:mx-6 md:mx-8 lg:mx-16 pt-[24px] md:pt-0 md:mt-20">
          {/* Header loading */}
          <div className="mb-4 md:mb-8 px-4 md:px-0 flex items-center justify-between">
            <div>
              <p className="text-[12px] uppercase mb-1 tracking-widest text-black md:text-white/50">
                /// More Articles
              </p>
              <p className="text-[14px] md:text-[16px] uppercase font-extrabold text-black md:text-white">
                FRESH OFF THE PRESS
              </p>
            </div>

            <button className="flex items-center justify-center gap-2 text-[12px] md:text-[14px] font-semibold text-white bg-black border border-black rounded-full px-4 py-1.5 opacity-60">
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Loading...
            </button>
          </div>

          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 px-4 md:px-0 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="transition cursor-pointer group flex items-center animate-pulse"
              >
                <div className="w-24 h-24 bg-gray-700"></div>
                <div className="ml-4 flex flex-col justify-between flex-1">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-600 w-full"></div>
                    <div className="h-4 bg-gray-600 w-3/4"></div>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
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

  // Empty state
  if (articles.length === 0) {
    return (
      <div className="bg-white md:bg-transparent">
        <section className="mx-0 sm:mx-6 md:mx-8 lg:mx-16 pt-[24px] md:pt-0 md:mt-20">
          <div className="mb-4 md:mb-8 px-4 md:px-0">
            <p className="text-[12px] uppercase mb-1 tracking-widest text-black md:text-white/50">
              /// More Articles
            </p>
            <p className="text-[14px] md:text-[16px] uppercase font-extrabold text-black md:text-white">
              FRESH OFF THE PRESS
            </p>
          </div>
          <div className="px-4 md:px-0 py-10">
            <p className="text-[12px] uppercase tracking-widest text-black/40 md:text-white/40">
              New editorials coming soon.
            </p>
            <div className="mt-4 h-[1px] w-16 bg-[#F26509]"></div>
          </div>
        </section>
      </div>
    );
  }

  // MAIN RENDER
  return (
    <div className="bg-white md:bg-transparent">
      <section className="mx-0 sm:mx-6 md:mx-8 lg:mx-16 py-[24px] md:pt-0 md:mb-10 md:mt">
        {/* Header */}
        <div className="mb-4 md:mb-8 px-4 md:px-0 flex items-center justify-between">
          <div>
            <p className="text-[12px]  uppercase mb-1 tracking-widest text-black md:text-white/50">
              /// More Articles
            </p>
            <p className="text-[14px] md:text-[16px] uppercase font-extrabold text-black md:text-white">
              FRESH OFF THE PRESS
            </p>
          </div>

          <button
            onClick={handleSeeAll}
            disabled={loading}
            className="flex items-center justify-center gap-2 text-[12px] md:text-[14px]  text-white bg-black border border-black rounded-full px-4 py-1.5 disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Loading...
              </>
            ) : (
              "See All"
            )}
          </button>
        </div>

        {/* Article Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 px-4 md:px-0 lg:grid-cols-3 gap-4 md:gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="transition cursor-pointer group flex items-center hover:opacity-80"
              onClick={() => router.push(`/${article.slug}`)}
            >
              <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="ml-4 flex flex-col justify-between">
                <p className="text-[14px]  font-bold text-black md:text-white leading-tight line-clamp-2">
                  {article.title}
                </p>

                <div className="mt-4 flex items-center flex-wrap gap-1 text-[12px] text-black/60 md:text-white/60">
                  <span>{article.contributor?.toUpperCase()}</span>
                  <span>•</span>
                  <span>{article.category}</span>
                  <span>•</span>
                  <span>{article.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
