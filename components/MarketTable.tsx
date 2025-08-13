// components/MarketTable.tsx
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface MarketListing {
  id: number;
  seller_id: string;
  quantity: number;
  price: number;
  items: {
    name: string;
    emoji: string;
    rarity: string;
  }[] | null; // <-- FIX: Changed to an array of objects
  profiles: {
    username: string;
  }[] | null; // <-- FIX: Changed to an array of objects
}

export default function MarketTable() {
  const supabase = createClientComponentClient();
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListings() {
      const { data, error } = await supabase
        .from('market_listings')
        .select(`
          id,
          seller_id,
          quantity,
          price,
          items (
            name,
            emoji,
            rarity
          ),
          profiles!market_listings_seller_id_fkey (
            username
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching market listings:', error);
        setError('Failed to load market listings.');
      } else {
        setListings((data as MarketListing[]) || []);
      }
      setLoading(false);
    }
    fetchListings();
  }, [supabase]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-800 h-10 w-full rounded-md mb-2"></div>
        <div className="bg-gray-800 h-10 w-full rounded-md mb-2"></div>
        <div className="bg-gray-800 h-10 w-full rounded-md mb-2"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-400">{error}</p>;
  }

  if (listings.length === 0) {
    return <p className="text-center text-gray-400">No active listings found. Be the first to sell!</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Item
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Quantity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Price
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Seller
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-700">
          {listings.map((listing) => (
            <tr key={listing.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 text-3xl">
                    {/* FIX: Safely access the first item in the array */}
                    {listing.items && listing.items[0]?.emoji}
                  </div>
                  <div className="ml-4">
                    {/* FIX: Safely access the first item in the array */}
                    <div className="text-sm font-medium text-gray-100">{listing.items && listing.items[0]?.name}</div>
                    <div className="text-sm text-gray-400">{listing.items && listing.items[0]?.rarity}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-100">x{listing.quantity}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                💰 {listing.price.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                 {/* FIX: Safely access the first profile in the array */}
                {listing.profiles && listing.profiles[0]?.username}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-indigo-400 hover:text-indigo-200">Buy</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}