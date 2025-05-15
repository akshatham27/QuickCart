'use client'
import React, { useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";
import Loading from "@/components/Loading";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import Banner from "@/components/Banner";
import NewsLetter from "@/components/NewsLetter";
import FeaturedProduct from "@/components/FeaturedProduct";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Home = () => {
  const { products, fetchProducts, loading } = useAppContext();

  useEffect(() => {
    console.log("Home page mounted, fetching products...");
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    console.log("Products updated:", { count: products.length, loading });
  }, [products, loading]);

  if (loading) {
    console.log("Showing loading state...");
    return (
      <>
        <Navbar />
        <Loading />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar/>
      <div className="px-6 md:px-16 lg:px-32">
        <HeaderSlider />
        <HomeProducts />
        <FeaturedProduct />
        <Banner />
        <NewsLetter />
      </div>
      <div className="w-full min-h-screen p-4 md:p-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        {products.length === 0 && !loading && (
          <div className="w-full h-[50vh] flex items-center justify-center">
            <p className="text-gray-500">No products available</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Home;
