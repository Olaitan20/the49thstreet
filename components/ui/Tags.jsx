"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Tags({ tags, currentArticleId, category }) {
  const router = useRouter();
  const [selectedTag, setSelectedTag] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Handle tag click
  const handleTagClick = async (tag) => {
    if (selectedTag && selectedTag.id === tag.id) {
      // If same tag clicked, collapse
      setSelectedTag(null);
      setRelatedArticles([]);
      return;
    }

    setSelectedTag(tag);
    setLoading(true);

    try {
      // Fetch articles with this tag
      const postsResponse = await fetch(
        `https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed=author,wp:featuredmedia&tags=${tag.id}&per_page=6&orderby=date&order=desc`,
      );

      if (postsResponse.ok) {
        const posts = await postsResponse.json();

        // Filter out current article
        const filteredPosts = posts.filter(
          (post) => post.id !== currentArticleId,
        );

        const formatted = filteredPosts.map((post) => {
          const featuredImage =
            post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
            "/images/placeholder.jpg";

          const author = post._embedded?.author?.[0]?.name || "49TH STREET";
          const categories = post._embedded?.["wp:term"]?.[0] || [];
          const category =
            categories.length > 0 ? categories[0].name.toUpperCase() : "NEWS";

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

        setRelatedArticles(formatted);
      }
    } catch (error) {
      console.error("Error fetching related articles:", error);
      setRelatedArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle article click
  const handleArticleClick = (slug) => {
    router.push(`/${slug}`);
  };

  if (!tags || tags.length === 0) return null;

  return (
    <div className="mb-8">
      {/* TAGS */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map((tag, index) => (
          <button
            key={tag.id || index}
            onClick={() => handleTagClick(tag)}
            className={`text-[10px] md:text-[11px] uppercase px-3 py-1 rounded-full transition-colors border ${
              selectedTag && selectedTag.id === tag.id
                ? "bg-orange-500 text-black border-orange-500"
                : "bg-transparent text-orange-400 border-orange-400 hover:bg-orange-400 hover:text-black"
            }`}
          >
            #{tag.name}
          </button>
        ))}
      </div>

      {/* RELATED ARTICLES */}
      {selectedTag && (
        <div className="border-t border-white/10 pt-6">
          <h3 className="text-lg font-bold mb-4 text-white">
            More in #{selectedTag.name}
          </h3>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="w-full h-32 bg-gray-700 mb-3"></div>
                  <div className="h-4 bg-gray-600 w-full mb-2"></div>
                  <div className="h-3 bg-gray-600 w-3/4"></div>
                </div>
              ))}
            </div>
          ) : relatedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedArticles.map((article) => (
                <div
                  key={article.id}
                  className="cursor-pointer group"
                  onClick={() => handleArticleClick(article.slug)}
                >
                  <div className="relative overflow-hidden mb-3">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "/images/placeholder.jpg";
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-white/50">
                      {article.category}
                    </p>
                    <h4 className="text-sm font-bold leading-tight line-clamp-2 group-hover:text-orange-400 transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-[10px] text-white/60 uppercase">
                      {article.author} • {article.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-sm">
              No other articles found with this tag.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
