import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

const OrderSummary = () => {
  const { currency, router, getCartCount, getCartAmount, cartItems, getToken } = useAppContext();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  const [error, setError] = useState("");

  const [userAddresses, setUserAddresses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const fetchUserAddresses = useCallback(async () => {
    try {
      setAddressLoading(true);
      setError("");
      
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch('/api/address', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setUserAddresses(data.addresses || []);
        // If there's only one address, select it automatically
        if (data.addresses && data.addresses.length === 1) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        throw new Error(data.message || "Failed to fetch addresses");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setError("Failed to fetch addresses. Please try again.");
      toast.error("Failed to fetch addresses. Please try again.");
    } finally {
      setAddressLoading(false);
    }
  }, [getToken, setSelectedAddress]);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
    setError("");
  };

  const createOrder = async () => {
    try {
      if (!selectedAddress) {
        setError("Please select a shipping address");
        toast.error("Please select a shipping address");
        return;
      }

      if (getCartCount() === 0) {
        setError("Your cart is empty");
        toast.error("Your cart is empty");
        return;
      }

      setLoading(true);
      setError("");

      // Show loading toast
      const loadingToast = toast.loading("Processing your order...");

      // Prepare order items
      const items = Object.entries(cartItems).map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

      console.log("Sending order with items:", items);
      console.log("Cart items object:", cartItems);

      const totalAmount = getCartAmount() + Math.floor(getCartAmount() * 0.02); // Including 2% tax

      const token = await getToken();
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items,
          totalAmount,
          shippingAddress: selectedAddress,
          paymentMethod: paymentMethod
        })
      });

      const data = await response.json();
      console.log("Order response:", data);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (data.success) {
        // Show success toast
        toast.success("Order placed successfully!");
        // Redirect to order success page
        router.push('/order-placed');
      } else {
        setError(data.message || "Failed to place order");
        toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setError("Failed to place order. Please try again.");
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAddresses();
  }, [fetchUserAddresses]);

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Order Summary
      </h2>
      <hr className="border-gray-500/30 my-5" />

      <div className="space-y-5">
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Shipping Address
          </label>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={addressLoading}
              className="w-full p-2.5 text-left border text-gray-600 bg-white flex justify-between items-center"
            >
              {addressLoading ? (
                <span className="text-gray-400">Loading addresses...</span>
              ) : selectedAddress ? (
                <span>{`${selectedAddress.street}, ${selectedAddress.city}`}</span>
              ) : (
                <span>Select Address</span>
              )}
              <span className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isDropdownOpen && !addressLoading && (
              <div className="absolute z-10 w-full mt-1 bg-white border shadow-lg max-h-60 overflow-y-auto">
                {userAddresses.length > 0 ? (
                  <>
                    {userAddresses.map((address) => (
                      <div
                        key={address._id}
                        onClick={() => handleAddressSelect(address)}
                        className="p-2.5 hover:bg-gray-100 cursor-pointer"
                      >
                        {`${address.street}, ${address.city}, ${address.state}`}
                      </div>
                    ))}
                    <div 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        router.push('/add-address');
                      }}
                      className="p-2.5 hover:bg-orange-50 cursor-pointer text-orange-600 font-medium border-t flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add New Address
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => {
                      setIsDropdownOpen(false);
                      router.push('/add-address');
                    }}
                    className="p-2.5 hover:bg-orange-50 cursor-pointer text-orange-600 font-medium flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Your First Address
                  </div>
                )}
              </div>
            )}
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Promo Code
          </label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border"
            />
            <button className="bg-orange-600 text-white px-9 py-2 hover:bg-orange-700">
              Apply
            </button>
          </div>
        </div>

        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Payment Method
          </label>
          <select 
            className="w-full p-2.5 text-gray-600 border bg-white outline-none cursor-pointer"
            onChange={(e) => setPaymentMethod(e.target.value)}
            value={paymentMethod}
          >
            <option value="cod">Cash on Delivery</option>
            <option value="online">Online Payment</option>
          </select>
        </div>

        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items {getCartCount()}</p>
            <p className="text-gray-800">{currency}{getCartAmount()}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Shipping Fee</p>
            <p className="font-medium text-gray-800">Free</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Tax (2%)</p>
            <p className="font-medium text-gray-800">{currency}{Math.floor(getCartAmount() * 0.02)}</p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>{currency}{getCartAmount() + Math.floor(getCartAmount() * 0.02)}</p>
          </div>
        </div>
      </div>

      <button 
        onClick={createOrder} 
        disabled={loading || addressLoading}
        className={`w-full py-3 mt-5 text-white ${
          loading || addressLoading
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-orange-600 hover:bg-orange-700'
        }`}
      >
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  );
};

export default OrderSummary;