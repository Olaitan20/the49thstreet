"use client";

import { motion } from "framer-motion";
import Hero from "@/components/home/Hero";
import ContentGrid from "@/components/home/ContentGrid";
import Store from "@/components/Store";
import Latest from "@/components/home/Latest";
import Magazine from "@/components/home/Magazine";
import Sports from "@/components/home/Sports";
import Footer from "@/components/layout/Footer";
import Headline from "@/components/layout/Headline";
import TriviaDialog from "@/components/TriviaDialog";
import Editoral from "@/components/home/Editoral";

export default function Home() {
  const videoItems = [
    {
      title: "Orange (Official Music Video)",
      description: "The official music video for Orange",
      bgColor: "#ff6b35",
    },
    {
      title: "Behind the Scenes",
      description: "Making of the Orange album",
      bgColor: "#1a5f7a",
    },
    {
      title: "Live Performance",
      description: "Orange live at Red Rocks",
      bgColor: "#ff6b35",
    },
  ];

  // animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen relative bg-black text-white">
      {/* <TriviaDialog /> */}

      {/* headline should always be visible */}
      <Headline />

      {/* hero fades in immediately on mount */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        <Hero />
      </motion.div>

      {/* the rest fade in as they enter view */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <ContentGrid title="LATEST VIDEOS" items={videoItems} />
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Latest />
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Magazine />
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Sports />
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Editoral />
      </motion.div>

      {/* <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Store />
      </motion.div> */}

      {/* footer */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mx-0 sm:mx-6 md:mx-8 lg:mx-16"
      >
        <Footer />
      </motion.div>
    </div>
  );
}

