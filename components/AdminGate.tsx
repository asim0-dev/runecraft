/*
  This is a higher-order component (HOC) that acts as an authentication gate.
  It wraps any page or component that should only be accessible to admins.
*/

// Location: /components/AdminGate.tsx
"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";

// IMPORTANT: Replace with your actual admin User IDs from Supabase Auth.
const ADMIN_UIDS = [
  "558ab90b-6e5c-4376-a6d5-043683ed8fe5", // Your User ID
  // Add any other admin UIDs here
];

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Check if the current user's ID is in our list of admins
        setIsAuthorized(ADMIN_UIDS.includes(currentUser.id));
      } else {
        setIsAuthorized(false);
      }
      setIsLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          setIsAuthorized(ADMIN_UIDS.includes(currentUser.id));
        } else {
          setIsAuthorized(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Verifying authorization...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h1 className="text-4xl font-bold text-red-500">403 - Forbidden</h1>
        <p className="mt-4">You do not have permission to view this page.</p>
      </div>
    );
  }

  // If authorized, render the protected content
  return <>{children}</>;
}
