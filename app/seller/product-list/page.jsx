'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import { toast } from "react-hot-toast";

const ProductList = () => {
  const { router, getToken, triggerProductsRefetch } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const fetchSellerProducts = async () => {
    try {
      console.log("Fetching seller products...");
      setLoading(true);
      const token = await getToken();
      const response = await axios.get('/api/products/seller', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        console.log("Successfully fetched products:", response.data.products.length);
        setProducts(response.data.products);
      } else {
        console.error("Failed to fetch products:", response.data.message);
        toast.error(response.data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      setDeletingProduct(productId);
      const token = await getToken();
      const response = await axios.delete(`/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success("Product deleted successfully");
        setProducts(products.filter(p => p._id !== productId));
        triggerProductsRefetch();
      } else {
        toast.error(response.data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      setDeletingProduct(null);
    }
  };

  useEffect(() => {
    fetchSellerProducts();
  }, [getToken]);

  if (loading) {
    return (
      <div className="flex-1 min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Products</h2>
          <button 
            onClick={() => router.push('/seller')}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Add New Product
          </button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Image
              src={assets.empty_box}
              alt="No products"
              width={120}
              height={120}
              className="mx-auto mb-4"
            />
            <p className="text-gray-500 mb-4">No products found. Start by adding your first product!</p>
            <button 
              onClick={() => router.push('/seller')}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Add Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={product.image?.[0] || assets.no_image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 line-through">${product.price}</p>
                      <p className="text-lg font-semibold text-orange-600">${product.offerPrice}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/product/${product._id}`)}
                        className="px-3 py-1.5 text-sm text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        disabled={deletingProduct === product._id}
                        className={`px-3 py-1.5 text-sm text-red-600 hover:text-red-700 transition-colors ${
                          deletingProduct === product._id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {deletingProduct === product._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductList;