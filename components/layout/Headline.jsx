"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Headline() {
  const containerRef = useRef(null);
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch latest posts from WordPress API
  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Fetching latest news for headline...");

        const response = await fetch(
          "https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed=author,wp:featuredmedia,wp:term&per_page=5&orderby=date&order=desc",
        );

        if (!response.ok) {
          throw new Error("Failed to fetch latest news");
        }

        const posts = await response.json();
        console.log("✅ Latest posts found:", posts.length);

        // Transform posts to headlines
        const formattedHeadlines = posts.map((post) => {
          // Get the first category
          const categories = post._embedded?.["wp:term"]?.[0] || [];
          const category =
            categories.length > 0 ? categories[0].name.toUpperCase() : "NEWS";

          // Decode HTML entities and clean title
          const title = post.title.rendered
            .replace(/<[^>]*>/g, "") // Remove HTML tags
            .replace(/&[^;]+;/g, "") // Remove HTML entities
            .trim();

          return `${category}: ${title}`;
        });

        console.log("✅ Formatted headlines:", formattedHeadlines);
        setHeadlines(formattedHeadlines);
      } catch (error) {
        console.error("❌ Error fetching headlines:", error);
        setError(error.message);
        // Fallback to static headlines
        setHeadlines([
          "FAVE REACHES NUMBER 1 ON UGANDA CHARTS",
          "BURNA BOY PULLS 20K AS HE SHUTS DOWN FRANCE",
          "REMA SET TO RELEASE DEBUT ALBUM 'RAVES AND ROSES'",
          "DAVIDO ANNOUNCES WORLD TOUR 2025",
          "AYRA STARR WINS BEST FEMALE ARTIST IN AFRICA",
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestNews();
  }, []);

  // Setup marquee animation
  useEffect(() => {
    const container = containerRef.current;
    if (container && headlines.length > 0) {
      // Clear existing content
      container.innerHTML = "";

      // Create the marquee content
      const content = headlines
        .map(
          (headline, i) =>
            `<span class="flex items-center gap-3">
          ${headline}
          ${i !== headlines.length - 1 ? '<span class="text-black">•</span>' : ""}
        </span>`,
        )
        .join("");

      // Duplicate content for seamless loop
      container.innerHTML = content + content;
    }
  }, [headlines]);

  // Loading state
  if (loading) {
    return (
      <div className="relative bg-[#F2F2F2] mx-0 sm:mx-6 md:mx-8 lg:mx-16 text-black text-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center py-3">
          {/* Label: What's Hot? */}
          <div className="absolute left-0 top-0 h-full flex items-center gap-1 px-3 bg-gray-100 z-10">
            <Image
              src="/icons/fire.png"
              alt="Fire Icon"
              width={20}
              height={20}
            />
            <p className="uppercase text-xs font-bold">What's Hot?</p>
          </div>

          {/* Loading skeleton */}
          <div className="flex gap-6 text-xs font-normal text-gray-600 whitespace-nowrap pl-28 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-48"></div>
            <span className="text-black">•</span>
            <div className="h-4 bg-gray-300 rounded w-40"></div>
            <span className="text-black">•</span>
            <div className="h-4 bg-gray-300 rounded w-52"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[#F2F2F2] mx-0 sm:mx-6 md:mx-8 lg:mx-16 text-black text-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center py-3">
        {/* Label: What's Hot? */}
        <div className="absolute left-0 top-0 h-full flex items-center gap-1 px-3 bg-gray-100 z-10">
          <Image src="/icons/fire.png" alt="Fire Icon" width={20} height={20} />
          <p className="uppercase text-xs font-bold">What's Hot?</p>
        </div>

        {/* Marquee Content */}
        <div
          ref={containerRef}
          className="flex gap-6 text-[12px] font-normal text-gray-600 marquee whitespace-nowrap pl-28"
        >
          {/* Content is populated via useEffect */}
        </div>
      </div>

      {/* Error message (hidden but logged) */}
      {error && (
        <div style={{ display: "none" }}>Error loading headlines: {error}</div>
      )}
    </div>
  );
}
