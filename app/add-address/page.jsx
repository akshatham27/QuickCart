'use client'
import { assets } from "@/assets/assets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const AddAddress = () => {
    const { getToken } = useAppContext();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [address, setAddress] = useState({
        fullName: '',
        phoneNumber: '',
        zipCode: '',
        street: '',
        landmark: '',
        city: '',
        state: '',
    });

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            // Basic validation
            if (!address.fullName || !address.phoneNumber || !address.zipCode || 
                !address.street || !address.city || !address.state) {
                toast.error("Please fill all required fields");
                return;
            }

            // Phone number validation
            if (!/^\d{10}$/.test(address.phoneNumber)) {
                toast.error("Please enter a valid 10-digit phone number");
                return;
            }

            // Zipcode validation
            if (!/^\d{6}$/.test(address.zipCode)) {
                toast.error("Please enter a valid 6-digit zipcode");
                return;
            }

            const token = await getToken();
            const response = await fetch('/api/address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(address)
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Address added successfully");
                router.back(); // Go back to previous page
            } else {
                toast.error(data.message || "Failed to add address");
            }
        } catch (error) {
            console.error("Error adding address:", error);
            toast.error("Failed to add address. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="px-6 md:px-16 lg:px-32 py-16 flex flex-col md:flex-row justify-between">
                <form onSubmit={onSubmitHandler} className="w-full">
                    <p className="text-2xl md:text-3xl text-gray-500">
                        Add Shipping <span className="font-semibold text-orange-600">Address</span>
                    </p>
                    <div className="space-y-3 max-w-sm mt-10">
                        <input
                            className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                            type="text"
                            placeholder="Full name *"
                            onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                            value={address.fullName}
                            required
                        />
                        <input
                            className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                            type="tel"
                            placeholder="Phone number *"
                            onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })}
                            value={address.phoneNumber}
                            maxLength={10}
                            required
                        />
                        <input
                            className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                            type="text"
                            placeholder="Pin code *"
                            onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                            value={address.zipCode}
                            maxLength={6}
                            required
                        />
                        <textarea
                            className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500 resize-none"
                            rows={4}
                            placeholder="Address (Area and Street) *"
                            onChange={(e) => setAddress({ ...address, street: e.target.value })}
                            value={address.street}
                            required
                        ></textarea>
                        <input
                            className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                            type="text"
                            placeholder="Landmark (Optional)"
                            onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                            value={address.landmark}
                        />
                        <div className="flex space-x-3">
                            <input
                                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                                type="text"
                                placeholder="City/District/Town *"
                                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                value={address.city}
                                required
                            />
                            <input
                                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                                type="text"
                                placeholder="State *"
                                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                value={address.state}
                                required
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`max-w-sm w-full mt-6 py-3 uppercase ${
                            loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-orange-600 hover:bg-orange-700'
                        } text-white`}
                    >
                        {loading ? 'Saving...' : 'Save Address'}
                    </button>
                </form>
                <Image
                    className="md:mr-16 mt-16 md:mt-0"
                    src={assets.my_location_image}
                    alt="my_location_image"
                />
            </div>
            <Footer />
        </>
    );
};

export default AddAddress;