"use client"
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";

const ProductDetails = ({ params }) => {
    const { currency, addToCart, router } = useAppContext();
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                console.log("Fetching product with ID:", params.id);
                const { data } = await axios.get(`/api/products/${params.id}`);
                console.log("Product data:", data);
                
                if (data.success) {
                    setProductData(data.product);
                    if (data.product.image && data.product.image.length > 0) {
                        setMainImage(data.product.image[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [params.id]);

    if (loading) {
        return <Loading />;
    }

    if (!productData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Product not found</p>
            </div>
        );
    }

    const handleBuyNow = () => {
        addToCart(productData._id);
        router.push('/cart');
    };

    return (
        <>
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Product Images */}
                    <div className="space-y-4">
                        <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                                src={mainImage || productData.image[0] || assets.no_image}
                                alt={productData.name}
                                fill
                                className="object-contain p-4"
                                priority
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {productData.image.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setMainImage(img)}
                                    className={`aspect-square relative bg-gray-100 rounded-lg overflow-hidden ${
                                        mainImage === img ? 'ring-2 ring-orange-500' : ''
                                    }`}
                                >
                                    <Image
                                        src={img}
                                        alt={`${productData.name} view ${index + 1}`}
                                        fill
                                        className="object-contain p-2"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="space-y-6">
                        <h1 className="text-3xl font-semibold text-gray-900">{productData.name}</h1>
                        
                        <div className="flex items-center gap-2">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Image
                                        key={star}
                                        src={star <= 4.5 ? assets.star_icon : assets.star_dull_icon}
                                        alt="star"
                                        width={24}
                                        height={24}
                                    />
                                ))}
                            </div>
                            <span className="text-gray-600">(4.5)</span>
                        </div>

                        <p className="text-gray-600">{productData.description}</p>

                        <div className="space-y-1">
                            <p className="text-4xl font-bold text-gray-900">
                                {currency}{productData.offerPrice}
                                <span className="ml-2 text-lg text-gray-500 line-through">
                                    {currency}{productData.price}
                                </span>
                            </p>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <table className="w-full max-w-md">
                                <tbody>
                                    <tr>
                                        <td className="py-2 text-gray-900 font-medium">Brand</td>
                                        <td className="py-2 text-gray-600">Generic</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-900 font-medium">Color</td>
                                        <td className="py-2 text-gray-600">Multi</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-900 font-medium">Category</td>
                                        <td className="py-2 text-gray-600">{productData.category}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button
                                onClick={() => addToCart(productData._id)}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Add to Cart
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default ProductDetails;