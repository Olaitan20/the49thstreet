"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ShareBar({ article }) {
  const [url, setUrl] = useState("");
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.href);
      // Check if Web Share API is available
      setCanShare(!!navigator.share);
    }
  }, []);

  const title = article?.title || "";
  const description = article?.excerpt 
    ? article.excerpt.replace(/<[^>]*>/g, "").substring(0, 160)
    : "Check out this article";

  const itemClasses =
    "flex items-center gap-2 text-[12px] sm:text-[14px] hover:opacity-70 transition";

  // Modern Web Share API - works on mobile for all platforms
  const handleNativeShare = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title: title,
        text: description,
        url: url,
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        toast.error("Share failed");
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      // Try Web Share API first (mobile)
      if (canShare) {
        await handleNativeShare();
        return;
      }

      // Fallback to clipboard
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleInstagramShare = async () => {
    try {
      // Try Web Share API first
      if (canShare) {
        await handleNativeShare();
        return;
      }

      // Fallback: copy and prompt
      await navigator.clipboard.writeText(url);
      
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = "instagram://app";
      }
      
      toast.success("Link copied! Paste it into Instagram.", {
        duration: 4000,
      });
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 text-white mt-10 pt-2 border-t border-white/10">
      
      {/* X */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url,
        )}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClasses}
        title="Share on X"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.654l-5.207-6.807-5.973 6.807H2.882l7.732-8.835L1.913 2.25h6.837l4.716 6.231 5.44-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        <span>X</span>
      </a>

      {/* Instagram */}
      <button
        type="button"
        onClick={handleInstagramShare}
        className={itemClasses}
        title="Share on Instagram"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.756 0 8.331.012 7.052.07 2.695.262.273 2.686.082 7.052-.012 8.331 0 8.756 0 12s.012 3.669.07 4.948c.19 4.366 2.612 6.788 6.979 6.979 1.281.058 1.7.07 4.948.07s3.668-.012 4.948-.07c4.356-.191 6.78-2.615 6.979-6.979.058-1.28.07-1.7.07-4.948s-.012-3.669-.07-4.948c-.19-4.365-2.613-6.787-6.979-6.978C15.668.012 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 110-2.881 1.44 1.44 0 010 2.881z"/>
        </svg>
        <span>Instagram</span>
      </button>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url,
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClasses}
        title="Share on Facebook"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <span>Facebook</span>
      </a>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClasses}
        title="Share on WhatsApp"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.868 1.159l-.349.197-3.612.959 1.014-3.66-.235-.374a9.86 9.86 0 011.514-3.99 9.868 9.868 0 0113.849 1.171c.404.566.771 1.494 1.071 2.54-.963-.57-1.955-.84-2.612-1.01z"/>
        </svg>
        <span>WhatsApp</span>
      </a>

      {/* Copy Link Button */}
      <button
        type="button"
        onClick={handleCopyLink}
        className={itemClasses}
        aria-label="Copy link"
        title={canShare ? "Open share sheet" : "Copy link to clipboard"}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  );
}