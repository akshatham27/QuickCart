import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const { userId } = getAuth();
        
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // Update the user's public metadata to include the seller role
        const response = await fetch(`${process.env.CLERK_API_URL}/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                public_metadata: { role: "seller" },
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to update user metadata');
        }

        return NextResponse.json({ success: true, message: "User set as seller successfully" });
    } catch (error) {
        console.error("Error setting user as seller:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
} 