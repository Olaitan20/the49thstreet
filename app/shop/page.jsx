"use client";
import { products } from "../../data/products";
import React, { useState } from "react";
import Image from "next/image";
import Footer from "@/components/layout/Footer";

export default function ShopPage() {
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  // add/remove helpers
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <section>
    <div className="bg-white md:bg-transparent mb-8 md:mb-0 sm:mx-8 md:mx-12 lg:mx-16  ">
      {/* Header */}
      <div className="py-8 md:pb-8 px-4 md:px-0 flex justify-between items-center">
        <div>
          <p className="text-[12px] uppercase mb-1 tracking-widest text-black md:text-white/50">
            /// shop
          </p>
          <p className="text-[13px] md:text-[16px] uppercase font-extrabold text-black md:text-white">
            Explore the Collection
          </p>
        </div>

       
      </div>

      <div className="flex justify-center mb-8 items-center">
            <div className="p-4  font-bold rounded-full bg-[#F26509]">
              <p>coming soon</p>
            </div>
          </div>
        <Footer />

      
    </div>

   
    </section>
  );
}
