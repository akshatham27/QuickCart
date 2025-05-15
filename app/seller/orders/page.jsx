'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";

const Orders = () => {
    const { currency, getToken } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSellerOrders = async () => {
        try {
            const token = await getToken();
            const response = await fetch('/api/orders?role=seller', {
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
        fetchSellerOrders();
    }, [getToken]);

    const getProductDisplay = (item) => {
        const product = item.productId;
        if (!product || !product.name) {
            return `Product (Removed) x ${item.quantity}`;
        }
        return `${product.name} x ${item.quantity}`;
    };

    return (
        <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
            {loading ? <Loading /> : <div className="md:p-10 p-4 space-y-5">
                <h2 className="text-lg font-medium">Orders</h2>
                <div className="max-w-4xl rounded-md">
                    {orders.map((order) => (
                        <div key={order._id} className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-300">
                            <div className="flex-1 flex gap-5 max-w-80">
                                <Image
                                    className="max-w-16 max-h-16 object-cover"
                                    src={assets.box_icon}
                                    alt="box_icon"
                                />
                                <p className="flex flex-col gap-3">
                                    <span className="font-medium">
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
            </div>}
            <Footer />
        </div>
    );
};

export default Orders;