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
  const [totalPages, setTotalPages] = useState(1);
  const [uncvrCategoryId, setUncvrCategoryId] = useState(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if desktop on mount and resize
  useEffect(() => {
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkIfDesktop();
    window.addEventListener("resize", checkIfDesktop);
    return () => window.removeEventListener("resize", checkIfDesktop);
  }, []);

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
      return `${diffInMins} mins ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hrs ago`;
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
    } else {
      return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
    }
  };

  // Fetch uncvr category ID
  useEffect(() => {
    const fetchUncvrCategory = async () => {
      try {
        const uncvrCategoryResponse = await fetch(
          "https://staging.the49thstreet.com/wp-json/wp/v2/categories?slug=uncovr",
        );

        if (!uncvrCategoryResponse.ok) {
          throw new Error("Failed to fetch categories");
        }

        const uncvrCategories = await uncvrCategoryResponse.json();
        let category = uncvrCategories.length > 0 ? uncvrCategories[0] : null;

        if (!category) {
          const allCategoriesResponse = await fetch(
            "https://staging.the49thstreet.com/wp-json/wp/v2/categories",
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
                cat.name.toLowerCase().includes("magazine"),
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

  // Fetch uncvr posts with proper pagination
  const fetchUncvrPosts = async (pageNum = 1) => {
    try {
      setIsLoadingMagazines(true);
      let posts = [];
      let totalPages = 1;

      // Fetch 8 posts for carousel
      const perPage = 8;

      if (uncvrCategoryId) {
        const postsResponse = await fetch(
          `https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed=author,wp:featuredmedia,wp:term&categories=${uncvrCategoryId}&per_page=${perPage}&page=${pageNum}&orderby=date&order=desc`,
        );

        if (postsResponse.ok) {
          posts = await postsResponse.json();

          const totalPagesHeader = postsResponse.headers.get("X-WP-TotalPages");
          totalPages = totalPagesHeader ? parseInt(totalPagesHeader) : 1;
          setTotalPages(totalPages);
        }
      }

      if (posts.length === 0) {
        const latestResponse = await fetch(
          `https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed=author,wp:featuredmedia,wp:term&per_page=${perPage}&page=${pageNum}&orderby=date&order=desc`,
        );

        if (latestResponse.ok) {
          posts = await latestResponse.json();

          const totalPagesHeader =
            latestResponse.headers.get("X-WP-TotalPages");
          totalPages = totalPagesHeader ? parseInt(totalPagesHeader) : 1;
          setTotalPages(totalPages);
        }
      }

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

        const issueNumber = String(post.id).padStart(2, "0");

        return {
          id: post.id,
          src: featuredImage,
          title: post.title.rendered,
          issue: `#ISSUE ${issueNumber} ${getTimeAgo(post.date)}`,
          slug: post.slug,
          date: post.date,
        };
      });

      setMagazines(formattedMagazines);
      setPage(pageNum);
      setCurrentIndex(0); // Reset to first item when fetching new page
    } catch (error) {
      console.error("Error fetching uncvr posts:", error);
      setMagazines(staticMagazines);
    } finally {
      setIsLoadingMagazines(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (uncvrCategoryId !== null) {
      fetchUncvrPosts(1);
    }
  }, [uncvrCategoryId]);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      router.push("/orange-mag");
    }, 1500);
  };

  // Handle next/previous for carousel
  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === displayMagazines.slice(0, 8).length - 1 ? 0 : prev + 1,
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? displayMagazines.slice(0, 8).length - 1 : prev - 1,
    );
  };

  // Handle individual magazine click
  const handleMagazineClick = (slug) => {
    router.push(`/${slug}`);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    }

    if (isRightSwipe) {
      handlePrev();
    }

    setTouchStart(0);
    setTouchEnd(0);
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
    {
      id: 4,
      src: "/images/magazine2.png",
      title: "Burna Boy",
      issue: "#ISSUE 08 2 days ago",
      slug: "burna-boy-feature",
    },
    {
      id: 5,
      src: "/images/magazine.png",
      title: "Wizkid",
      issue: "#ISSUE 09 3 days ago",
      slug: "wizkid-interview",
    },
    {
      id: 6,
      src: "/images/magazine2.png",
      title: "Davido",
      issue: "#ISSUE 10 4 days ago",
      slug: "davido-profile",
    },
    {
      id: 7,
      src: "/images/magazine.png",
      title: "Asake",
      issue: "#ISSUE 11 5 days ago",
      slug: "asake-feature",
    },
    {
      id: 8,
      src: "/images/magazine2.png",
      title: "Rema",
      issue: "#ISSUE 12 6 days ago",
      slug: "rema-interview",
    },
  ];

  const displayMagazines = magazines.length > 0 ? magazines : staticMagazines;
  const visibleMagazines = displayMagazines.slice(0, 8);

  if (isLoadingMagazines && magazines.length === 0) {
    return (
      <section className="mb-6 sm:mx-6 md:mx-8 lg:mx-16">
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
        <div className="relative w-full h-[300px] overflow-hidden">
          <div className="w-full h-full bg-gray-700 animate-pulse"></div>
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

        {/* Desktop Arrows - shown on all screen sizes */}
        {visibleMagazines.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoadingMagazines}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="white"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoadingMagazines}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="white"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ===== HORIZONTAL CAROUSEL (Same for mobile and desktop) ===== */}
      <div className="relative overflow-hidden">
        {/* Carousel Container */}
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {visibleMagazines.map((mag, index) => (
            <div key={`${mag.id}-${index}`} className="w-full flex-shrink-0">
              <div
                onClick={() => handleMagazineClick(mag.slug)}
                className="cursor-pointer group mx-1"
              >
                <div 
                  className={`relative w-full overflow-hidden ${
                    isDesktop ? 'h-[586px]' : 'h-64'
                  }`}
                >
                  <img
                    src={mag.src}
                    alt={mag.title}
                    className="w-full h-full object-contain transform transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      const localImages = [
                        "/images/magazine.png",
                        "/images/magazine2.png",
                        "/images/magazine.png",
                      ];
                      const randomLocal =
                        localImages[index % localImages.length];
                      e.target.src = randomLocal;
                      e.target.onerror = null;
                    }}
                  />
                </div>

                {/* Caption */}
                <div className="bg-black text-center py-3 px-4">
                  <div>
                    <p className="text-[12px] uppercase tracking-widest text-white/50">
                      // uncvr
                    </p>
                    <p className={`font-bold text-white mt-2 ${
                      isDesktop ? 'text-[16px]' : 'text-[14px]'
                    }`}>
                      {mag.title}
                    </p>
                    {/* Uncomment if you want issue text */}
                    {/* <p className="text-[12px] uppercase text-white/60 mt-2 tracking-widest">
                      {mag.issue}
                    </p> */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Navigation Buttons (hidden on desktop) */}
        {visibleMagazines.length > 1 && !isDesktop && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full border border-white/20 bg-black/50 hover:bg-black/70 transition z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="white"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full border border-white/20 bg-black/50 hover:bg-black/70 transition z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="white"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {visibleMagazines.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {visibleMagazines.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentIndex ? "bg-white" : "bg-white/40"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}