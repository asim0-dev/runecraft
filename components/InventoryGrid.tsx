// components/InventoryGrid.tsx
"use client"; // <-- FIX: Add this line

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface InventoryItem {
  items: {
    name: string;
    emoji: string;
  } | null;
  qty: number;
}

export default function InventoryGrid() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchInventory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('inventories')
          .select('qty, items(name, emoji)')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching inventory:', error);
        } else {
          // @ts-ignore
          setInventory(data || []);
        }
      }
      setLoading(false);
    }
    fetchInventory();
  }, [supabase]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-gray-800 p-4 rounded-lg shadow-md h-24"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {inventory.length > 0 ? (
        inventory.map((item, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md text-center">
            {/* FIX: Use optional chaining to safely access nested properties */}
            <span className="text-4xl">{item.items?.emoji}</span>
            <p className="mt-2 text-sm text-gray-300">{item.items?.name}</p>
            <p className="text-lg font-bold">x{item.qty}</p>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-400 col-span-full">Your inventory is empty!</p>
      )}
    </div>
  );
}
