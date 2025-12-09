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

        <button
          onClick={() => setCheckoutOpen(true)}
          className="relative flex items-center gap-2 bg-black md:bg-[#F26509] text-sm text-white px-4 py-2 rounded-full"
        >
          <Image src="/icons/cart.svg" alt="Cart" width={18} height={18} />
          {cartCount > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 bg-white/20 rounded-full">
              {cartCount}
            </span>
          )}
          Item
        </button>
      </div>

      {/* Product Grid */}
      <div className="bg-[#F7F7F7] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 divide-x divide-y divide-gray-200 text-black">
        {products.slice(0, 8).map((product) => (
          <div key={product.id} className="flex flex-col p-4 items-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-contain mb-3"
            />

            <p className="text-[12px] font-medium text-left w-full min-h-[20px]">
              {product.name}
            </p>

            <div className="flex-1" />

            <div className="flex justify-between items-center w-full mt-3">
              <p className="text-gray-500 text-[12px] font-medium">
                ₦{product.price.toLocaleString()}
              </p>
              <button
                onClick={() => addToCart(product)}
                className="flex items-center justify-center w-6 h-6 rounded-full border border-black"
              >
                <Image
                  src="/icons/plus.svg"
                  width={12}
                  height={12}
                  alt="add to cart"
                />
              </button>
            </div>
          </div>
        ))}
      </div>
        <Footer />

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setCheckoutOpen(false)}
        >
          <div
            className="bg-white text-black p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Checkout</h2>

            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                <ul className="space-y-4">
                  {cart.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          ₦{item.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="px-2 py-1 border rounded"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="px-2 py-1 border rounded"
                        >
                          +
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-between items-center mt-6">
                  <p className="font-bold">Total:</p>
                  <p className="font-bold">₦{totalAmount.toLocaleString()}</p>
                </div>

                <div className="mt-6 flex justify-end gap-4">
                  <button
                    onClick={() => setCheckoutOpen(false)}
                    className="px-4 py-2 border"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => alert("Proceed to payment (to be added)")}
                    className="px-4 py-2 bg-[#F26509] text-white"
                  >
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>

   
    </section>
  );
}
