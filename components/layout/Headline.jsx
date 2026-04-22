"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { wpFetch } from "@/lib/wordpress";

export default function Headline() {
  const containerRef = useRef(null);
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  // Fetch latest posts from WordPress API
  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        setLoading(true);

        const posts = await wpFetch(
          "/wp/v2/posts?_embed=author,wp:featuredmedia,wp:term&per_page=5&orderby=date&order=desc",
        );

        // Transform posts to headlines
        const formattedHeadlines = posts.map((post) => {
          const categories = post._embedded?.["wp:term"]?.[0] || [];
          const category =
            categories.length > 0 ? categories[0].name.toUpperCase() : "NEWS";

          const title = post.title.rendered
            .replace(/<[^>]*>/g, "")
            .replace(/&[^;]+;/g, "")
            .trim();

          return `${category}: ${title}`;
        });

        if (formattedHeadlines.length > 0) {
          setHeadlines(formattedHeadlines);
        } else {
          setFailed(true);
        }
      } catch (error) {
        console.error("Error fetching headlines:", error);
        setFailed(true);
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
      container.innerHTML = "";

      const content = headlines
        .map(
          (headline, i) =>
            `<span class="flex items-center gap-3">
          ${headline}
          ${i !== headlines.length - 1 ? '<span class="text-black">•</span>' : ""}
        </span>`,
        )
        .join("");

      container.innerHTML = content + content;
    }
  }, [headlines]);

  // Render nothing on failure or no data
  if (failed || (!loading && headlines.length === 0)) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="relative bg-[#F2F2F2] mx-0 sm:mx-6 md:mx-8 lg:mx-16 text-black text-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center py-3">
          <div className="absolute left-0 top-0 h-full flex items-center gap-1 px-3 bg-gray-100 z-10">
            <Image
              src="/icons/fire.png"
              alt="Fire Icon"
              width={20}
              height={20}
            />
            <p className="uppercase text-xs font-bold">What's Hot?</p>
          </div>

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
        <div className="absolute left-0 top-0 h-full flex items-center gap-1 px-3 bg-gray-100 z-10">
          <Image src="/icons/fire.png" alt="Fire Icon" width={20} height={20} />
          <p className="uppercase text-xs font-bold">What's Hot?</p>
        </div>

        <div
          ref={containerRef}
          className="flex gap-6 text-[12px] font-normal text-gray-600 marquee whitespace-nowrap pl-28"
        >
          {/* Content is populated via useEffect */}
        </div>
      </div>
    </div>
  );
}
