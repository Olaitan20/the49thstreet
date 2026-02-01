import ArticleClient from "./ArticleClient";

// Simple HTML entity decoder for common entities
const decodeHtmlEntities = (text) => {
  if (!text) return "";
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "--")
    .replace(/&nbsp;/g, " ");
};

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    // Fetch article data for metadata
    // Try direct slug match first
    let response = await fetch(
      `https://staging.the49thstreet.com/wp-json/wp/v2/posts?slug=${slug}&_embed=author,wp:featuredmedia,wp:term&per_page=1`,
      { next: { revalidate: 60 } }
    );

    let posts = [];
    if (response.ok) {
        posts = await response.json();
    }

    // Fallback to search if slug doesn't match
    if (!posts || posts.length === 0) {
       const searchResponse = await fetch(
          `https://staging.the49thstreet.com/wp-json/wp/v2/posts?search=${encodeURIComponent(
            slug,
          )}&_embed=author,wp:featuredmedia,wp:term&per_page=1`,
           { next: { revalidate: 60 } }
        );
        if (searchResponse.ok) {
           const searchData = await searchResponse.json();
           if (searchData.length > 0) {
               posts = searchData;
           }
        }
    }

    if (!posts || posts.length === 0) {
      return {
        title: 'Article Not Found | 49th Street',
      };
    }

    const post = posts[0];
    const title = decodeHtmlEntities(post.title.rendered.replace(/<[^>]*>/g, ""));
    const rawExcerpt = post.excerpt?.rendered || post.content.rendered || "";
    const excerpt = decodeHtmlEntities(rawExcerpt.replace(/<[^>]*>/g, "")).trim().substring(0, 160);
    
    // Get featured image
    const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || 
                  "/images/placeholder.jpg";

    return {
      title: `${title} | 49th Street`,
      description: excerpt,
      openGraph: {
        title: title,
        description: excerpt,
        url: `https://the49thstreet.com/${slug}`, // Optional: Add canonical URL if known
        siteName: '49th Street',
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: title,
        description: excerpt,
        images: [image],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: '49th Street',
    };
  }
}

export default function Page() {
  return <ArticleClient />;
}
