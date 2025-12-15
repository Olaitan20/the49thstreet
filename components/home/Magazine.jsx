"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Magazine() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [magazines, setMagazines] = useState([]);
  const [isLoadingMagazines, setIsLoadingMagazines] = useState(true);
  const [page, setPage] = useState(1);
  const [uncvrCategoryId, setUncvrCategoryId] = useState(null);

  // Function to calculate time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now - postDate;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) {
      return `${diffInMins} mins ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hrs ago`;
    } else {
      return `${diffInDays} days ago`;
    }
  };

  // Fetch uncvr category ID
  useEffect(() => {
    const fetchUncvrCategory = async () => {
      try {
        // First, try to find the uncovr category by exact slug
        const uncvrCategoryResponse = await fetch(
          "https://staging.the49thstreet.com/wp-json/wp/v2/categories?slug=uncovr"
        );

        if (!uncvrCategoryResponse.ok) {
          throw new Error("Failed to fetch categories");
        }

        const uncvrCategories = await uncvrCategoryResponse.json();
        let category = uncvrCategories.length > 0 ? uncvrCategories[0] : null;

        // If not found by exact slug, try to search in all categories
        if (!category) {
          const allCategoriesResponse = await fetch(
            "https://staging.the49thstreet.com/wp-json/wp/v2/categories"
          );

          if (allCategoriesResponse.ok) {
            const allCategories = await allCategoriesResponse.json();
            category = allCategories.find(
              (cat) =>
                cat.slug.toLowerCase().includes("uncovr") ||
                cat.name.toLowerCase().includes("uncovr") ||
                cat.slug.toLowerCase().includes("uncvr") ||
                cat.name.toLowerCase().includes("uncvr") ||
                cat.slug.toLowerCase().includes("magazine") ||
                cat.name.toLowerCase().includes("magazine")
            );
          }
        }

        if (category) {
          setUncvrCategoryId(category.id);
        }
      } catch (error) {
        console.error("Error fetching uncvr category:", error);
      }
    };

    fetchUncvrCategory();
  }, []);

  // Fetch uncvr posts
  const fetchUncvrPosts = async (pageNum = 1, append = false) => {
    try {
      setIsLoadingMagazines(true);
      let posts = [];

      // If we have the uncvr category ID, fetch its posts
      if (uncvrCategoryId) {
        const postsResponse = await fetch(
          `https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed&categories=${uncvrCategoryId}&per_page=3&page=${pageNum}&orderby=date&order=desc`
        );

        if (postsResponse.ok) {
          posts = await postsResponse.json();
          
          // Check if there are more posts
          const totalPages = postsResponse.headers.get('X-WP-TotalPages');
          if (pageNum >= parseInt(totalPages || '1')) {
            // Reset to page 1 if we reached the end
            setPage(1);
          }
        }
      }

      // If no posts from uncvr category, get latest posts
      if (posts.length === 0) {
        const latestResponse = await fetch(
          `https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed&per_page=3&page=${pageNum}&orderby=date&order=desc`
        );

        if (latestResponse.ok) {
          posts = await latestResponse.json();
        }
      }

      // Format the magazines
      const formattedMagazines = posts.map((post, index) => {
        const featuredMedia = post._embedded?.["wp:featuredmedia"];
        let featuredImage = "/images/magazine.png";

        if (featuredMedia && featuredMedia[0]?.source_url) {
          featuredImage = featuredMedia[0].source_url;
        } else {
          const magazineImages = [
            "/images/magazine.png",
            "/images/magazine2.png",
            "/images/magazine.png",
          ];
          featuredImage = magazineImages[index % magazineImages.length];
        }

        // Format issue number
        const issueNumber = String(post.id).padStart(2, '0');
        
        return {
          id: post.id,
          src: featuredImage,
          title: post.title.rendered,
          issue: `#ISSUE ${issueNumber} ${getTimeAgo(post.date)}`,
          slug: post.slug,
          date: post.date,
        };
      });

      if (append && pageNum > 1) {
        // Append new magazines to existing ones
        setMagazines(prev => [...prev, ...formattedMagazines]);
        setCurrentIndex(prev => prev + 3);
      } else {
        // Replace with new magazines
        setMagazines(formattedMagazines);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error("Error fetching uncvr posts:", error);
      if (!append) {
        setMagazines(staticMagazines);
      }
    } finally {
      setIsLoadingMagazines(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (uncvrCategoryId !== null) {
      fetchUncvrPosts(1, false);
    }
  }, [uncvrCategoryId]);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      router.push("/orange-mag");
    }, 1500);
  };

  // Handle next/previous for mobile - cycle through current magazines
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % magazines.length);
  };
  
  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? magazines.length - 1 : prev - 1
    );
  };

  // Handle desktop arrows - fetch NEW magazines
  const handleDesktopNext = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUncvrPosts(nextPage, true);
  };

  const handleDesktopPrev = () => {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchUncvrPosts(prevPage, false);
    } else {
      // If on page 1, go to last page (circular navigation)
      fetchUncvrPosts(1, false);
    }
  };

  // Handle individual magazine click
  const handleMagazineClick = (slug) => {
    router.push(`/article/${slug}`);
  };

  const staticMagazines = [
    {
      id: 1,
      src: "/images/magazine.png",
      title: "Made Kuti",
      issue: "#ISSUE 05 56 mins ago",
      slug: "made-kuti-interview",
    },
    {
      id: 2,
      src: "/images/magazine2.png",
      title: "Tems",
      issue: "#ISSUE 06 2 hrs ago",
      slug: "tems-feature",
    },
    {
      id: 3,
      src: "/images/magazine.png",
      title: "Ayra Starr",
      issue: "#ISSUE 07 1 day ago",
      slug: "ayra-starr-profile",
    },
  ];

  const displayMagazines = magazines.length > 0 ? magazines : staticMagazines;

  if (isLoadingMagazines && magazines.length === 0) {
    return (
      <section className="mb-6 sm:mx-6 md:mx-8 lg:mx-16">
        {/* Header */}
        <div className="flex items-center justify-between py-6 px-4 md:px-0">
          <div>
            <p className="text-[12px] uppercase mb-2 tracking-widest text-white/50">
              /// UNCOVR
            </p>
            <p className="text-[16px] uppercase font-extrabold text-white">
              Read UNCOVR 
            </p>
          </div>
        </div>

        {/* Loading Skeleton */}
        <div className="hidden md:grid grid-cols-3 gap-0 mb-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-gray-700 animate-pulse">
              <div className="w-full h-[586px] bg-gray-600"></div>
              <div className="bg-black px-2 py-3 text-left">
                <div className="h-3 w-16 bg-gray-600 mb-2"></div>
                <div className="h-4 w-3/4 bg-gray-600 mb-2"></div>
                <div className="h-3 w-24 bg-gray-600"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile Loading Skeleton */}
        <div className="md:hidden">
          <div className="bg-gray-700 animate-pulse">
            <div className="w-full h-[420px] bg-gray-600"></div>
            <div className="bg-black py-3 px-4">
              <div className="h-3 w-16 bg-gray-600 mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-600 mb-2"></div>
              <div className="h-3 w-24 bg-gray-600 mb-4"></div>
              <div className="flex justify-end gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                <div className="w-8 h-8 rounded-full bg-gray-600"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6 sm:mx-6 md:mx-8 lg:mx-16">
      {/* Header */}
      <div className="flex items-center justify-between py-6 px-4 md:px-0">
        <div>
          <p className="text-[12px] uppercase mb-2 tracking-widest text-white/50">
            /// UNCOVR
          </p>
          <p className="text-[16px] uppercase font-extrabold text-white">
            Read UNCOVR
          </p>
        </div>

        {/* Desktop Arrows - NO LOADER */}
        {displayMagazines.length > 1 && (
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={handleDesktopPrev}
              className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="white"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleDesktopNext}
              className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="white"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ===== MOBILE VIEW (One image at a time) ===== */}
      <div className="md:hidden">
        {displayMagazines.length > 0 && (
          <div
            onClick={() => handleMagazineClick(displayMagazines[currentIndex].slug)}
            className="cursor-pointer group"
          >
            <div className="relative  h-[520px]  overflow-hidden">
              <img
                src={displayMagazines[currentIndex].src}
                alt={displayMagazines[currentIndex].title}
                className="w-full h-[57vh] object-cover  transform transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  const localImages = [
                    "/images/magazine.png",
                    "/images/magazine2.png",
                    "/images/magazine.png",
                  ];
                  const randomLocal = localImages[currentIndex % localImages.length];
                  e.target.src = randomLocal;
                  e.target.onerror = null;
                }}
              />
            </div>

            {/* Caption + mobile arrows */}
            <div className="bg-black py-3 px-4 flex justify-between items-center">
              <div>
                <p className="text-[12px] uppercase tracking-widest text-white/50">
                  // uncvr
                </p>
                <p className="text-[14px] font-bold  text-white mt-2">
                  {displayMagazines[currentIndex].title}
                </p>
                <p className="text-[12px] uppercase  text-white/60 mt-2 tracking-widest">
                  {displayMagazines[currentIndex].issue}
                </p>
                
              </div>

              {/* Mobile navigation buttons */}
              {displayMagazines.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                      stroke="white"
                      className="w-4 h-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                      stroke="white"
                      className="w-4 h-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== DESKTOP VIEW (All images side by side) ===== */}
      <div className="hidden md:grid grid-cols-3 gap-0 mb-6">
        {displayMagazines.slice(0, 3).map((mag, index) => (
          <div
            key={`${mag.id}-${index}`}
            onClick={() => handleMagazineClick(mag.slug)}
            className="cursor-pointer group"
          >
            <div className="relative w-full h-[586px] overflow-hidden">
              <img
                src={mag.src}
                alt={mag.title}
                className="w-fit h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  const localImages = [
                    "/images/magazine.png",
                    "/images/magazine2.png",
                    "/images/magazine.png",
                  ];
                  const randomLocal = localImages[index % localImages.length];
                  e.target.src = randomLocal;
                  e.target.onerror = null;
                }}
              />
            </div>
            <div className="bg-black px-2 py-3 text-left">
              <p className="text-[12px] uppercase tracking-widest text-white/50">
                // uncvr
              </p>
              <p className="text-[12px] font-bold text-white mt-1">
                {mag.title}
              </p>
              <p className="text-[12px] uppercase text-white/60 mt-1 tracking-widest">
                {mag.issue}
              </p>
              {/* Article Slug */}
              {/* <p className="text-[10px] text-white/40 mt-1">
                Slug: {mag.slug}
              </p> */}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
