"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Editorial from "@/components/home/Editoral";
import Footer from "@/components/layout/Footer";
import Headline from "@/components/layout/Headline";
import ShareBar from "@/components/ui/ShareBar";
import Tags from "@/components/ui/Tags";

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug;
  const router = useRouter();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contributorsMap, setContributorsMap] = useState({});

  // Fetch contributors first
  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const contributorsResponse = await fetch(
          "https://staging.the49thstreet.com/wp-json/the49th/v1/contributors"
        );

        if (contributorsResponse.ok) {
          const contributors = await contributorsResponse.json();
          const contribMap = {};
          contributors.forEach((contributor) => {
            contribMap[contributor.id] = contributor.name;
          });
          setContributorsMap(contribMap);
        }
      } catch (error) {
        console.error("Error fetching contributors:", error);
      }
    };

    fetchContributors();
  }, []);

  // Decode HTML entities
  const decodeHtmlEntities = useCallback((text) => {
    if (typeof text !== "string") return text;
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  }, []);

  // Extract slug from WordPress URL
  const extractSlugFromUrl = useCallback((url) => {
    if (!url || typeof url !== "string") return null;

    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Remove trailing slash and get the last part
      const pathParts = pathname.replace(/\/$/, "").split("/");
      return pathParts[pathParts.length - 1];
    } catch (error) {
      // If URL parsing fails, try to extract slug manually
      const match = url.match(/\/([^\/]+)\/?$/);
      return match ? match[1] : null;
    }
  }, []);

  // Transform WordPress URLs to your new URL format
  const transformWordPressUrls = useCallback(
    (html) => {
      if (!html) return "";

      // Regex to match WordPress URLs from your staging site
      const wordPressUrlPattern =
        /https?:\/\/staging\.the49thstreet\.com\/([^\/\s]+)\/?/g;

      // Replace WordPress URLs with your new format
      return html.replace(
        /<a\s+(?:[^>]*?\s+)?href=["'](https?:\/\/staging\.the49thstreet\.com\/([^"'\s]+))["']([^>]*)>/gi,
        (match, fullUrl, path, attributes) => {
          // Extract the slug from the URL
          const slugFromUrl = extractSlugFromUrl(fullUrl);

          if (slugFromUrl) {
            // Transform to your new URL format
            const newUrl = `/${slugFromUrl}`;
            return `<a href="${newUrl}"${attributes}>`;
          }

          // If we can't extract slug, return original
          return match;
        },
      );
    },
    [extractSlugFromUrl],
  );

  // Process images in content - add custom classes, center them, and reduce size
  const processImagesInContent = useCallback(
    (html) => {
      if (!html) return "";

      // First transform URLs
      let processedHtml = transformWordPressUrls(html);

      // Then process images
      processedHtml = processedHtml.replace(
        /<img([^>]*?)>/g,
        (match, attributes) => {
          // Check if class already exists
          const hasClass = /class=["'][^"']*["']/.test(attributes);

          if (hasClass) {
            // Add to existing class
            return match.replace(
              /class=["']([^"']*)["']/,
              'class="$1 article-content-image"',
            );
          } else {
            // Add new class attribute
            return `<img${attributes} class="article-content-image" loading="lazy" onerror="this.src='/images/placeholder.jpg'; this.onerror=null;" />`;
          }
        },
      );

      // Wrap images in centering divs if they're not already in figures
      processedHtml = processedHtml.replace(
        /<img([^>]*?)class="article-content-image"([^>]*?)>/g,
        (match, attrs1, attrs2) => {
          // Check if image is already wrapped in a figure or div
          const prevChar = match.charAt(-1);
          const nextChar = match.charAt(1);

          // Only wrap if not already in a figure
          if (!match.includes("<figure") && !match.includes("</figure>")) {
            return `<div class="image-wrapper"><img${attrs1}class="article-content-image"${attrs2}></div>`;
          }
          return match;
        },
      );

      return processedHtml;
    },
    [transformWordPressUrls],
  );

  // "Time ago" formatter
  const getTimeAgo = useCallback((dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now - postDate;
    const mins = Math.floor(diffInMs / (1000 * 60));
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (mins < 1) return "JUST NOW";
    if (mins < 60) return `${mins} MINS AGO`;
    if (hours < 24) return `${hours} HOURS AGO`;
    if (days < 30) return `${days} DAYS AGO`;
    if (months < 12) return `${months} MONTH${months > 1 ? "S" : ""} AGO`;
    return `${years} YEAR${years > 1 ? "S" : ""} AGO`;
  }, []);

  // Strip HTML for alt text
  const stripHtml = useCallback(
    (html) => {
      if (!html) return "";
      const decoded = decodeHtmlEntities(html);
      return decoded.replace(/<[^>]*>/g, "").trim();
    },
    [decodeHtmlEntities],
  );

  // Handle image errors for featured image
  const handleImageError = useCallback((e) => {
    e.target.src = "/images/placeholder.jpg";
  }, []);

  // Handle content image errors
  const handleContentImageError = useCallback((e) => {
    e.target.src = "/images/placeholder.jpg";
    e.target.onerror = null; // Prevent infinite loop
  }, []);

  // Add event listeners to content images after render
  useEffect(() => {
    if (!article) return;

    const addImageErrorHandlers = () => {
      const images = document.querySelectorAll(".article-content-image");
      images.forEach((img) => {
        img.onerror = null;
        img.onerror = handleContentImageError;

        if (!img.classList.contains("article-content-image")) {
          img.classList.add("article-content-image");
        }
      });
    };

    const timer = setTimeout(addImageErrorHandlers, 100);
    return () => clearTimeout(timer);
  }, [article, handleContentImageError]);

  // Handle link clicks for transformed URLs
  useEffect(() => {
    if (!article) return;

    const handleLinkClick = (e) => {
      const link = e.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");

      // Check if it's an internal transformed link (starts with /article/)
      if (href && href.startsWith("/article/")) {
        e.preventDefault();

        // Extract slug from the href
        const slugMatch = href.match(/^\/article\/([^\/]+)/);
        if (slugMatch && slugMatch[1]) {
          // Navigate to the article page
          router.push(href);
        }
      }
    };

    const articleElement = document.getElementById("article");
    if (articleElement) {
      articleElement.addEventListener("click", handleLinkClick);
    }

    return () => {
      if (articleElement) {
        articleElement.removeEventListener("click", handleLinkClick);
      }
    };
  }, [article, router]);

  // Fetch article data after contributors are loaded
  useEffect(() => {
    const fetchArticle = async () => {
      if (Object.keys(contributorsMap).length === 0) return; // Wait for contributors

      try {
        setLoading(true);
        setError(null);

        // Fast load from sessionStorage
        if (typeof window !== "undefined") {
          const stored = sessionStorage.getItem("currentArticle");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed && parsed.slug === slug) {
                // Convert stored article to use contributor instead of author if needed
                const formattedArticle = {
                  ...parsed,
                  contributor: parsed.author || parsed.contributor || "49TH STREET",
                  contributorId: parsed.contributorId || null
                };
                setArticle(formattedArticle);
                sessionStorage.removeItem("currentArticle");
                setLoading(false);
                return;
              }
            } catch (parseError) {
              console.error("Error parsing stored article:", parseError);
              sessionStorage.removeItem("currentArticle");
            }
          }
        }

        console.log("Fetching article by slug:", slug);

        // Try direct slug match first
        let response = await fetch(
          `https://staging.the49thstreet.com/wp-json/wp/v2/posts?slug=${slug}&_embed=author,wp:featuredmedia,wp:term&per_page=1`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let posts = await response.json();

        // Fallback to search if slug doesn't match
        if (!posts || posts.length === 0) {
          const searchResponse = await fetch(
            `https://staging.the49thstreet.com/wp-json/wp/v2/posts?search=${encodeURIComponent(
              slug,
            )}&_embed=author,wp:featuredmedia,wp:term&per_page=1`,
          );

          if (!searchResponse.ok) {
            throw new Error(`HTTP error! status: ${searchResponse.status}`);
          }

          const searchData = await searchResponse.json();

          if (searchData.length === 0) {
            throw new Error("Article not found");
          }

          posts = searchData;
        }

        const post = posts[0];

        if (!post) {
          throw new Error("Article data is invalid");
        }

        const categories = post._embedded?.["wp:term"]?.[0] || [];
        const allTerms = post._embedded?.["wp:term"] || [];
        const tags = allTerms.find(term => term && term.length > 0 && term[0]?.taxonomy === 'post_tag') || [];
        const primaryCategory =
          categories.length > 0 ? categories[0].name.toUpperCase() : "NEWS";

        // Get contributor name from contributors map
        const contributorId = post.author;
        let contributorName = "49TH STREET"; // Default fallback
        
        if (contributorId && contributorsMap[contributorId]) {
          contributorName = contributorsMap[contributorId];
        }

        // Format article data
        const articleData = {
          id: post.id,
          slug: post.slug,
          title: decodeHtmlEntities(post.title.rendered),
          content: post.content.rendered,
          excerpt: post.excerpt?.rendered || "",
          image:
            post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
            "/images/placeholder.jpg",
          contributor: contributorName,
          contributorId: contributorId,
          date: new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          time: getTimeAgo(post.date),
          category: primaryCategory,
          tags: tags,
        };

        setArticle(articleData);
      } catch (err) {
        console.error("Error fetching article:", err);
        setError(err.message || "Failed to load article");
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug, decodeHtmlEntities, getTimeAgo, contributorsMap]);

  useEffect(() => {
    if (article && typeof document !== "undefined") {
      // Update Open Graph meta tags
      const updateMetaTags = () => {
        // Remove existing OG tags
        const existingTags = document.querySelectorAll('meta[property^="og:"]');
        existingTags.forEach(tag => tag.remove());

        // Create and add new OG tags
        const ogTags = [
          { property: "og:title", content: article.title },
          { property: "og:description", content: stripHtml(article.excerpt || article.content).substring(0, 160) },
          { property: "og:image", content: article.image },
          { property: "og:url", content: typeof window !== "undefined" ? window.location.href : "" },
          { property: "og:type", content: "article" },
          { property: "twitter:card", content: "summary_large_image" },
          { property: "twitter:title", content: article.title },
          { property: "twitter:description", content: stripHtml(article.excerpt || article.content).substring(0, 160) },
          { property: "twitter:image", content: article.image },
        ];

        ogTags.forEach(({ property, content }) => {
          if (content) {
            const meta = document.createElement("meta");
            meta.setAttribute("property", property);
            meta.setAttribute("content", content);
            document.head.appendChild(meta);
          }
        });

        // Also set document title
        document.title = `${article.title} | 49th Street`;
      };

      updateMetaTags();
    }
  }, [article, stripHtml]);

  // LOADING UI - show while waiting for contributors or article
  if (loading || Object.keys(contributorsMap).length === 0) {
    return (
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        <div className="px-0">
          <Headline />
        </div>

        <div className="px-0 sm:px-4 md:px-8 lg:px-12 xl:px-16 py-2">
          <div className="w-full h-[70vh] bg-gray-700 animate-pulse mb-6"></div>

          <div className="mx-2 md:mx-0 max-w-4xl mx-auto">
            <div className="h-4 bg-gray-700 w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-600 w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-600 w-1/2 mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  // ERROR UI
  if (error || !article) {
    return (
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        <div className="px-0 sm:px-4 md:px-8 lg:px-12 xl:px-16">
          <Headline />
        </div>

        <div className="mx-2 md:mx-auto max-w-4xl py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-400 mb-6">
            {error || "Sorry, the article could not be found."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors min-w-[120px]"
            >
              Go Back
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 border border-white text-white rounded-full hover:bg-white/10 transition-colors min-w-[120px]"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden w-full">
      {/* HEADER */}
      <div className="px-0">
        <Headline />
      </div>

      {/* MAIN CONTENT - Reduced width containers */}
      <div className="px-0 sm:px-4 md:px-8 lg:px-12 xl:px-16 py-2">
        {/* FEATURED IMAGE - Full width */}
        <div className="w-full h-[40vh] md:h-[85vh] -mt-2 relative mb-6 overflow-hidden">
          <img
            src={article.image}
            alt={stripHtml(article.title)}
            className="w-full h-full object-cover md:object-contain"
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* META */}
        <div className="mx-2 md:mx-auto max-w-4xl">
          <p className="uppercase text-[12px] md:text-[12px] text-white/50 mb-2">
            {"///"} {article.category}
          </p>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-4">
            <div className="flex-1">
              <h1 className="text-xl md:text-[40px] font-extrabold mb-4 md:mb-6 leading-tight">
                {stripHtml(article.title)}
              </h1>

              <p className="text-[12px] uppercase md:text-[12px] text-white/60 mb-6">
                {article.contributor?.toUpperCase()} • {article.date} •{" "}
                {article.time}
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT WITH STYLED IMAGES AND TRANSFORMED LINKS */}
        <div className="mx-2 md:mx-auto max-w-4xl mb-8">
          <div
            id="article"
            className="text-[14px] md:text-[16px] text-justify leading-relaxed font-[200] prose prose-invert max-w-none
            prose-headings:text-white prose-p:text-gray-300 prose-p:mb-6
            prose-ul:text-gray-300 prose-ol:text-gray-300 prose-li:mb-1
            prose-a:text-blue-400 hover:prose-a:underline prose-a:break-words
            prose-blockquote:text-gray-400 prose-blockquote:border-l-gray-600 prose-blockquote:pl-4 prose-blockquote:my-6
            prose-strong:text-white prose-em:text-gray-300
            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
            [&_.article-content-image]:my-6 [&_.article-content-image]:rounded
            [&_figure]:my-8 [&_figure]:text-center [&_figure]:max-w-full
            [&_figcaption]:text-center [&_figcaption]:text-gray-400 
            [&_figcaption]:text-sm [&_figcaption]:mt-2"
            dangerouslySetInnerHTML={{
              __html: processImagesInContent(article.content),
            }}
          />
          <ShareBar article={article} />
          <Tags tags={article.tags} currentArticleId={article.id} category={article.category} />
        </div>

        {/* RELATED CONTENT */}
        <div className="px-0 md:my-8">
          <Editorial />
        </div>

        {/* FOOTER */}
        <Footer />
      </div>
      {/* Inline styles for additional image control */}
      <style>{`
  #article p {
    padding-bottom: 1rem;
  }
  #article h3 {
    font-size: 25px;
  }

  #article a {
    text-decoration: underline;
    color: #F26509;
    cursor: pointer;
    transition: color 0.2s ease;
  }
  
  #article a:hover {
    color: #ff8c42;
  }
  
  /* Style for transformed WordPress links */
  #article a[href^="/article/"] {
    position: relative;
  }
  
  #article a[href^="/article/"]:after {
    content: " →";
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  
  #article a[href^="/article/"]:hover:after {
    opacity: 1;
    transform: translateX(2px);
  }
  
  /* Center images and make them full width like featured image */
  .image-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 2rem 0;
    width: 100%;
  }
  
  /* Content images - use contain to see entire image */
  .article-content-image {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: 85vh !important;
    object-fit: contain !important;
    border-radius: 0 !important;
    margin: 0 auto !important;
    display: block !important;
  }
  
  /* Featured image styling */
  .featured-image {
    width: 100%;
    height: 85vh;
    object-fit: cover;
  }
  
  /* Default mobile - full width images */
  .article-content-image {
    width: 100% !important;
    height: auto;
    max-height: 85vh;
    object-fit: contain !important;
  }
  
  /* Tablet and up - maintain full width */
  @media (min-width: 640px) {
    .article-content-image {
      width: 100% !important;
      max-width: 100% !important;
      height: auto;
      max-height: 85vh;
      object-fit: contain !important;
    }
  }
  
  /* Desktop - full width images */
  @media (min-width: 768px) {
    .article-content-image {
      width: 100% !important;
      max-width: 100% !important;
      height: auto;
      max-height: 85vh;
      object-fit: contain !important;
    }
  }
  
  /* Large desktop - maintain full width */
  @media (min-width: 1024px) {
    .article-content-image {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      max-height: 85vh !important;
      object-fit: contain !important;
    }
  }
  
  /* Keep figure images centered and full width */
  #article figure {
    text-align: center;
    margin: 2rem 0;
    width: 100%;
  }
  
  #article figure img {
    width: 100% !important;
    max-width: 100% !important;
    height: auto;
    max-height: 85vh;
    margin: 0 auto;
    object-fit: contain !important;
  }
  
  /* Image hover effect - optional, you can remove if not needed */
  .article-content-image:hover {
    transform: scale(1.01);
    opacity: 0.95;
  }

  /* Caption styling */
  .image-wrapper + p,
  .article-content-image + p,
  #article figure + p,
  #article figure figcaption {
    text-align: center;
    font-size: 0.875rem;
    color: #9CA3AF;
    margin-top: 0.5rem;
    margin-bottom: 1.5rem;
    font-style: italic;
    width: 100%;
  }
  
  /* Remove any conflicting margin/padding */
  #article .article-content-image {
    margin: 2rem auto !important;
    padding: 0 !important;
  }
  
  /* Ensure images inside content div are full width */
  #article > div > img,
  #article > img,
  #article .wp-block-image img,
  #article .wp-image img {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: 85vh !important;
    object-fit: contain !important;
  }
  
  /* Optional: If you want a background for images with aspect ratio different from container */
  .article-content-image {
    background-color: #1a1a1a;
  }
`}</style>
    </div>
  );
}