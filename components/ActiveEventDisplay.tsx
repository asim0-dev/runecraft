// components/ActiveEventDisplay.tsx
import { useEffect, useState } from "react";

interface EventData {
  id: string;
  name: string;
  description: string;
  bonus_type: string;
  bonus_value: number;
  start_time: string;
  end_time: string;
  created_at: string;
}

export default function ActiveEventDisplay() {
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveEvent = async () => {
      try {
        const res = await fetch("/api/events/active");
        if (!res.ok) throw new Error("Failed to fetch active event");
        const data = await res.json();
        if (data.active) {
          setEventData(data.event);
        } else {
          setEventData(null);
        }
      } catch (err) {
        console.error(err);
        setEventData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveEvent();
    const interval = setInterval(fetchActiveEvent, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-2 text-sm text-gray-500">
        Checking for active events…
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="p-2 text-sm text-gray-500">
        No active event at the moment.
      </div>
    );
  }

  return (
    <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg shadow-sm">
      <h2 className="text-lg font-bold text-yellow-800">
        🌟 {eventData.name}
      </h2>
      <p className="text-sm text-yellow-700">{eventData.description}</p>
      <p className="text-sm text-yellow-600">
        Bonus: <strong>{eventData.bonus_type} +{eventData.bonus_value}%</strong>
      </p>
      <p className="text-xs text-gray-500">
        Ends: {new Date(eventData.end_time).toLocaleString()}
      </p>
    </div>
  );
}