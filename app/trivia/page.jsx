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
        className="mx-2 sm:mx-6 text-center md:mx-8 lg:mx-16 py-4"
      >
        <h1 className="">No Trivia Questions yet!</h1>
      </motion.div>

      
     
      <div className="mx-0 sm:mx-6 md:mx-8 lg:mx-16">

      {/* Footer */}
      <Footer />
      </div>

    </div>
  );
}
