"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Headline from "@/components/layout/Headline";
import Footer from "@/components/layout/Footer";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const articles = [
    {
      id: 1,
      image: "/images/victony.png",
      title:
        "Victony Scores New Certification With Efforts On Victony's 'Stubborn'",
      author: "IAM NOONE",
      category: "MUSIC",
      time: "5 MINS AGO",
    },
    {
      id: 2,
      image: "/images/wizkid.png",
      title: "Wizkid Makes Surprise Nativeland Appearance",
      author: "49TH STREET",
      category: "MUSIC",
      time: "20 MINS AGO",
    },
    {
      id: 3,
      image: "/images/minz.png",
      title: "Minz Stuns For Orange",
      author: "TEMPLE EGEMESI",
      category: "FASHION",
      time: "23 MINS AGO",
    },
  ];

  // repeat 3× to make 9 total
  const gridArticles = [...articles, ...articles, ...articles];

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      router.push("/articles");
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Headline */}
      <Headline />

      {/* Section Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0.1}
        className="mx-2 sm:mx-6 md:mx-8 lg:mx-16 py-4"
      >
        <p className="uppercase text-[11px] tracking-widest text-white/60 mb-2">
          /// Latest
        </p>
        <p className="text-lg font-extrabold uppercase">Technology</p>
      </motion.div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-3 mx-0 sm:mx-6 md:mx-8 lg:mx-16">
        {gridArticles.map((article, index) => (
          <motion.div
            key={article.id + "-" + index}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            custom={index * 0.15}
            className="bg-white hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="w-full h-48 md:h-64 overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="p-4 md:p-6">
              <p className="text-sm md:text-[16px] font-bold text-black mb-3 leading-tight">
                {article.title}
              </p>
              <div className="flex sm:flex-row sm:items-center gap-1 sm:gap-0">
                <span className="text-[12px] text-black/50 font-medium">
                  {article.author}
                </span>
                <span className="hidden sm:inline text-xs text-gray-400 mx-2">
                  •
                </span>
                <span className="text-[12px] text-black/50 font-medium">
                  {article.category}
                </span>
                <span className="hidden sm:inline text-xs text-gray-400 mx-2">
                  •
                </span>
                <span className="text-[12px] text-black/50">
                  {article.time}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Load More Button */}
      <div className="bg-black py-2 md:py-6 flex justify-center mt-2">
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="flex items-center justify-center gap-2 text-[14px] font-semibold text-white cursor-pointer rounded-full transition-all disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Loading...
            </>
          ) : (
            "Load More"
          )}
        </button>
      </div>
      <div className="mx-0 sm:mx-6 md:mx-8 lg:mx-16">

      {/* Footer */}
      <Footer />
      </div>

    </div>
  );
}
