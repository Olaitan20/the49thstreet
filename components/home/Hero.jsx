"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Function to calculate time ago
const getTimeAgo = (dateString) => {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffInMs = now - postDate;
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMins < 60) {
    return `${diffInMins} MINS AGO`;
  } else if (diffInHours < 24) {
    return `${diffInHours} HOURS AGO`;
  } else {
    return `${diffInDays} DAYS AGO`;
  }
};

// Function to decode HTML entities
const decodeHtmlEntities = (text) => {
  if (typeof text !== 'string') return text;
  
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

export default function Hero() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animating, setAnimating] = useState(false);
  
  // State for API data - start empty
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fast API fetching with optimization
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Use Promise.all to fetch both endpoints simultaneously
        const [slideshowResponse, sidebarResponse] = await Promise.all([
          fetch('https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed&per_page=12&orderby=date&order=desc'),
          fetch('https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed&per_page=12&orderby=date&order=desc') 
        ]);

        // Check if responses are ok
        if (!slideshowResponse.ok || !sidebarResponse.ok) {
          throw new Error('API fetch failed');
        }

        // Parse responses
        const [slideshowData, sidebarData] = await Promise.all([
          slideshowResponse.json(),
          sidebarResponse.json()
        ]);

        // Process slideshow posts
        const formattedSlides = slideshowData.slice(0, 10).map(post => {
          const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/placeholder.jpg';
          const author = post._embedded?.author?.[0]?.name || '49TH STREET';
          const categories = post._embedded?.['wp:term']?.[0] || [];
          const category = categories.length > 0 ? categories[0].name.toUpperCase() : 'NEWS';
          
          // Decode HTML entities in title
          const cleanTitle = decodeHtmlEntities(post.title.rendered);
          
          return {
            id: post.id,
            image: featuredImage,
            title: cleanTitle,
            subtitle: `/// ${category}`,
            details: `${author} • ${category} • ${getTimeAgo(post.date)}`,
            slug: post.slug,
            category: category,
            content: post.content?.rendered || '',
            excerpt: post.excerpt?.rendered || ''
          };
        });

        // Process sidebar posts (exclude slideshow posts, take first 6)
        const slideshowIds = slideshowData.slice(0, 5).map(post => post.id);
        const sidebarPosts = sidebarData
          .filter(post => !slideshowIds.includes(post.id))
          .slice(0, 6);
        
        const formattedNews = sidebarPosts.map(post => {
          const author = post._embedded?.author?.[0]?.name || '49TH STREET';
          const categories = post._embedded?.['wp:term']?.[0] || [];
          const category = categories.length > 0 ? categories[0].name.toUpperCase() : 'NEWS';
          
          // Decode HTML entities in title
          const cleanTitle = decodeHtmlEntities(post.title.rendered);
          
          return {
            id: post.id,
            title: cleanTitle,
            author: author,
            category: category,
            time: getTimeAgo(post.date),
            slug: post.slug,
            content: post.content?.rendered || '',
            excerpt: post.excerpt?.rendered || ''
          };
        });

        // Update state with real data
        setFeaturedPosts(formattedSlides);
        setLatestPosts(formattedNews);

      } catch (error) {
        console.error('Error fetching posts:', error);
        // No fallback - let loading state handle it
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

// In your Hero component, replace the handleArticleClick function:
  const handleArticleClick = (slug, postData) => {
    // Store the post data in sessionStorage for the article page to use
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currentArticle', JSON.stringify(postData));
    }
    // Use proper Next.js navigation
    router.push(`/${encodeURIComponent(slug)}`);
  };
  // Auto-slide functionality
  const nextSlide = () => {
    if (featuredPosts.length === 0) return;
    
    setAnimating(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % featuredPosts.length);
      setAnimating(false);
    }, 500);
  };

  useEffect(() => {
    if (paused || featuredPosts.length === 0) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + 1;
        });
    }, 100);
    return () => clearInterval(interval);
  }, [paused, index, featuredPosts.length]);

  // Progress bar for current slide
  const progressBar = (
    <div className="absolute bottom-4 left-4 right-4 bg-white/20 h-1">
      <div 
        className="bg-white h-1 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  // Show loading state only when actually loading and no data
  if (loading && featuredPosts.length === 0) {
    return (
      <div className="mx-0 sm:mx-6 md:mx-8 lg:mx-16 md:mt-1 flex gap-4 text-white">
        {/* Loading skeleton for slideshow */}
        <div className="relative w-full md:w-3/4">
          <div className="w-full h-[60vh] bg-gray-700/80 animate-pulse"></div>
          <div className="p-2 mt-4 mb-6 md:mb-0">
            <div className="h-4 bg-gray-600 w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-600 w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-600 w-1/2"></div>
          </div>
        </div>
        
        {/* Loading skeleton for news sidebar - Now 6 items */}
        <div className="hidden md:flex w-1/4 flex-col p-2 max-h-[50vh]">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="my-3 pb-2 border-b border-white/10 last:border-b-0">
              <div className="h-4 bg-gray-600 w-full mb-2"></div>
              <div className="h-3 bg-gray-600 w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show nothing if no data (shouldn't happen with fast API)
  if (featuredPosts.length === 0) {
    return (
      <div className="mx-0 sm:mx-6 md:mx-8 lg:mx-16 md:mt-1 flex gap-4 text-white">
        <div className="w-full text-center py-8">
          <h2>No content available</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-0 sm:mx-6 md:mx-8 lg:mx-16  flex gap-4 text-white">
      {/* Left: Slideshow (3/4 width on desktop) */}
      <div
        className="relative w-full md:w-3/4 overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {featuredPosts.length > 0 && (
          <div className="relative">
            <div
              key={index}
              className={`transition-all duration-500 ease-in-out ${
                animating ? "opacity-0 translate-x-12" : "opacity-100 translate-x-0"
              }`}
            >
              {/* Make the slide clickable with dark overlay */}
              <div 
                onClick={() => handleArticleClick(featuredPosts[index].slug, featuredPosts[index])}
                className="relative group cursor-pointer"
              >
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/30 z-10"></div>
                
                {/* Image with better object positioning */}
                <img
                  src={featuredPosts[index].image}
                  alt={featuredPosts[index].title}
                  className="w-full h-[60vh] object-cover "
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
                
                {/* {progressBar} */}
              </div>

              {/* Captions BELOW the image */}
              <div className="p-2 mt-4 mb-6 space-y-2 md:mb-0">
                <p className="text-[12px]  uppercase tracking-widest text-white/50 mb-[8px]">
                  {featuredPosts[index].subtitle}
                </p>
                <p className="text-[16px] md:text-[16px] truncate font-semibold">
                  {featuredPosts[index].title}
                </p>
                <p className="text-[12px]  mt-[8px] text-white/50">
                  {featuredPosts[index].details}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: News List (1/4 width on desktop) - Now shows 6 items */}
      <div className="hidden md:flex w-1/4 flex-col p-2 max-h-[50vh]">
        {latestPosts.slice(0, 6).map((item, i) => (
          <div
            key={item.id || i}
            onClick={() => handleArticleClick(item.slug, item)}
            className="my-3 pb-2 cursor-pointer hover:opacity-80 transition block  last:border-b-0"
          >
            <p className="text-[14px] font-semibold line-clamp-2  hover:text-[#F26509] transition-colors">
              {item.title}
            </p>
            <p className="text-[10px] text-white/50 mt-[8px]">
              {item.author?.toUpperCase()} • {item.category} • {item.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
