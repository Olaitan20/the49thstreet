"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CopyIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function ShareBar({ article }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.href);
    }
  }, []);

  const title = article?.title || "";

  const itemClasses =
    "flex items-center gap-2 text-[12px] sm:text-[14px] hover:opacity-70 transition";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleInstagramShare = () => {
    navigator.clipboard.writeText(url);
    
    // Open Instagram app on mobile
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = "instagram://app";
    }
    
    toast.success("Link copied! Paste it into Instagram.", {
      duration: 4000,
    });
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
      >
        <Image src="/icons/x.png" alt="Share on X" width={16} height={16} />
        <span>X</span>
      </a>

      {/* Instagram */}
      <button
        type="button"
        onClick={handleInstagramShare}
        className={itemClasses}
      >
        <Image
          src="/icons/instagram.png"
          alt="Copy link for Instagram"
          width={16}
          height={16}
        />
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
      >
        <Image
          src="/icons/facebook.png"
          alt="Share on Facebook"
          width={16}
          height={16}
        />
        <span>Facebook</span>
      </a>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClasses}
      >
        <Image
          src="/icons/whatsapp.png"
          alt="Share on WhatsApp"
          width={16}
          height={16}
        />
        <span>WhatsApp</span>
      </a>
      {/* Copy Link Button */}
      <button
        type="button"
        onClick={handleCopyLink}
        className={itemClasses}
        aria-label="Copy link"
      >
        <CopyIcon size={16} />
        {/* <span>Copy Link</span> */}
      </button>
    </div>
  );
}