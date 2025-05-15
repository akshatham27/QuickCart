'use client';
import React, { useEffect, useState, useCallback } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import { toast } from "react-hot-toast";
import axios from "axios";

const Orders = () => {
    const { currency, getToken } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSellerOrders = useCallback(async () => {
        try {
            console.log("Fetching seller orders...");
            setLoading(true);
            const token = await getToken();
            const response = await axios.get('/api/orders?role=seller', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                console.log("Successfully fetched orders:", response.data.orders.length);
                setOrders(response.data.orders);
            } else {
                console.error("Failed to fetch orders:", response.data.message);
                toast.error(response.data.message || "Failed to fetch orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error(error.response?.data?.message || "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchSellerOrders();
    }, [fetchSellerOrders]);

    const getProductDisplay = useCallback((item) => {
        const product = item.productId;
        if (!product || !product.name) {
            return `Product (Removed) x ${item.quantity}`;
        }
        return `${product.name} x ${item.quantity}`;
    }, []);

    if (loading) {
        return (
            <div className="flex-1 min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between">
            <div className="md:p-10 p-4 space-y-5">
                <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <Image
                            src={assets.empty_box}
                            alt="No orders"
                            width={120}
                            height={120}
                            className="mx-auto mb-4"
                        />
                        <p className="text-gray-500">No orders found</p>
                    </div>
                ) : (
                    <div className="max-w-4xl space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-lg shadow p-6 space-y-4">
                                <div className="flex flex-col md:flex-row gap-5 justify-between">
                                    <div className="flex-1 flex gap-5">
                                        <Image
                                            className="w-16 h-16 object-contain"
                                            src={assets.box_icon}
                                            alt="box_icon"
                                            width={64}
                                            height={64}
                                        />
                                        <div className="space-y-2">
                                            <div className="font-medium text-gray-900">
                                                {order.items.map((item, index) => (
                                                    <div key={item._id || index}>
                                                        {getProductDisplay(item)}
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Items: {order.items.length}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p className="font-medium text-gray-900">Shipping Address:</p>
                                        <p>{order.shippingAddress.street}</p>
                                        <p>{order.shippingAddress.city}</p>
                                        <p>{`${order.shippingAddress.state}, ${order.shippingAddress.country}`}</p>
                                        <p>{order.shippingAddress.zipCode}</p>
                                    </div>
                                    <div className="text-right space-y-2">
                                        <p className="font-medium text-lg text-orange-600">
                                            {currency}{order.totalAmount}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Status: <span className="font-medium">{order.status}</span>
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Date: {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
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

export default Orders;