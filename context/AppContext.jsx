'use client'
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY
    const router = useRouter()

    const { user } = useUser();
    const { getToken } = useAuth()

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(false)
    const [cartItems, setCartItems] = useState({})
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            console.log("Fetching products...");
            const response = await axios.get('/api/products');
            
            if (response.data.success) {
                console.log("Products fetched successfully:", response.data.products.length);
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
    }, []);

    const triggerProductsRefetch = useCallback(() => {
        console.log("Triggering products refetch...");
        setRefetchTrigger(prev => prev + 1);
        try {
            window.dispatchEvent(new CustomEvent('productUpdated'));
        } catch (error) {
            console.error("Error dispatching productUpdated event:", error);
        }
    }, []);

    const fetchUserData = useCallback(async () => {
        try {
            if (!user) return;

            if (user.publicMetadata?.role === "seller") {
                setIsSeller(true);
            }

            const token = await getToken();
            const response = await axios.get("/api/user/data", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setUserData(response.data.user);
                setCartItems(response.data.user.cartItems || {});
            } else {
                toast.error(response.data.message || "Failed to fetch user data");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error(error.response?.data?.message || "Failed to fetch user data");
        }
    }, [user, getToken]);

    const addToCart = async (itemId) => {
        try {
            let cartData = structuredClone(cartItems);
            cartData[itemId] = (cartData[itemId] || 0) + 1;
            setCartItems(cartData);
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error("Failed to add item to cart");
        }
    }

    const updateCartQuantity = async (itemId, quantity) => {
        try {
            let cartData = structuredClone(cartItems);
            if (quantity === 0) {
                delete cartData[itemId];
            } else {
                cartData[itemId] = quantity;
            }
            setCartItems(cartData);
        } catch (error) {
            console.error("Error updating cart:", error);
            toast.error("Failed to update cart");
        }
    }

    const getCartCount = () => {
        try {
            return Object.values(cartItems).reduce((total, quantity) => 
                total + (quantity > 0 ? quantity : 0), 0);
        } catch (error) {
            console.error("Error calculating cart count:", error);
            return 0;
        }
    }

    const getCartAmount = () => {
        try {
            return Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
                const product = products.find(p => p._id === itemId);
                if (product && quantity > 0) {
                    return total + (product.offerPrice * quantity);
                }
                return total;
            }, 0);
        } catch (error) {
            console.error("Error calculating cart amount:", error);
            return 0;
        }
    }

    useEffect(() => {
        console.log("Products refetch triggered:", refetchTrigger);
        fetchProducts();
    }, [refetchTrigger, fetchProducts]);

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user, fetchUserData]);

    const value = {
        user,
        getToken,
        currency,
        router,
        isSeller,
        setIsSeller,
        userData,
        fetchUserData,
        products,
        fetchProducts,
        loading,
        cartItems,
        setCartItems,
        addToCart,
        updateCartQuantity,
        getCartCount,
        getCartAmount,
        triggerProductsRefetch
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}