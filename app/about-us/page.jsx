"use client"

import Editorial from '@/components/home/Editoral'
import Footer from '@/components/layout/Footer'
import React from 'react'

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white pt-6 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">About Us</h1>
          <p className="text-[12px]">
            The street to everything African creativity
          </p>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="pt-6 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F26509] mb-6 text-center">Who We Are</h2>
          
          <div className="md:grid mb-6 md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <p className="text-[13px] md:text-[15px] leading-relaxed mb-6">
                We are the street to everything African creativity. Our brand is African, by Africans and for Africans. 
                Here we bring to you, the best of African music, fashion, art and culture.
              </p>
            </div>
            
            <div className="text-center md:text-left">
              <p className="text-[13px] md:text-[15px] leading-relaxed mb-2">
                49th Street (formerly known as 7th Street) was established in September 2019 to be an all-round Media, 
                Entertainment and Advertising agency committed to spotlighting and documenting underground African 
                creatives and the achievements of Africans all around the world.
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