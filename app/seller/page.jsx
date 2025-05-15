'use client'
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const AddProduct = () => {
  const { getToken } = useAppContext();
  const router = useRouter();

  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Earphone');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Cleanup function for preview URLs
  const cleanupPreviews = () => {
    previewUrls.forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
  };

  // Cleanup on component unmount
  React.useEffect(() => {
    return () => cleanupPreviews();
  }, [cleanupPreviews, previewUrls]);

  const handleImageChange = async (e, index) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error('Please select an image file');
          return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Image size should be less than 5MB');
          return;
        }

        // Create a copy of the current arrays
        const updatedFiles = [...files];
        const updatedPreviews = [...previewUrls];
        
        // Revoke old preview URL if it exists
        if (updatedPreviews[index]) {
          URL.revokeObjectURL(updatedPreviews[index]);
        }
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        
        // Update the arrays
        updatedFiles[index] = file;
        updatedPreviews[index] = previewUrl;
        
        // Update state
        setFiles(updatedFiles);
        setPreviewUrls(updatedPreviews);

        console.log('Image selected:', {
          name: file.name,
          type: file.type,
          size: file.size,
          preview: previewUrl
        });
      } catch (error) {
        console.error("Error handling image:", error);
        toast.error("Error processing image");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    // Filter out null or undefined files
    const validFiles = files.filter(file => file);
    if (validFiles.length === 0) {
      toast.error("Please select at least one product image");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Adding product...");

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('price', price);
      formData.append('offerPrice', offerPrice);

      // Append each valid file
      for (const file of validFiles) {
        formData.append('images', file);
      }

      console.log('Submitting product with images:', {
        filesCount: validFiles.length,
        fileTypes: validFiles.map(f => f.type),
        fileSizes: validFiles.map(f => f.size)
      });

      const token = await getToken();
      const { data } = await axios.post('/api/product/add', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      if (data.success) {
        toast.success(data.message);
        // Cleanup preview URLs
        cleanupPreviews();
        // Reset form
        setName('');
        setDescription('');
        setCategory('Earphone');
        setPrice('');
        setOfferPrice('');
        setFiles([]);
        setPreviewUrls([]);
        // Redirect to product list
        router.push('/seller/product-list');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to add product");
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        <div>
          <p className="text-base font-medium">Product Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {[...Array(4)].map((_, index) => (
              <label key={index} htmlFor={`image${index}`} className="relative">
                <input 
                  onChange={(e) => handleImageChange(e, index)}
                  type="file" 
                  id={`image${index}`} 
                  accept="image/*"
                  hidden 
                />
                <div className="relative w-24 h-24 border rounded overflow-hidden hover:border-orange-500 transition-colors">
                  <Image
                    className="object-contain cursor-pointer p-2"
                    src={previewUrls[index] || (files[index] ? URL.createObjectURL(files[index]) : assets.upload_area)}
                    alt={files[index]?.name || "Upload image"}
                    fill
                    sizes="96px"
                    priority={true}
                  />
                </div>
              </label>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">Upload up to 4 product images (max 5MB each)</p>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            Product Name
          </label>
          <input
            id="product-name"
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label
            className="text-base font-medium"
            htmlFor="product-description"
          >
            Product Description
          </label>
          <textarea
            id="product-description"
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Type here"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            required
          ></textarea>
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setCategory(e.target.value)}
              defaultValue={category}
            >
              <option value="Earphone">Earphone</option>
              <option value="Headphone">Headphone</option>
              <option value="Watch">Watch</option>
              <option value="Smartphone">Smartphone</option>
              <option value="Laptop">Laptop</option>
              <option value="Camera">Camera</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">
              Product Price
            </label>
            <input
              id="product-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              required
            />
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="offer-price">
              Offer Price
            </label>
            <input
              id="offer-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setOfferPrice(e.target.value)}
              value={offerPrice}
              required
            />
          </div>
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`px-8 py-2.5 bg-orange-600 text-white font-medium rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Adding...' : 'ADD'}
        </button>
      </form>
      {/* <Footer /> */}
    </div>
  );
};

export default AddProduct;