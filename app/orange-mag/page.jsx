"use client";
import Headline from "@/components/layout/Headline";
import Footer from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";

export default function OrangeMagPage() {
  const [magazines, setMagazines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const iframeRef = useRef(null);
  const [useSimpleView, setUseSimpleView] = useState(false);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
    }),
  };

  const PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='480' viewBox='0 0 400 480'%3E%3Crect width='400' height='480' fill='%23111'/%3E%3Ctext x='50%25' y='50%25' fill='%23333' font-size='14' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif'%3ENo Cover%3C/text%3E%3C/svg%3E";

  useEffect(() => {
    const fetchMagazines = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://staging.the49thstreet.com/wp-json/wp/v2/magazine?_embed&per_page=6&orderby=date&order=desc"
        );
        if (!response.ok) throw new Error("Failed to fetch magazines");
        const magazinePosts = await response.json();

        const formattedMagazines = magazinePosts.map((magazine, index) => {
          const featuredMedia = magazine._embedded?.["wp:featuredmedia"]?.[0];
          let featuredImage = PLACEHOLDER;

          if (featuredMedia && !featuredMedia.code) {
            featuredImage =
              featuredMedia.source_url ||
              featuredMedia.media_details?.sizes?.full?.source_url ||
              featuredMedia.media_details?.sizes?.large?.source_url ||
              featuredMedia.media_details?.sizes?.medium_large?.source_url ||
              PLACEHOLDER;
          }

          const getTimeAgo = (dateString) => {
            const now = new Date();
            const postDate = new Date(dateString);
            const diffInMs = now - postDate;
            const diffInMins = Math.floor(diffInMs / (1000 * 60));
            const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            if (diffInMins < 60) return `${diffInMins} mins ago`;
            if (diffInHours < 24) return `${diffInHours} hrs ago`;
            return `${diffInDays} days ago`;
          };

          const issueNumber = String(index + 1).padStart(2, "0");

          return {
            id: magazine.id,
            src: featuredImage,
            title: magazine.title?.rendered || "Untitled",
            issue: `#ISSUE ${issueNumber} · ${getTimeAgo(magazine.date)}`,
            slug: magazine.slug,
          };
        });

        setMagazines(formattedMagazines);
      } catch (error) {
        console.error("Error fetching magazines:", error);
        setMagazines([
          {
            id: 1,
            src: PLACEHOLDER,
            title: "Made Kuti",
            issue: "#ISSUE 01 · 56 mins ago",
            slug: "made-kuti-interview",
          },
          {
            id: 2,
            src: PLACEHOLDER,
            title: "Tems",
            issue: "#ISSUE 02 · 2 hrs ago",
            slug: "tems-feature",
          },
          {
            id: 3,
            src: PLACEHOLDER,
            title: "Ayra Starr",
            issue: "#ISSUE 03 · 1 day ago",
            slug: "ayra-starr-profile",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMagazines();
  }, []);

  const handleMagazineClick = useCallback(async (magazine) => {
    setPdfUrl(null);
    setPdfError(null);
    setPdfTitle(magazine.title);
    setPdfLoading(true);
    setModalOpen(true);
    setUseSimpleView(false);

    try {
      const res = await fetch(
        `https://staging.the49thstreet.com/wp-json/wp/v2/media?parent=${magazine.id}&per_page=20`
      );
      if (!res.ok) throw new Error("Could not load attachments");
      const attachments = await res.json();

      const pdf = attachments.find(
        (a) =>
          a.mime_type === "application/pdf" ||
          a.source_url?.toLowerCase().endsWith(".pdf")
      );

      if (pdf) {
        setPdfUrl(pdf.source_url);
      } else {
        setPdfError("No PDF found for this issue.");
      }
    } catch (err) {
      console.error(err);
      setPdfError("Failed to load the PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setTimeout(() => {
      setPdfUrl(null);
      setPdfError(null);
      setUseSimpleView(false);
    }, 300);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeModal]);

  // Direct download - forces download without preview
  const handleDownload = useCallback(async () => {
    if (!pdfUrl) return;
    
    try {
      // Create an anchor element and trigger download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${pdfTitle || "magazine"}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      // Ultimate fallback: open in new tab
      window.open(pdfUrl, '_blank');
    }
  }, [pdfUrl, pdfTitle]);

  // Open PDF in new tab for better mobile viewing
  const openInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  // Get PDF viewer URL with multiple fallback options
  const getPdfViewerUrl = () => {
    if (!pdfUrl) return '';
    
    if (useSimpleView) {
      // Simple view with minimal features for better compatibility
      return `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=Fit`;
    }
    
    // Standard view
    return `${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`;
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <Headline />

      {/* PDF Preview Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            key="pdf-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ background: "rgba(0,0,0,0.97)" }}
            className="fixed inset-0 z-50 flex flex-col"
          >
            {/* Modal Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.3 }}
              className="flex-shrink-0 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10 bg-black/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">
                  /// ORANGE MAG
                </p>
                <p
                  className="text-[13px] sm:text-[15px] font-extrabold uppercase text-white truncate"
                  dangerouslySetInnerHTML={{ __html: pdfTitle }}
                />
              </div>

              <div className="flex items-center gap-2 sm:gap-3 ml-4">
                {pdfUrl && !pdfLoading && (
                  <>
                    {/* Mobile: Show "Open in Browser" instead of trying to embed */}
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      onClick={openInNewTab}
                      className="md:hidden flex items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 text-white text-[10px] sm:text-[11px] uppercase font-bold tracking-widest px-3 sm:px-4 py-2 rounded-full transition-colors duration-200"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      <span>Open</span>
                    </motion.button>

                    {/* Download button - works everywhere */}
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 }}
                      onClick={handleDownload}
                      className="flex items-center gap-1 sm:gap-2 bg-[#F26509] hover:bg-[#d95500] text-white text-[10px] sm:text-[11px] uppercase font-bold tracking-widest px-3 sm:px-4 py-2 rounded-full transition-colors duration-200"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span className="hidden sm:inline">Download PDF</span>
                      <span className="sm:hidden">Download</span>
                    </motion.button>
                  </>
                )}

                <button
                  onClick={closeModal}
                  aria-label="Close preview"
                  className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/10 transition-all duration-200 flex-shrink-0"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </motion.div>

            {/* Modal Body */}
            <div className="flex-1 min-h-0 relative">
              {pdfLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-[#F26509] animate-spin" />
                  </div>
                  <p className="text-white/40 text-[11px] uppercase tracking-widest">
                    Loading PDF…
                  </p>
                </div>
              )}

              {!pdfLoading && pdfError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F26509"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-white/80 text-[14px] max-w-xs">{pdfError}</p>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleDownload}
                      className="px-6 py-2 bg-[#F26509] text-white text-[12px] uppercase font-bold rounded-full"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-6 py-2 bg-white/10 text-white text-[12px] uppercase font-bold rounded-full"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {!pdfLoading && pdfUrl && !pdfError && (
                <div className="w-full h-full flex flex-col">
                  {/* Desktop: Show embedded PDF */}
                  <div className="hidden md:block w-full h-full">
                    <iframe
                      ref={iframeRef}
                      key={pdfUrl}
                      src={getPdfViewerUrl()}
                      title={pdfTitle}
                      allow="fullscreen"
                      className="w-full h-full border-0"
                      style={{ display: "block" }}
                    />
                  </div>
                  
                  {/* Mobile: Show message and download button instead of broken embed */}
                  <div className="md:hidden flex flex-col items-center justify-center h-full gap-6 p-6 text-center">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#F26509"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <div>
                      <h3 className="text-xl font-bold mb-2">PDF Ready to Download</h3>
                      <p className="text-white/60 text-sm mb-6">
                        For the best reading experience on mobile, please download the PDF file.
                      </p>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 bg-[#F26509] hover:bg-[#d95500] text-white text-[14px] uppercase font-bold tracking-widest px-8 py-4 rounded-full transition-colors"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download Full Issue
                    </button>
                    <button
                      onClick={openInNewTab}
                      className="text-white/40 text-[11px] uppercase tracking-widest hover:text-white/60 transition-colors mt-4"
                    >
                      Or open in browser →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile download bar - Persistent and obvious */}
            {pdfUrl && !pdfLoading && !pdfError && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="md:hidden flex-shrink-0 px-4 py-3 border-t border-white/10 bg-black/90 backdrop-blur-md"
              >
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 bg-[#F26509] hover:bg-[#d95500] active:bg-[#b84a00] text-white text-[14px] uppercase font-bold tracking-widest py-3 rounded-full transition-colors"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Full Issue (PDF)
                </button>
                <p className="text-[10px] text-white/30 text-center mt-2">
                  Large file recommended for offline reading
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-0 sm:mx-6 md:mx-8 lg:mx-16 py-4 sm:py-8"
      >
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.1}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 px-4 md:px-0"
        >
          <div>
            <p className="text-[10px] sm:text-[12px] uppercase mb-1 sm:mb-2 tracking-widest text-white/50">
              /// ORANGE MAG
            </p>
            <p className="text-[14px] sm:text-[16px] uppercase font-extrabold text-white">
              Read Orange Mag
            </p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={item * 0.2}
                className="cursor-pointer group"
              >
                <div className="relative w-full h-[380px] sm:h-[480px] overflow-hidden bg-gray-800 animate-pulse">
                  <div className="w-full h-full bg-gray-700" />
                </div>
                <div className="bg-black px-2 py-3 text-left">
                  <div className="h-4 w-3/4 bg-gray-700 mb-2" />
                  <div className="h-3 w-1/2 bg-gray-700" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : magazines.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="px-4 py-2 font-normal capitalize rounded-full bg-[#F26509]">
              <p>coming soon</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
            {magazines.map((magazine, index) => (
              <motion.div
                key={magazine.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={index * 0.15}
                onClick={() => handleMagazineClick(magazine)}
                className="cursor-pointer group relative"
              >
                {/* Cover image */}
                <div className="relative w-full h-[380px] sm:h-[480px] overflow-hidden bg-[#111]">
                  <img
                    src={magazine.src}
                    alt={magazine.title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = PLACEHOLDER;
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F26509] flex items-center justify-center shadow-lg">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </div>
                      <span className="text-white text-[9px] sm:text-[10px] uppercase tracking-widest font-bold">
                        Read Issue
                      </span>
                    </div>
                  </div>
                </div>

                {/* Caption */}
                <div className="bg-black px-2 py-3 text-left border-b border-white/5">
                  <p
                    className="text-[12px] sm:text-[13px] font-bold text-white uppercase truncate group-hover:text-[#F26509] transition-colors duration-200"
                    dangerouslySetInnerHTML={{ __html: magazine.title }}
                  />
                  <p className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-wider mt-0.5">
                    {magazine.issue}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-8"
        >
          <Footer />
        </motion.div>
      </motion.div>
    </div>
  );
}