"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Editorial from "@/components/home/Editoral";
import Footer from "@/components/layout/Footer";
import Headline from "@/components/layout/Headline";

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug;
  const router = useRouter();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const transformWordPressUrls = useCallback((html) => {
    if (!html) return "";
    
    // Regex to match WordPress URLs from your staging site
    const wordPressUrlPattern = /https?:\/\/staging\.the49thstreet\.com\/([^\/\s]+)\/?/g;
    
    // Replace WordPress URLs with your new format
    return html.replace(
      /<a\s+(?:[^>]*?\s+)?href=["'](https?:\/\/staging\.the49thstreet\.com\/([^"'\s]+))["']([^>]*)>/gi,
      (match, fullUrl, path, attributes) => {
        // Extract the slug from the URL
        const slugFromUrl = extractSlugFromUrl(fullUrl);
        
        if (slugFromUrl) {
          // Transform to your new URL format
          const newUrl = `/article/${slugFromUrl}`;
          return `<a href="${newUrl}"${attributes}>`;
        }
        
        // If we can't extract slug, return original
        return match;
      }
    );
  }, [extractSlugFromUrl]);

  // Process images in content - add custom classes and handle errors
  const processImagesInContent = useCallback((html) => {
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
            'class="$1 article-content-image"'
          );
        } else {
          // Add new class attribute
          return `<img${attributes} class="article-content-image" loading="lazy" onerror="this.src='/images/placeholder.jpg'; this.onerror=null;" />`;
        }
      }
    );
    
    return processedHtml;
  }, [transformWordPressUrls]);

  // "Time ago" formatter
  const getTimeAgo = useCallback((dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now - postDate;
    const mins = Math.floor(diffInMs / (1000 * 60));
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return "JUST NOW";
    if (mins < 60) return `${mins} MINS AGO`;
    if (hours < 24) return `${hours} HOURS AGO`;
    if (days < 7) return `${days} DAYS AGO`;
    return `${Math.floor(days / 7)} WEEKS AGO`;
  }, []);

  // Strip HTML for alt text
  const stripHtml = useCallback((html) => {
    if (!html) return "";
    const decoded = decodeHtmlEntities(html);
    return decoded.replace(/<[^>]*>/g, "").trim();
  }, [decodeHtmlEntities]);

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
      images.forEach(img => {
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
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      
      // Check if it's an internal transformed link (starts with /article/)
      if (href && href.startsWith('/article/')) {
        e.preventDefault();
        
        // Extract slug from the href
        const slugMatch = href.match(/^\/article\/([^\/]+)/);
        if (slugMatch && slugMatch[1]) {
          // Navigate to the article page
          router.push(href);
        }
      }
    };

    const articleElement = document.getElementById('article');
    if (articleElement) {
      articleElement.addEventListener('click', handleLinkClick);
    }

    return () => {
      if (articleElement) {
        articleElement.removeEventListener('click', handleLinkClick);
      }
    };
  }, [article, router]);

  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
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
                setArticle(parsed);
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
          `https://staging.the49thstreet.com/wp-json/wp/v2/posts?slug=${slug}&_embed&per_page=1`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let posts = await response.json();

        // Fallback to search if slug doesn't match
        if (!posts || posts.length === 0) {
          const searchResponse = await fetch(
            `https://staging.the49thstreet.com/wp-json/wp/v2/posts?search=${encodeURIComponent(slug)}&_embed&per_page=1`
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
        const primaryCategory = categories.length > 0 
          ? categories[0].name.toUpperCase() 
          : "NEWS";

        // Format article data
        const articleData = {
          id: post.id,
          slug: post.slug,
          title: decodeHtmlEntities(post.title.rendered),
          content: post.content.rendered,
          excerpt: post.excerpt?.rendered || "",
          image: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || 
                 "/images/placeholder.jpg",
          author: post._embedded?.author?.[0]?.name || "49TH STREET",
          date: new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          time: getTimeAgo(post.date),
          category: primaryCategory,
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
  }, [slug, decodeHtmlEntities, getTimeAgo]);

  // LOADING UI
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        <div className="px-0">
          <Headline />
        </div>

        <div className="px-0 sm:px-6 md:px-8 lg:px-16 py-2">
          <div className="w-full h-[70vh] bg-gray-700 animate-pulse mb-6"></div>

          <div className="mx-4 md:mx-0">
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
        <div className="px-0 sm:px-6 md:px-8 lg:px-16">
          <Headline />
        </div>

        <div className="mx-4 md:mx-12 lg:mx-16 py-8 text-center">
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

      {/* MAIN CONTENT */}
      <div className="px-0 sm:px-6 md:px-8 lg:px-16 py-2">
        {/* FEATURED IMAGE */}
        <div className="w-full h-[60vh] md:h-[85vh] -mt-2 relative mb-6 overflow-hidden">
          <img
            src={article.image}
            alt={stripHtml(article.title)}
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* META */}
        <div className="mx-4 md:mx-0">
          <p className="uppercase text-[12px] md:text-[12px] text-white/50 mb-2">
            {"///"} {article.category}
          </p>

          <h1 className="text-xl md:text-[40px] font-extrabold mb-4 md:mb-6 leading-tight">
            {stripHtml(article.title)}
          </h1>

          <p className="text-[12px] uppercase md:text-[12px] text-white/60 mb-6">
            {article.author} • {article.date} • {article.time}
          </p>
        </div>

        {/* CONTENT WITH STYLED IMAGES AND TRANSFORMED LINKS */}
        <div className="mx-4 md:mx-0 mb-8">
          <div
            id="article"
            className="text-[14px] md:text-[16px] text-justify leading-relaxed font-[200] prose prose-invert max-w-none
            prose-headings:text-white prose-p:text-gray-300 prose-p:mb-6
            prose-ul:text-gray-300 prose-ol:text-gray-300 prose-li:mb-1
            prose-a:text-blue-400 hover:prose-a:underline prose-a:break-words
            prose-blockquote:text-gray-400 prose-blockquote:border-l-gray-600 prose-blockquote:pl-4 prose-blockquote:my-6
            prose-strong:text-white prose-em:text-gray-300
            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
            [&_.article-content-image]:w-full [&_.article-content-image]:h-auto 
            [&_.article-content-image]:my-6 [&_.article-content-image]:rounded-lg 
            [&_.article-content-image]:max-w-full [&_.article-content-image]:object-contain
            [&_.article-content-image]:mx-auto [&_.article-content-image]:block
            [&_figure]:my-8 [&_figure]:mx-auto [&_figure]:max-w-full
            [&_figcaption]:text-center [&_figcaption]:text-gray-400 
            [&_figcaption]:text-sm [&_figcaption]:mt-2"
            dangerouslySetInnerHTML={{
              __html: processImagesInContent(article.content),
            }}
          />
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
        
        /* Additional styling for article content images */
        .article-content-image {
          transition: transform 0.3s ease, opacity 0.3s ease;
          max-width: 100%;
          height: auto;
        }
        
        .article-content-image:hover {
          transform: scale(1.01);
          opacity: 0.95;
        }
        
        /* Responsive image sizing */
        @media (min-width: 640px) {
          .article-content-image {
            max-width: 90% !important;
          }
        }
        
        @media (min-width: 768px) {
          .article-content-image {
            max-width: 80% !important;
          }
        }
        
        @media (min-width: 1024px) {
          .article-content-image {
            max-width: 70% !important;
          }
        }
        
        @media (min-width: 1280px) {
          .article-content-image {
            max-width: 60% !important;
          }
        }
      `}</style>
    </div>
  );
}