import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";

const HomeProducts = () => {
  const { products, router } = useAppContext()

  return (
    <div className="flex flex-col items-center py-16">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-8">Popular Products</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
          {products.map((product, index) => (
            <ProductCard key={product._id || index} product={product} />
          ))}
        </div>

        <div className="text-center">
          <button 
            onClick={() => router.push('/all-products')} 
            className="px-8 py-3 text-base font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            View All Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeProducts;
