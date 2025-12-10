"use client";
import Image from "next/image";
import Headline from "@/components/layout/Headline";
import { useRouter } from "next/navigation";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";


export default function OrangeMagPage() {
  const router = useRouter();
  const [magazines, setMagazines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
    }),
  };

  // Fetch magazine posts
  useEffect(() => {
    const fetchMagazines = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(
          "https://staging.the49thstreet.com/wp-json/wp/v2/magazine?_embed&per_page=6&orderby=date&order=desc"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch magazines");
        }

        const magazinePosts = await response.json();

        // Format the magazines
        const formattedMagazines = magazinePosts.map((magazine, index) => {
          const featuredMedia = magazine._embedded?.["wp:featuredmedia"];
          let featuredImage = "/images/magazine.png";

          if (featuredMedia && featuredMedia[0]?.source_url) {
            featuredImage = featuredMedia[0].source_url;
          } else {
            const magazineImages = [
              "/images/magazine.png",
              "/images/magazine2.png",
              "/images/magazine.png",
            ];
            featuredImage = magazineImages[index % magazineImages.length];
          }

          // Calculate time ago
          const getTimeAgo = (dateString) => {
            const now = new Date();
            const postDate = new Date(dateString);
            const diffInMs = now - postDate;
            const diffInMins = Math.floor(diffInMs / (1000 * 60));
            const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

            if (diffInMins < 60) {
              return `${diffInMins} mins ago`;
            } else if (diffInHours < 24) {
              return `${diffInHours} hrs ago`;
            } else {
              return `${diffInDays} days ago`;
            }
          };

          // Format issue number (use ID or fallback to index)
          const issueNumber = String(magazine.id).padStart(2, '0');
          
          return {
            id: magazine.id,
            src: featuredImage,
            title: magazine.title.rendered,
            issue: `#ISSUE ${issueNumber} ${getTimeAgo(magazine.date)}`,
            slug: magazine.slug,
            excerpt: magazine.excerpt?.rendered || "",
          };
        });

        setMagazines(formattedMagazines);
      } catch (error) {
        console.error("Error fetching magazines:", error);
        // Fallback to static magazines
        setMagazines([
          { 
            id: 1, 
            src: "/images/magazine.png", 
            title: "Made Kuti", 
            issue: "#ISSUE 05 56 mins ago",
            slug: "made-kuti-interview",
            excerpt: ""
          },
          { 
            id: 2, 
            src: "/images/magazine2.png", 
            title: "Tems", 
            issue: "#ISSUE 06 2 hrs ago",
            slug: "tems-feature",
            excerpt: ""
          },
          { 
            id: 3, 
            src: "/images/magazine.png", 
            title: "Ayra Starr", 
            issue: "#ISSUE 07 1 day ago",
            slug: "ayra-starr-profile",
            excerpt: ""
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMagazines();
  }, []);

  // Handle magazine click
  const handleMagazineClick = (slug) => {
    router.push(`/orange-mag/${slug}`);
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Headline should always render immediately */}
      <Headline />

      {/* Main content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-0 sm:mx-6 md:mx-8 lg:mx-16 py-8"
      >
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.1}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 px-4 md:px-0"
        >
          <div>
            <p className="text-[12px] uppercase mb-2 tracking-widest text-white/50">
              /// ORANGE MAG
            </p>
            <p className="text-[16px] uppercase font-extrabold text-white">
              Read Orange Mag
            </p>
          </div>
        </motion.div>

        {isLoading ? (
          // Loading skeleton
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0"
          >
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={item * 0.2}
                className="cursor-pointer group"
              >
                <div className="relative w-full h-[420px] sm:h-[480px] overflow-hidden bg-gray-800 animate-pulse">
                  <div className="w-full h-full bg-gray-700"></div>
                </div>
                <div className="bg-black px-2 py-3 text-left">
                  <div className="h-4 w-3/4 bg-gray-700 mb-2"></div>
                  <div className="h-3 w-1/2 bg-gray-700"></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // Magazine Grid — tight, edge-to-edge
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0"
          >
            {magazines.map((mag, index) => (
              <motion.div
                key={mag.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                custom={index * 0.2}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                onClick={() => handleMagazineClick(mag.slug)}
                className="cursor-pointer group"
              >
                {/* Image section (tight edge-to-edge) */}
                <div className="relative w-full h-[420px] sm:h-[480px] overflow-hidden">
                  {/* Use regular img tag for external images */}
                  <img
                    src={mag.src}
                    alt={mag.title}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      const localImages = [
                        "/images/magazine.png",
                        "/images/magazine2.png",
                        "/images/magazine.png",
                      ];
                      const randomLocal = localImages[index % localImages.length];
                      e.target.src = randomLocal;
                      e.target.onerror = null;
                    }}
                  />
                </div>
                {/* Magazine info */}
                <div className="bg-black px-2 py-3 text-left">
                  <p className="text-[11px] uppercase tracking-widest text-white/50">
                    // uncvr
                  </p>
                  <p className="text-[15px] font-bold text-white mt-1">
                    {mag.title}
                  </p>
                  <p className="text-[11px] uppercase text-white/60 mt-1 tracking-widest">
                    {mag.issue}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        {/* <Editorial/> */}
        {/* Footer — fade in immediately to avoid blank space at bottom */}
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
