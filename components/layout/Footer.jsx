'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation' // Import usePathname

export default function Footer() {
  const pathname = usePathname() // Get current path
  
  return (
    <footer className="bg-[#F26509] text-white pt-8 md:pt-16 overflow-hidden">
      {/* Newsletter Section */}
      <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-16">
        <div className="relative w-full text-left">
          <h2 className="text-2xl font-extrabold mb-2 uppercase leading-tight">
            SUBSCRIBE TO OUR NEWSLETTER
          </h2>
          <p className="text-[11px] md:text-[13px] uppercase text-white/80 mb-6">
            Stay updated with the latest news, stories, and exclusives.
          </p>

          {/* Full-Width Signup Form */}
          <form className="flex flex-col w-full">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 text-black bg-white/10 w-full focus:outline-none placeholder:text-white text-[14px] placeholder:text-[14px]"
              required
            />
            <button
              type="submit"
              className="bg-transparent border-white border-1 text-white text-sm md:text-base px-6 py-3 font-bold uppercase mt-3 w-full hover:bg-gray-900 transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-black mt-10 md:mt-16 py-10 md:pb-6 pt-6">
        <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          {/* About Us */}
          <div className="flex flex-col items-start text-white space-y-4">
            <Link href="/" className="flex items-center gap-1 text-white/80 hover:text-[#F26509] transition">
              <Image src="/icons/Logo black.png" alt="49th Street Logo" width={50} height={50} />
            </Link>

            {/* Policies / Links */}
            <div className="flex flex-col text-white/70 space-y-3 pt-2">
              <Link 
                href="/about-us" 
                className={`uppercase text-[11px] transition ${
                  pathname === '/about-us' 
                    ? 'text-[#F26509] font-bold' 
                    : 'hover:text-white'
                }`}
              >
                About
              </Link>
              <a href="mailto:info@the49thstreet.com" className="hover:text-white uppercase text-[11px] transition">
                Contact Us
              </a>
              <a href="mailto:info@the49thstreet.com" className="hover:text-white uppercase text-[11px] transition">
                Submissions
              </a>
            </div>

            {/* Social Icons + Names */}
            <div className="flex flex-col md:flex-row md:flex-wrap items-start gap-4 pt-8 text-[11px]">
              <a href="https://www.instagram.com/the49thstreet/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-white/80 hover:text-[#F26509] transition">
                <Image src="/icons/instagram.png" alt="Instagram" width={18} height={18} />
                Instagram
              </a>
              <a href="https://twitter.com/the49thstreet?s=21" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-white/80 hover:text-[#F26509] transition">
                <Image src="/icons/x.png" alt="X" width={18} height={18} />
                X
              </a>
              <a href="https://www.youtube.com/@watch49thstreet" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-white/80 hover:text-[#F26509] transition">
                <Image src="/icons/youtube.png" alt="YouTube" width={18} height={18} />
                YouTube
              </a>
              <a href="https://www.tiktok.com/@the49thstreet?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-white/80 hover:text-[#F26509] transition">
                <Image src="/icons/tiktok.png" alt="TikTok" width={18} height={18} />
                TikTok
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}