// components/ActionButtons.tsx
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const COOLDOWN_MS = 5000; // Must match backend

export default function ActionButtons() {
  const supabase = createClientComponentClient();
  const [cooldowns, setCooldowns] = useState<Record<string, boolean>>({});

  const handleAction = async (action: 'hunt' | 'fish' | 'beg') => {
    if (cooldowns[action]) {
      return;
    }

    setCooldowns(prev => ({ ...prev, [action]: true }));
    setTimeout(() => {
      setCooldowns(prev => ({ ...prev, [action]: false }));
    }, COOLDOWN_MS);

    try {
      const token = await supabase.auth.getSession();
      const res = await fetch(`/api/actions/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.data.session?.access_token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to perform action');
      }

      alert(`Action successful! You received: ${JSON.stringify(data.loot || data.coinsAdded)}`);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="flex justify-center space-x-4 mt-8">
      <button
        onClick={() => handleAction('hunt')}
        disabled={cooldowns.hunt}
        className={`px-6 py-3 rounded-lg text-white font-bold transition-transform transform ${
          cooldowns.hunt ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:scale-105'
        }`}
      >
        {cooldowns.hunt ? 'Hunting (5s CD)' : 'Hunt'}
      </button>
      <button
        onClick={() => handleAction('fish')}
        disabled={cooldowns.fish}
        className={`px-6 py-3 rounded-lg text-white font-bold transition-transform transform ${
          cooldowns.fish ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:scale-105'
        }`}
      >
        {cooldowns.fish ? 'Fishing (5s CD)' : 'Fish'}
      </button>
      <button
        onClick={() => handleAction('beg')}
        disabled={cooldowns.beg}
        className={`px-6 py-3 rounded-lg text-white font-bold transition-transform transform ${
          cooldowns.beg ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-600 hover:scale-105'
        }`}
      >
        {cooldowns.beg ? 'Begging (5s CD)' : 'Beg'}
      </button>
    </div>
  );
}