'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Editorial() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [articles, setArticles] = useState([])
  const [isLoadingArticles, setIsLoadingArticles] = useState(true)

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

  // Decode HTML entities
  const decodeHtmlEntities = (text) => {
    if (typeof text !== 'string') return text;
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };

  // Fetch 49th-exclusive category posts
  useEffect(() => {
    const fetchExclusivePosts = async () => {
      try {
        setIsLoadingArticles(true);

        // Fetch category by slug
        const categoriesResponse = await fetch(
          'https://staging.the49thstreet.com/wp-json/wp/v2/categories?slug=49th-exclusive'
        );
        const categories = await categoriesResponse.json();

        let posts = [];

        if (categories.length > 0) {
          const categoryId = categories[0].id;

          const postsResponse = await fetch(
            `https://staging.the49thstreet.com/wp-json/wp/v2/posts?_embed&categories=${categoryId}&per_page=3&orderby=date&order=desc`
          );

          if (postsResponse.ok) {
            posts = await postsResponse.json();
          }
        }

        // Fallbacks
        if (posts.length === 0) {
          const latestResponse = await fetch(
            'https://staging.the49thstreet.com/wp/v2/posts?_embed&per_page=3&orderby=date&order=desc'
          );
          posts = await latestResponse.json();
        }

        const formatted = posts.map((post, index) => {
          const featuredImage =
            post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
            ['/images/victony.png', '/images/wizkid.png', '/images/minz.png'][index % 3];

          const author = post._embedded?.author?.[0]?.name || '49TH STREET';
          const categories = post._embedded?.['wp:term']?.[0] || [];
          const category =
            categories.length > 0 ? categories[0].name.toUpperCase() : 'EXCLUSIVE';

          return {
            id: post.id,
            image: featuredImage,
            title: decodeHtmlEntities(post.title.rendered),
            author,
            category,
            time: getTimeAgo(post.date),
            slug: post.slug
          };
        });

        setArticles(formatted);
      } catch (error) {
        console.error(error);
        setArticles(staticArticles);
      } finally {
        setIsLoadingArticles(false);
      }
    };

    fetchExclusivePosts();
  }, []);

  // See all handler
  const handleSeeAll = () => {
    setLoading(true);
    setTimeout(() => router.push('/'), 1500);
  };

  // Static fallback*
  const staticArticles = [
    {
      id: 1,
      image: '/images/victony.png',
      title: "Victony Scores New Certification With Efforts On Victony's 'Stubborn'",
      author: 'IAM NOONE',
      category: '49TH EXCLUSIVE',
      time: '5 MINS AGO',
      slug: 'victony-certification'
    },
    {
      id: 2,
      image: '/images/wizkid.png',
      title: 'Wizkid Makes Surprise Nativeland Appearance',
      author: '49TH STREET',
      category: '49TH EXCLUSIVE',
      time: '20 MINS AGO',
      slug: 'wizkid-nativeland'
    },
    {
      id: 3,
      image: '/images/minz.png',
      title: 'Minz Stuns For Orange',
      author: 'TEMPLE EGEMESI',
      category: '49TH EXCLUSIVE',
      time: '23 MINS AGO',
      slug: 'minz-orange'
    }
  ];

  const displayArticles = articles.length > 0 ? articles : staticArticles;

  // Loading State UI
  if (isLoadingArticles) {
    return (
      <div className="bg-white md:bg-transparent">
        <section className="mx-0 sm:mx-6 md:mx-8 lg:mx-16 pt-[24px] md:pt-0 md:mt-20">
          {/* Header loading */}
          <div className="mb-4 md:mb-8 px-4 md:px-0 flex items-center justify-between">
            <div>
              <p className="text-[12px] uppercase mb-1 tracking-widest text-black md:text-white/50">
                /// 49TH EXCLUSIVE
              </p>
              <p className="text-base md:text-[16px] uppercase font-extrabold text-black md:text-white">
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
              <div key={item} className="transition cursor-pointer group flex items-center animate-pulse">
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

  // MAIN RENDER
  return (
    <div className="bg-white md:bg-transparent">
      <section className="mx-0 sm:mx-6 md:mx-8 lg:mx-16 py-[24px] md:pt-0 md:mt-20">
        {/* Header */}
        <div className="mb-4 md:mb-8 px-4 md:px-0 flex items-center justify-between">
          <div>
            <p className="text-[10px] md:text-[12px] uppercase mb-1 tracking-widest text-black md:text-white/50">
              /// 49TH EXCLUSIVE
            </p>
            <p className="text-[14px] md:text-[16px] uppercase font-extrabold text-black md:text-white">
              FRESH OFF THE PRESS
            </p>
          </div>

          <button
            onClick={handleSeeAll}
            disabled={loading}
            className="flex items-center justify-center gap-2 text-[12px] md:text-[14px] font-semibold text-white bg-black border border-black rounded-full px-4 py-1.5 disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Loading...
              </>
            ) : (
              'See All'
            )}
          </button>
        </div>

        {/* Article Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 px-4 md:px-0 lg:grid-cols-3 gap-4 md:gap-6">
          {displayArticles.map((article) => (
            <div
              key={article.id}
              className="transition cursor-pointer group flex items-center hover:opacity-80"
              onClick={() => router.push(`/article/${article.slug}`)} // ✅ FIXED ROUTE
            >
              <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="ml-4 flex flex-col justify-between">
                <p className="text-sm md:text-[15px] font-bold text-black md:text-white leading-tight line-clamp-2">
                  {article.title}
                </p>

                <div className="mt-2 flex items-center flex-wrap gap-1 text-[11px] text-black/60 md:text-white/60">
                  <span>{article.author}</span>
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
