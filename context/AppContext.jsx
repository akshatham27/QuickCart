'use client'
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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
            const response = await fetch('/api/products');
            const data = await response.json();
            
            if (data.success) {
                console.log("Products fetched successfully:", data.products.length);
                setProducts(data.products);
            } else {
                console.error("Failed to fetch products:", data.message);
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    }, []);

    const triggerProductsRefetch = useCallback(() => {
        console.log("Triggering products refetch...");
        setRefetchTrigger(prev => prev + 1);
        // Dispatch a custom event to notify components
        window.dispatchEvent(new Event('productUpdated'));
    }, []);

    const fetchUserData = useCallback(async () => {
        try {
            if (!user) return;

            if(user.publicMetadata.role === "seller"){
                setIsSeller(true)
            }

            const token = await getToken()
            const {data} = await axios.get("/api/user/data", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if(data.success){
                setUserData(data.user)
                setCartItems(data.user.cartItems)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }, [user, getToken]);

    const addToCart = async (itemId) => {
        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        }
        else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
    }

    const updateCartQuantity = async (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData)
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (cartItems[items] > 0 && itemInfo) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        console.log("Products refetch triggered:", refetchTrigger);
        fetchProducts();
    }, [refetchTrigger, fetchProducts]);

    useEffect(() => {
        if(user){
            fetchUserData();
        }
    }, [user, fetchUserData]);

    const value = {
        user, getToken,
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProducts,
        loading,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
        triggerProductsRefetch
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}