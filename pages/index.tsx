// pages/index.tsx
import Link from 'next/link';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function HomePage() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  
  useEffect(() => {
    // This is a simple check to see if the user is already logged in
    // and redirect them to the gameplay page.
    if (session) {
      router.push('/gameplay');
    }
  }, [session, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome to Dank Memer Proto!</h1>
      <p className="text-xl mb-8">A player-driven economy built with Next.js and Supabase.</p>
      
      {session ? (
        <div className="text-center">
          <p className="mb-4">You are logged in as {session.user?.email}</p>
          <div className="space-x-4">
            <Link href="/gameplay" className="bg-green-600 px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors">
              Go to Gameplay
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4">You are not logged in.</p>
          <div className="space-x-4">
            <Link href="/auth/login" className="bg-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
              Login / Sign Up
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}