// components/ListItemForm.tsx
import { useState, useEffect, FormEvent } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface InventoryItem {
  item_id: number;
  qty: number;
  items: {
    name: string;
  } | null; // <-- FIX: Allow the joined 'items' object to be null
}

export default function ListItemForm() {
  const supabase = createClientComponentClient();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    async function fetchInventory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('inventories')
          .select('item_id, qty, items(name)')
          .eq('user_id', user.id)
          .gt('qty', 0);

        if (error) {
          console.error('Error fetching inventory for listing:', error);
        } else {
          // @ts-ignore <-- FIX: Tell TypeScript to ignore the type mismatch on this line
          setInventory(data || []);
        }
      }
      setLoading(false);
    }
    fetchInventory();
  }, [supabase]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem || quantity <= 0 || price <= 0) {
      alert('Please fill out all fields correctly.');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/market/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ item_id: selectedItem, quantity, price }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to list item.');
      }

      alert('Item listed successfully!');
      // Reset form
      setSelectedItem(null);
      setQuantity(1);
      setPrice(0);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-400">Loading inventory...</p>;
  }

  if (inventory.length === 0) {
    return <p className="text-center text-gray-400">You have no items to list!</p>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">List an Item for Sale</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="item" className="block text-sm font-medium text-gray-300">Item</label>
          <select
            id="item"
            value={selectedItem || ''}
            onChange={(e) => setSelectedItem(parseInt(e.target.value))}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white"
          >
            <option value="">-- Select an item --</option>
            {inventory.map((item) => (
              <option key={item.item_id} value={item.item_id}>
                {item.items?.name} (x{item.qty})
              </option>
            ))}
          </select>
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">Quantity</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="price" className="block text-sm font-medium text-gray-300">Price (Coins)</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-bold hover:bg-indigo-700 transition-colors"
        >
          List Item
        </button>
      </form>
    </div>
  );
}