// components/EventCreator.tsx
import { useState } from "react";
import { useRouter } from "next/router";

export default function EventCreator() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bonusType, setBonusType] = useState("coins"); // Default to coins
  const [bonusValue, setBonusValue] = useState(0);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          bonus_type: bonusType,
          bonus_value: Number(bonusValue),
          start_time: startTime,
          end_time: endTime,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create event");
      }
      
      setMessage("✅ Event created successfully!");
      setName("");
      setDescription("");
      setBonusValue(0);
      setStartTime("");
      setEndTime("");
      
      // Optional: Refresh the page to show the new event
      router.reload();

    } catch (err: any) {
      console.error(err);
      setMessage(`❌ Failed to create event: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-md max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">Admin: Create a New Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Event Name</label>
          <input
            type="text"
            id="name"
            placeholder="e.g., Double Coin Weekend"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded p-2 bg-gray-700 text-white placeholder-gray-400"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
          <textarea
            id="description"
            placeholder="A short description of the bonus"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full border rounded p-2 bg-gray-700 text-white placeholder-gray-400"
          />
        </div>
        <div>
          <label htmlFor="bonusType" className="block text-sm font-medium text-gray-300">Bonus Type</label>
          <select
            id="bonusType"
            value={bonusType}
            onChange={(e) => setBonusType(e.target.value)}
            className="w-full border rounded p-2 bg-gray-700 text-white"
          >
            <option value="coins">Coins</option>
            <option value="items">Items</option>
          </select>
        </div>
        <div>
          <label htmlFor="bonusValue" className="block text-sm font-medium text-gray-300">Bonus Value (%)</label>
          <input
            type="number"
            id="bonusValue"
            value={bonusValue}
            onChange={(e) => setBonusValue(Number(e.target.value))}
            min="1"
            required
            className="w-full border rounded p-2 bg-gray-700 text-white placeholder-gray-400"
          />
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-300">Start Time</label>
            <input
              type="datetime-local"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full border rounded p-2 bg-gray-700 text-white"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-300">End Time</label>
            <input
              type="datetime-local"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full border rounded p-2 bg-gray-700 text-white"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-bold hover:bg-indigo-700 transition-colors"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-sm font-semibold">{message}</p>}
    </div>
  );
}