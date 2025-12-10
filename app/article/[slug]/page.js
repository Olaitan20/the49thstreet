"use client";
import { useState, useEffect } from "react";
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
  const decodeHtmlEntities = (text) => {
    if (typeof text !== "string") return text;
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  };

  const removeImagesFromContent = (html) => {
    if (!html) return "";
    return html.replace(/<img[^>]*>/g, ""); 
  };

  // "Time ago" formatter
  const getTimeAgo = (dateString) => {
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
  };

  // Strip HTML for alt text
  const stripHtml = (html) => {
    if (!html) return "";
    const decoded = decodeHtmlEntities(html);
    return decoded.replace(/<[^>]*>/g, "").trim();
  };

  const handleImageError = (e) => {
    e.target.src = "/images/placeholder.jpg";
  };

  
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fast load from sessionStorage
        if (typeof window !== "undefined") {
          const stored = sessionStorage.getItem("currentArticle");
          if (stored) {
            const parsed = JSON.parse(stored);
            setArticle(parsed);
            sessionStorage.removeItem("currentArticle");
            setLoading(false);
            return;
          }
        }

        console.log("Fetching article by slug:", slug);

        
        let response = await fetch(
          `https://staging.the49thstreet.com/wp-json/wp/v2/posts?slug=${slug}&_embed&per_page=1`
        );
        let posts = await response.json();

        
        if (!posts || posts.length === 0) {
          const searchResponse = await fetch(
            `https://staging.the49thstreet.com/wp-json/wp/v2/posts?search=${slug}&_embed&per_page=1`
          );
          const searchData = await searchResponse.json();

          if (searchData.length === 0) throw new Error("Article not found");

          posts = searchData;
        }

        const post = posts[0];

        const categories = post._embedded?.["wp:term"]?.[0] || [];
        const primaryCategory =
          categories.length > 0 ? categories[0].name.toUpperCase() : "NEWS";

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
        setError(err.message);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchArticle();
  }, [slug]);

  
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        <div className="px-0 ">
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

  //  ERROR UI 
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

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-white text-black rounded-full hover:bg-gray-200"
            >
              Go Back
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 border border-white text-white rounded-full hover:bg-white/10"
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
      <div className="px-0 ">
        <Headline />
      </div>

      {/* MAIN CONTENT */}
      <div className="px-0 sm:px-6 md:px-8 lg:px-16 py-2">
        {/* FEATURED IMAGE */}
        <div className="w-full h-[60vh] md:h-[85vh] relative mb-6 overflow-hidden">
          <img
            src={article.image}
            alt={stripHtml(article.title)}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>

        {/* META */}
        <div className="mx-4 md:mx-0">
          <p className="uppercase text-[10px] md:text-[12px] text-white/50 ">
            {"///"} {article.category}
          </p>

          <h1 className="text-xl md:text-[40px] font-extrabold mb-2">
            {stripHtml(article.title)}
          </h1>

          <p className="text-[10px] md:text-[12px] text-white/60 mb-10">
            {article.author} • {article.date} • {article.time}
          </p>
        </div>

        {/* CONTENT (IMAGES REMOVED) */}
        <div className="mx-4 md:mx-0">
          <div
            className="text-[14px] leading font-[300] prose prose-invert max-w-none
            prose-headings:text-white prose-p:text-gray-300
            prose-ul:text-gray-300 prose-ol:text-gray-300
            prose-a:text-blue-400 hover:prose-a:underline"
            dangerouslySetInnerHTML={{
              __html: removeImagesFromContent(article.content),
            }}
          />
        </div>

        {/* RELATED CONTENT */}
        <div className="px-0 mt-4 ">
          <Editorial />
        </div>

        {/* FOOTER */}
        <Footer />
      </div>
    </div>
  );
}
