"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const navItems = [
  { id: "feed", label: "Feed", icon: "/icons/feed.svg", href: "/" },
  { id: "orange-mag", label: "Orange Mag", icon: "/icons/orange-mag.svg", href: "/orange-mag" },
  { id: "editorials", label: "Editorials", icon: "/icons/editorials.svg", href: "/editorials" },
  { id: "music", label: "Music", icon: "/icons/music.svg", href: "/music" },
  { id: "fashion", label: "Fashion", icon: "/icons/fashion.svg", href: "/fashion" },
  { id: "sports", label: "Sports", icon: "/icons/sport.svg", href: "/sports" },
  { id: "news", label: "News", icon: "/icons/news.svg", href: "/news" },
  { id: "lifestyle", label: "Lifestyle", icon: "/icons/lifestyle.svg", href: "/lifestyle" },
  { id: "trivia", label: "Trivia", icon: "/icons/trivia.svg", href: "/trivia" },
  { id: "creative-hub", label: "Creative Hub", icon: "/icons/creative.svg", href: "/creative-hub" },
  { id: "shop", label: "Shop", icon: "/icons/shop.svg", href: "/shop" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <nav className="sticky z-40 top-16 md:top-10 md:z-40 w-full px-3 sm:px-6 md:px-8 lg:px-24 py-2 bg-black/60 backdrop-blur-md border-b border-white/5">
      <ul
        className="
          flex items-center
          gap-x-5 sm:gap-x-6 md:gap-x-16 
          overflow-x-auto
          md:overflow-x-auto
          whitespace-nowrap
          scrollbar-hide
          scroll-smooth
          py-2
          text-white
          -mx-3 sm:-mx-6 md:-mx-8 lg:-mx-16 px-3 sm:px-6 md:px-8 lg:px-16
        "
      >
        {navItems.map((item) => {
          const isActive =
            (item.id === "feed" && pathname === "/") ||
            pathname === item.href;

          return (
            <li key={item.id} className="flex-shrink-0">
              <Link
                href={item.href}
                className="flex items-center gap-1 sm:gap-1.5 md:gap-2 cursor-pointer transition-all hover:opacity-90"
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={22}
                  height={22}
                  className={`transition-opacity ${
                    isActive ? "opacity-100" : "opacity-60"
                  }`}
                />
                <span
                  className={`text-[12px] tracking-tight ${
                    isActive ? "text-white font-semibold" : "text-white/70"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

 
    </nav>
  );
}





