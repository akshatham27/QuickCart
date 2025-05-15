import React, { useState, useEffect } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";

const ProductCard = ({ product }) => {
    const { currency, router, addToCart } = useAppContext();
    const [imageError, setImageError] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        if (product?.image && product.image.length > 0) {
            setImageUrl(product.image[0]);
            setImageError(false);
        }
    }, [product]);

    if (!product) {
        return null;
    }

    const handleImageError = () => {
        console.error('Image failed to load:', imageUrl);
        setImageError(true);
        setImageUrl(assets.no_image);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            {/* Product Image Container */}
            <div 
                className="relative aspect-square bg-gray-50 cursor-pointer group"
                onClick={() => router.push(`/product/${product._id}`)}
            >
                <Image
                    src={!imageError ? (imageUrl || assets.no_image) : assets.no_image}
                    alt={product.name || "Product Image"}
                    className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={handleImageError}
                    priority={true}
                    loading="eager"
                />
                
                {/* Wishlist Heart Icon */}
                <button className="absolute right-4 top-4 z-10 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Image
                        src={assets.heart_icon}
                        alt="Add to wishlist"
                        width={16}
                        height={16}
                    />
                </button>
            </div>

            {/* Product Info */}
            <div className="p-6 space-y-4">
                {/* Product Name and Description */}
                <div className="space-y-2">
                    <h3 
                        className="font-medium text-xl leading-tight hover:text-orange-600 transition-colors cursor-pointer"
                        onClick={() => router.push(`/product/${product._id}`)}
                    >
                        {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                        {product.description}
                    </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Image
                                key={star}
                                src={star <= 4.5 ? assets.star_icon : assets.star_dull_icon}
                                alt="star"
                                width={18}
                                height={18}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-1">4.5</span>
                </div>

                {/* Price and Buy Button */}
                <div className="flex items-center justify-between pt-2">
                    <div className="space-y-1">
                        <p className="text-3xl font-semibold text-gray-900">
                            {currency}{product.offerPrice}
                        </p>
                        <p className="text-sm text-gray-500 line-through">
                            {currency}{product.price}
                        </p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product._id);
                            router.push('/cart');
                        }}
                        className="px-6 py-3 text-sm font-medium text-white bg-orange-600 rounded-full hover:bg-orange-700 transition-colors"
                    >
                        Buy now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;