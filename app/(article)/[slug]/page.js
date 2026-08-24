import ArticleClient from "./ArticleClient";
import { getPost } from "@/lib/getPost";

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
    // Shared cached fetch — deduplicated with the page component below, so
    // one request to WordPress serves both the head tags and the body.
    const post = await getPost(slug);

    if (!post) {
      return {
        title: 'Article Not Found | 49th Street',
      };
    }

    const title = decodeHtmlEntities(post.title.rendered.replace(/<[^>]*>/g, ""));
    const rawExcerpt = post.excerpt?.rendered || post.content.rendered || "";
    const excerpt = decodeHtmlEntities(rawExcerpt.replace(/<[^>]*>/g, "")).trim().substring(0, 160);
    
    // Get featured image
    const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || 
                  "/images/placeholder.jpg";

    return {
      title: `${title} | 49th Street`,
      description: excerpt,
      alternates: {
        canonical: `/${slug}`,
      },
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

export default async function Page({ params }) {
  const { slug } = await params;

  // Same cached call generateMetadata made — deduplicated within this request.
  // Null when Server A is unavailable, in which case ArticleClient falls back
  // to fetching in the browser exactly as it did before.
  const post = await getPost(slug);

  return <ArticleClient initialPost={post} />;
}
