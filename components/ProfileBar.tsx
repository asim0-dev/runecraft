// components/ProfileBar.tsx
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Profile {
  username: string;
  coins: number;
}

export default function ProfileBar() {
  const supabase = createClientComponentClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, coins')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, [supabase]);

  if (loading) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between animate-pulse">
        <div className="h-4 bg-gray-600 rounded w-1/4"></div>
        <div className="h-4 bg-gray-600 rounded w-1/6"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between">
      <span className="text-xl font-semibold">Hello, {profile.username}!</span>
      <span className="text-xl font-bold text-yellow-400">
        💰 {profile.coins.toLocaleString()}
      </span>
    </div>
  );
}