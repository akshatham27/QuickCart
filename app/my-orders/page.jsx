'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";

const MyOrders = () => {
    const { currency, getToken } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const token = await getToken();
            const response = await fetch('/api/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setOrders(data.orders);
            } else {
                console.error("Failed to fetch orders:", data.message);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [getToken]);

    const getProductDisplay = (item) => {
        const product = item.productId;
        if (!product || !product.name) {
            return `Product (Removed) x ${item.quantity}`;
        }
        return `${product.name} x ${item.quantity}`;
    };

    return (
        <>
            <Navbar />
            <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
                <h2 className="text-lg font-medium mt-6">My Orders</h2>
                {loading ? <Loading /> : (
                    <div className="max-w-5xl border-t border-gray-300 text-sm">
                        {orders.map((order) => (
                            <div key={order._id} className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-300">
                                <div className="flex-1 flex gap-5 max-w-80">
                                    <Image
                                        className="max-w-16 max-h-16 object-cover"
                                        src={assets.box_icon}
                                        alt="box_icon"
                                    />
                                    <p className="flex flex-col gap-3">
                                        <span className="font-medium text-base">
                                            {order.items.map(item => (
                                                getProductDisplay(item)
                                            )).join(", ")}
                                        </span>
                                        <span>Items: {order.items.length}</span>
                                    </p>
                                </div>
                                <div>
                                    <p>
                                        <span className="font-medium">{order.shippingAddress.street}</span>
                                        <br />
                                        <span>{order.shippingAddress.city}</span>
                                        <br />
                                        <span>{`${order.shippingAddress.state}, ${order.shippingAddress.country}`}</span>
                                        <br />
                                        <span>{order.shippingAddress.zipCode}</span>
                                    </p>
                                </div>
                                <p className="font-medium my-auto">{currency}{order.totalAmount}</p>
                                <div>
                                    <p className="flex flex-col">
                                        <span>Status: {order.status}</span>
                                        <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default MyOrders;