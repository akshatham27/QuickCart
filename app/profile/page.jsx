'use client';
import { useAppContext } from '@/context/AppContext';

export default function ProfilePage() {
    const { user } = useAppContext();

    if (!user) {
        return <div>Please sign in to view your profile.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Profile</h1>
            
            <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">Account Details</h2>
                    <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
                    <p>Name: {user.fullName}</p>
                </div>
            </div>
        </div>
    );
} 