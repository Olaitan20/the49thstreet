"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const TopBar = () => {
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      const day = now.toLocaleDateString("en-US", { weekday: "short" });
      const date = now.getDate();
      const month = now.toLocaleDateString("en-US", { month: "short" });
      const time = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      setDateTime(`${day} ${date} ${month} ${time.replace(" ", "")}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="
        sticky top-0 z-50
        border-b border-white/5
        py-2 md:py-2.5
        text-white stripes
        backdrop-blur-md bg-black/60
      "
    >
      <div className="mx-4 md:mx-12 lg:mx-24">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <h2 className="text-base">{dateTime}</h2>
          
             <Link 
              href="/"
              // target="_blank"
              rel="noopener noreferrer"
              className=""
            >
              <Image
                src="./49thlogo.svg"
                alt="49THSTREET"
                width={120}
                height={120}
              />
              
            </Link>

          <div className="flex items-center gap-1 group">
            <Image
              src="/icons/spotify.svg"
              alt="Spotify Icon"
              width={24}
              height={24}
              className="inline-block mr-2 group-hover:animate-pulse transition-all duration-300"
            />
            <Link 
              href="https://open.spotify.com/playlist/5dwts9LXFfWNg5bTu00DWq?si=PxJEQpmlQF-EXMBOApHYEw&pi=e-cS_MGDaZQVuB"
              target="_blank"
              rel="noopener noreferrer"
              className="group-hover:text-[#1DB954] transition-colors duration-300"
            >
              <h2 className="text-base">Listen To Our New Music Playlist</h2>
            </Link>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col items-center gap-1">
          {/* Date and Title on same line */}
          <div className="w-full flex items-center  justify-between">
            <h2 className="text-sm ">{dateTime.split(' ')[0]} {dateTime.split(' ')[1]} {dateTime.split(' ')[2]}</h2>
            
            <Link 
              href="https://open.spotify.com/playlist/5dwts9LXFfWNg5bTu00DWq?si=PxJEQpmlQF-EXMBOApHYEw&pi=e-cS_MGDaZQVuB"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <Image
                src="/icons/spotify.svg"
                alt="Spotify"
                width={16}
                height={16}
              />
              <h2 className="text-xs font-semibold">Playlist</h2>
            </Link>
          </div>
          
          {/* Title and Time on second line */}
          <div className="w-full flex items-center justify-between">
             <Link 
              href="/"
              // target="_blank"
              rel="noopener noreferrer"
              className=""
            >
              <Image
                src="./49thlogo.svg"
                alt="49THSTREET"
                width={100}
                height={100}
              />
              
            </Link>
            <h2 className="text-sm">{dateTime.split(' ')[3]}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
