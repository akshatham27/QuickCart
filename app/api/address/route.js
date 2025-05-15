import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Address from "@/models/Address";

// Get all addresses for a user
export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        console.log("Fetching addresses for user:", userId);
        await connectDB();
        
        const addresses = await Address.find({ userId }).sort({ createdAt: -1 });
        console.log("Found addresses:", addresses);

        return NextResponse.json({ success: true, addresses });
    } catch (error) {
        console.error("Detailed error in GET /api/address:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return NextResponse.json({ 
            success: false, 
            message: "Failed to fetch addresses. Please try again." 
        }, { status: 500 });
    }
}

// Add a new address
export async function POST(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        console.log("Adding address for user:", userId);
        await connectDB();
        
        const addressData = await req.json();
        console.log("Received address data:", addressData);

        // Validate required fields
        const requiredFields = ['fullName', 'phoneNumber', 'street', 'city', 'state', 'zipCode'];
        for (const field of requiredFields) {
            if (!addressData[field]) {
                return NextResponse.json({ 
                    success: false, 
                    message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required` 
                }, { status: 400 });
            }
        }

        // Create new address
        const address = await Address.create({
            ...addressData,
            userId
        });

        console.log("Created address:", address);

        return NextResponse.json({ 
            success: true, 
            message: "Address added successfully",
            address 
        });
    } catch (error) {
        console.error("Detailed error in POST /api/address:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return NextResponse.json({ 
            success: false, 
            message: "Failed to add address. Please try again." 
        }, { status: 500 });
    }
} 