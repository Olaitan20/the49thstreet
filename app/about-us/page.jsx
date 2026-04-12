"use client"

import Editorial from '@/components/home/Editoral'
import Footer from '@/components/layout/Footer'
import React from 'react'

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white pt-6 px-4">
        <div className="container mx-auto max-w-6xl text-left">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">About Us</h1>
          <p className="text-[12px]">
            The street to everything African creativity
          </p>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="pt-6 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F26509] mb-6 text-left">Who We Are</h2>
          
          <div className="md:grid mb-6 md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <p className="text-[12px] leading-relaxed mb-6">
              The 49th Street is a leading professional music publication from Lagos, Nigeria, dedicated to documenting, amplifying, and covering African music. From spotlight features and interviews to in-depth stories on acts shaping the sound across the continent and globally.
              </p>
            </div>
            
            <div className="text-left">
              <p className="text-[12px] leading-relaxed mb-2">
               Established in September 2019, it is known for its extensive coverage of African music across its music vertical, YouTube, weekly curated playlists, and rich editorial content, offering a diverse range of content segments that continue to engage its community of music enthusiasts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Editorial/>
      
      <div className="mx-0 sm:mx-6 md:mx-8 lg:mx-16">
        <Footer />
      </div>
    </div>
  )
}

export default AboutPage