import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const authSeller = async (userId) => {
    try {
        if (!userId) {
            return false;
        }

        const user = await clerkClient.users.getUser(userId);
        
        if (!user) {
            return false;
        }

        return user.publicMetadata.role === 'seller';
    } catch (error) {
        console.error("Error in seller authentication:", error);
        return false;
    }
}

export default authSeller;