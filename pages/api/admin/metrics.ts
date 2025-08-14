// pages/api/admin/metrics.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

const ALLOWED_ADMIN_IDS = ["558ab90b-6e5c-4376-a6d5-043683ed8fe5"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createServerSupabaseClient({ req, res });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ALLOWED_ADMIN_IDS.includes(user.id)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Fetch metrics
  const { count: userCount, error: userError } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { count: listingCount, error: listingError } = await supabase.from("market_listings").select("*", { count: "exact", head: true });
  const { count: eventCount, error: eventError } = await supabase.from("events").select("*", { count: "exact", head: true });
  
  if (userError || listingError || eventError) {
    return res.status(500).json({ error: "Failed to fetch metrics" });
  }

  return res.status(200).json({
    userCount,
    listingCount,
    eventCount,
  });
}